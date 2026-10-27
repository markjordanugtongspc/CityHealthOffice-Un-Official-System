<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';
requireAuth(true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $year = (int)($input['year'] ?? $_GET['year'] ?? date('Y'));

    $stmt = $pdo->prepare('SELECT id FROM budget_years WHERE year = ?');
    $stmt->execute([$year]);
    $budgetYear = $stmt->fetch();
    if (!$budgetYear) {
        echo json_encode(['success' => true, 'message' => 'No budget year found for ' . $year, 'updated' => 0]);
        exit;
    }
    $budgetYearId = $budgetYear['id'];

    $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_years WHERE year = ?');
    $stmt->execute([$year]);
    $meYear = $stmt->fetch();
    if (!$meYear) {
        echo json_encode(['success' => true, 'message' => 'No monthly data for year ' . $year, 'updated' => 0]);
        exit;
    }
    $meYearId = $meYear['id'];

    $stmt = $pdo->prepare('SELECT account_id, total FROM monthly_expenses_entries WHERE year_id = ?');
    $stmt->execute([$meYearId]);
    $monthlyTotals = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    $updated = 0;
    foreach ($monthlyTotals as $accountId => $total) {
        $actual = (float)$total;
        $stmt = $pdo->prepare('SELECT id, budget FROM budget_entries WHERE year_id = ? AND account_id = ?');
        $stmt->execute([$budgetYearId, $accountId]);
        $entry = $stmt->fetch();
        if ($entry) {
            $budget = (float)$entry['budget'];
            $remaining = $budget - $actual;
            $pdo->prepare('
                UPDATE budget_entries
                SET actual = ?, remaining_amount = ?, updated_at = NOW()
                WHERE id = ?
            ')->execute([$actual, $remaining, $entry['id']]);
            $updated++;
        }
    }

    echo json_encode(['success' => true, 'message' => 'Sync complete', 'updated' => $updated]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
