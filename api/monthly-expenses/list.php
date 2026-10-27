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
        $titlesStmt = $pdo->query('SELECT id FROM account_titles ORDER BY display_order ASC, id ASC');
        $titles = $titlesStmt ? $titlesStmt->fetchAll() : [];
        if ($titles) {
            $insert = $pdo->prepare('INSERT IGNORE INTO budget_entries (year_id, account_id, actual, budget, remaining_amount) VALUES (?, ?, 0, 0, 0)');
            foreach ($titles as $t) {
                $insert->execute([$budgetYearId, $t['id']]);
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

    // Fetch all budget_entries for year (dynamically joined with master account_titles)
    $stmt = $pdo->prepare('
        SELECT be.id AS budget_id,
               be.account_id,
               at.gl_code,
               at.account_title,
               at.category
        FROM budget_entries be
        INNER JOIN account_titles at ON be.account_id = at.id
        WHERE be.year_id = ?
        ORDER BY at.display_order ASC, CAST(at.gl_code AS UNSIGNED) ASC, at.gl_code ASC
    ');
    $stmt->execute([$budgetYearId]);
    $budgetRows = $stmt->fetchAll();
    $budgetAccountIds = array_column($budgetRows, 'account_id');

    $stmt = $pdo->prepare('
        SELECT me.id,
               me.account_id,
               at.gl_code,
               at.account_title,
               me.january, me.february, me.march, me.april, me.may, me.june,
               me.july, me.august, me.september, me.october, me.november, me.december, me.total
        FROM monthly_expenses_entries me
        INNER JOIN account_titles at ON me.account_id = at.id
        WHERE me.year_id = ?
    ');
    $stmt->execute([$monthlyYearId]);
    $monthlyMap = [];
    $monthlyOnly = [];
    while ($r = $stmt->fetch()) {
        $monthlyMap[$r['account_id']] = $r;
        if (!in_array($r['account_id'], $budgetAccountIds)) {
            $monthlyOnly[] = $r;
        }
    }

    $out = [];
    $monthCols = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    foreach ($budgetRows as $b) {
        $me = $monthlyMap[$b['account_id']] ?? null;
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
            'accountId' => (int)$b['account_id'],
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
