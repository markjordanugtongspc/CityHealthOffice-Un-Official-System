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

    // Get or create year
    $stmt = $pdo->prepare('SELECT id FROM budget_years WHERE year = ?');
    $stmt->execute([$year]);
    $yearRow = $stmt->fetch();
    if (!$yearRow) {
        $pdo->prepare('INSERT INTO budget_years (year) VALUES (?)')->execute([$year]);
        $yearId = $pdo->lastInsertId();
    } else {
        $yearId = $yearRow['id'];
    }

    // Auto-initialize budget entries for this year from master account_titles
    $stmt = $pdo->prepare('SELECT COUNT(*) AS c FROM budget_entries WHERE year_id = ?');
    $stmt->execute([$yearId]);
    $countRow = $stmt->fetch();
    $existingCount = (int)($countRow['c'] ?? 0);

    if ($existingCount === 0) {
        // Create one budget row per account title, with zero amounts.
        $titlesStmt = $pdo->query('SELECT gl_code, account_title FROM account_titles ORDER BY display_order ASC, gl_code ASC');
        $titles = $titlesStmt ? $titlesStmt->fetchAll() : [];

        if ($titles) {
            $insert = $pdo->prepare('
                INSERT INTO budget_entries (year_id, gl_code, account_title, actual, budget, remaining_amount, remaining_percent)
                VALUES (?, ?, ?, 0, 0, 0, 0)
            ');
            foreach ($titles as $t) {
                $insert->execute([$yearId, $t['gl_code'], $t['account_title']]);
            }
        }
    }

    // Find matching monthly_expenses year (if any) for this calendar year
    $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_years WHERE year = ?');
    $stmt->execute([$year]);
    $my = $stmt->fetch();
    $monthlyYearId = $my['id'] ?? null;

    // Load all budget rows for this year; Actual will be computed from monthly_expenses
    $stmt = $pdo->prepare('
        SELECT id, gl_code, account_title, budget
        FROM budget_entries
        WHERE year_id = ?
        ORDER BY gl_code
    ');
    $stmt->execute([$yearId]);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$r) {
        $actual = 0.0;
        if ($monthlyYearId) {
            $stmt2 = $pdo->prepare('
                SELECT
                    january + february + march + april + may + june +
                    july + august + september + october + november + december AS tot
                FROM monthly_expenses_entries
                WHERE year_id = ? AND gl_code = ?
            ');
            $stmt2->execute([$monthlyYearId, $r['gl_code']]);
            $me = $stmt2->fetch();
            $actual = (float)($me['tot'] ?? 0);
        }

        $budget = (float)($r['budget'] ?? 0);
        $remainingAmount = $budget - $actual;
        $remainingPercent = $budget != 0 ? ($remainingAmount / $budget) * 100 : 0;

        // expose computed values; ignore stored actual/remaining_* in DB
        $r['actual'] = $actual;
        $r['remainingAmount'] = $remainingAmount;
        $r['remainingPercent'] = $remainingPercent;
    }

    echo json_encode(['success' => true, 'data' => $rows]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
