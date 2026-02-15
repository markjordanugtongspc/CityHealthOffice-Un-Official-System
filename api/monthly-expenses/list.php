<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');

    $year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');
    if ($year < 2000 || $year > 2100) $year = (int)date('Y');

    // Ensure budget_years and budget_entries exist for this year (source of rows)
    $stmt = $pdo->prepare('SELECT id FROM budget_years WHERE year = ?');
    $stmt->execute([$year]);
    $byRow = $stmt->fetch();
    if (!$byRow) {
        $pdo->prepare('INSERT INTO budget_years (year) VALUES (?)')->execute([$year]);
        $budgetYearId = $pdo->lastInsertId();
    } else {
        $budgetYearId = $byRow['id'];
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) AS c FROM budget_entries WHERE year_id = ?');
    $stmt->execute([$budgetYearId]);
    $countRow = $stmt->fetch();
    if ((int)($countRow['c'] ?? 0) === 0) {
        $titlesStmt = $pdo->query('SELECT gl_code, account_title FROM account_titles ORDER BY display_order ASC, gl_code ASC');
        $titles = $titlesStmt ? $titlesStmt->fetchAll() : [];
        if ($titles) {
            $insert = $pdo->prepare('INSERT INTO budget_entries (year_id, gl_code, account_title, actual, budget, remaining_amount, remaining_percent) VALUES (?, ?, ?, 0, 0, 0, 0)');
            foreach ($titles as $t) {
                $insert->execute([$budgetYearId, $t['gl_code'], $t['account_title']]);
            }
        }
    }

    // Ensure monthly_expenses_years exists for sync data
    $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_years WHERE year = ?');
    $stmt->execute([$year]);
    $meYr = $stmt->fetch();
    if (!$meYr) {
        $pdo->prepare('INSERT INTO monthly_expenses_years (year) VALUES (?)')->execute([$year]);
        $monthlyYearId = $pdo->lastInsertId();
    } else {
        $monthlyYearId = $meYr['id'];
    }

    // Fetch all budget_entries for year (base rows)
    $stmt = $pdo->prepare('SELECT id AS budget_id, gl_code, account_title FROM budget_entries WHERE year_id = ? ORDER BY gl_code');
    $stmt->execute([$budgetYearId]);
    $budgetRows = $stmt->fetchAll();
    $budgetGlCodes = array_column($budgetRows, 'gl_code');

    $stmt = $pdo->prepare('
        SELECT id, gl_code, account_title, january, february, march, april, may, june,
            july, august, september, october, november, december, total
        FROM monthly_expenses_entries
        WHERE year_id = ?
    ');
    $stmt->execute([$monthlyYearId]);
    $monthlyMap = [];
    $monthlyOnly = [];
    while ($r = $stmt->fetch()) {
        $monthlyMap[$r['gl_code']] = $r;
        if (!in_array($r['gl_code'], $budgetGlCodes)) {
            $monthlyOnly[] = $r;
        }
    }

    $out = [];
    $monthCols = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    foreach ($budgetRows as $b) {
        $me = $monthlyMap[$b['gl_code']] ?? null;
        $months = [];
        $total = 0.0;
        foreach ($monthCols as $col) {
            $v = $me ? (float)$me[$col] : 0;
            $months[$col] = $v;
            $total += $v;
        }
        $out[] = [
            'id' => $me ? (int)$me['id'] : null,
            'budgetEntryId' => (int)$b['budget_id'],
            'glCode' => $b['gl_code'],
            'accountTitle' => $b['account_title'],
            'months' => $months,
            'total' => $total,
        ];
    }
    foreach ($monthlyOnly as $me) {
        $months = [];
        $total = 0.0;
        foreach ($monthCols as $col) {
            $v = (float)$me[$col];
            $months[$col] = $v;
            $total += $v;
        }
        $out[] = [
            'id' => (int)$me['id'],
            'budgetEntryId' => null,
            'glCode' => $me['gl_code'],
            'accountTitle' => $me['account_title'],
            'months' => $months,
            'total' => $total,
        ];
    }
    usort($out, fn($a, $b) => strcmp($a['glCode'], $b['glCode']));

    echo json_encode(['success' => true, 'data' => $out]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
