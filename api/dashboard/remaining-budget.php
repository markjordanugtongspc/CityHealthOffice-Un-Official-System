<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';
requireAuth(true);

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');
    $year    = (int)($_GET['year']    ?? date('Y'));
    if ($year < 2000 || $year > 2100) $year = (int)date('Y');
    $program = trim($_GET['program']  ?? 'all');

    $months    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    $monthCols = ['january','february','march','april','may','june',
                  'july','august','september','october','november','december'];

    $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_years WHERE year = ?');
    $stmt->execute([$year]);
    $meYr = $stmt->fetch();

    $stmt = $pdo->prepare('SELECT id FROM budget_years WHERE year = ?');
    $stmt->execute([$year]);
    $bYr = $stmt->fetch();

    $remaining = array_fill(0, 12, 0);
    $monthlySpent = array_fill(0, 12, 0);
    $totalBudget = 0;

    if ($bYr) {
        $budgetYearId = $bYr['id'];
        $stmt = $pdo->prepare('SELECT SUM(budget) AS tb FROM budget_entries WHERE year_id = ?');
        $stmt->execute([$budgetYearId]);
        $totalBudget = (float)($stmt->fetchColumn() ?: 0);
    }

    if ($meYr) {
        $meYearId = $meYr['id'];
        $cols = implode(', ', array_map(fn($c) => "COALESCE(SUM($c), 0) AS $c", $monthCols));
        $stmt = $pdo->prepare("SELECT $cols FROM monthly_expenses_entries WHERE year_id = ?");
        $stmt->execute([$meYearId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
        foreach ($monthCols as $i => $col) {
            $monthlySpent[$i] = (float)($row[$col] ?? 0);
        }
    }

    $monthlyAllocation = $totalBudget > 0 ? ($totalBudget / 12) : 0;
    for ($i = 0; $i < 12; $i++) {
        $remaining[$i] = round($monthlyAllocation - $monthlySpent[$i]);
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'months'      => $months,
            'remaining'   => $remaining,
            'spent'       => array_map('round', $monthlySpent),
            'allocation'  => round($monthlyAllocation),
            'totalBudget' => round($totalBudget),
            'label'       => 'Remaining Budget ' . $year . ($program !== 'all' ? ' (' . strtoupper($program) . ')' : ''),
            'year'        => $year,
            'program'     => $program,
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
