<?php
// START: sync-from-itemized - Synchronizes transactions table into monthly_expenses_entries
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

    $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_years WHERE year = ?');
    $stmt->execute([$year]);
    $meYr = $stmt->fetch();
    if (!$meYr) {
        $pdo->prepare('INSERT INTO monthly_expenses_years (year) VALUES (?)')->execute([$year]);
        $monthlyYearId = $pdo->lastInsertId();
    } else {
        $monthlyYearId = $meYr['id'];
    }

    $monthNumToCol = [
        1=>'january', 2=>'february', 3=>'march', 4=>'april',
        5=>'may', 6=>'june', 7=>'july', 8=>'august',
        9=>'september', 10=>'october', 11=>'november', 12=>'december'
    ];
    $allCols = array_values($monthNumToCol);

    // Query transactions for the specified year
    $stmt = $pdo->prepare('
        SELECT t.account_id, a.gl_code, a.account_title, t.date, t.amount
        FROM transactions t
        INNER JOIN accounts a ON t.account_id = a.id
        WHERE t.year = ?
    ');
    $stmt->execute([$year]);
    $agg = [];
    $accountTitles = [];

    while ($row = $stmt->fetch()) {
        $gl = $row['gl_code'];
        $amt = (float)$row['amount'];
        $accountTitles[$gl] = $row['account_title'];
        $month = (int)date('n', strtotime($row['date']));
        if ($month < 1 || $month > 12) $month = 1;

        if (!isset($agg[$gl])) {
            $agg[$gl] = array_fill_keys($allCols, 0);
        }
        $col = $monthNumToCol[$month];
        $agg[$gl][$col] += $amt;
    }

    $updated = 0;
    foreach ($agg as $glCode => $months) {
        $accountTitle = $accountTitles[$glCode] ?? $glCode;
        $total = array_sum($months);

        $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_entries WHERE year_id = ? AND gl_code = ?');
        $stmt->execute([$monthlyYearId, $glCode]);
        $existing = $stmt->fetch();

        if ($existing) {
            $stmt = $pdo->prepare('
                UPDATE monthly_expenses_entries SET
                    account_title=?,
                    january=?, february=?, march=?, april=?, may=?, june=?,
                    july=?, august=?, september=?, october=?, november=?, december=?,
                    total=?
                WHERE year_id=? AND gl_code=?
            ');
            $stmt->execute([
                $accountTitle,
                $months['january'], $months['february'], $months['march'], $months['april'], $months['may'], $months['june'],
                $months['july'], $months['august'], $months['september'], $months['october'], $months['november'], $months['december'],
                $total, $monthlyYearId, $glCode,
            ]);
        } else {
            $stmt = $pdo->prepare('
                INSERT INTO monthly_expenses_entries (year_id, gl_code, account_title, january, february, march, april, may, june, july, august, september, october, november, december, total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $monthlyYearId, $glCode, $accountTitle,
                $months['january'], $months['february'], $months['march'], $months['april'], $months['may'], $months['june'],
                $months['july'], $months['august'], $months['september'], $months['october'], $months['november'], $months['december'],
                $total,
            ]);
        }
        $updated++;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Monthly expenses synchronized successfully',
        'updated' => $updated
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
// END: sync-from-itemized
