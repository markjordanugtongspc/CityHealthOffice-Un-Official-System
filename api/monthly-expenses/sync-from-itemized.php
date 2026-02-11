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

    $stmt = $pdo->prepare('SELECT id FROM itemized_years WHERE year = ?');
    $stmt->execute([$year]);
    $itYr = $stmt->fetch();
    if (!$itYr) {
        echo json_encode(['success' => true, 'message' => 'No itemized data for year', 'updated' => 0]);
        exit;
    }
    $itemizedYearId = $itYr['id'];

    $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_years WHERE year = ?');
    $stmt->execute([$year]);
    $meYr = $stmt->fetch();
    if (!$meYr) {
        $pdo->prepare('INSERT INTO monthly_expenses_years (year) VALUES (?)')->execute([$year]);
        $monthlyYearId = $pdo->lastInsertId();
    } else {
        $monthlyYearId = $meYr['id'];
    }

    $monthNumToCol = [1=>'january',2=>'february',3=>'march',4=>'april',5=>'may',6=>'june',7=>'july',8=>'august',9=>'september',10=>'october',11=>'november',12=>'december'];
    $allCols = array_values($monthNumToCol);

    $stmt = $pdo->prepare('
        SELECT gl_code, MONTH(dv_date) AS m, SUM(check_amount) AS tot
        FROM itemized_transactions
        WHERE year_id = ? AND archived = 0
        GROUP BY gl_code, MONTH(dv_date)
    ');
    $stmt->execute([$itemizedYearId]);
    $agg = [];
    while ($row = $stmt->fetch()) {
        $gl = $row['gl_code'];
        $m = (int)$row['m'];
        $tot = (float)$row['tot'];
        if (!isset($agg[$gl])) $agg[$gl] = array_fill_keys($allCols, 0);
        if (isset($monthNumToCol[$m])) $agg[$gl][$monthNumToCol[$m]] = $tot;
    }

    $stmtAt = $pdo->prepare('SELECT account_title FROM account_titles WHERE gl_code = ?');
    $updated = 0;
    foreach ($agg as $glCode => $months) {
        $stmtAt->execute([$glCode]);
        $at = $stmtAt->fetch();
        $accountTitle = $at['account_title'] ?? $glCode;

        $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_entries WHERE year_id = ? AND gl_code = ?');
        $stmt->execute([$monthlyYearId, $glCode]);
        $existing = $stmt->fetch();
        $total = array_sum($months);

        if ($existing) {
            $stmt = $pdo->prepare('
                UPDATE monthly_expenses_entries SET
                    january=?, february=?, march=?, april=?, may=?, june=?,
                    july=?, august=?, september=?, october=?, november=?, december=?,
                    total=?
                WHERE year_id=? AND gl_code=?
            ');
            $stmt->execute([
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

    echo json_encode(['success' => true, 'message' => 'Sync completed', 'updated' => $updated]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
