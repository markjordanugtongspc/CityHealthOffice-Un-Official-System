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
                INSERT IGNORE INTO budget_entries (year_id, gl_code, account_title, actual, budget, remaining_amount)
                VALUES (?, ?, ?, 0, 0, 0)
            ');
            foreach ($titles as $t) {
                $insert->execute([$yearId, $t['gl_code'], $t['account_title']]);
            }
        }
    }

    // Load all budget rows for this year directly from budget_entries
    $stmt = $pdo->prepare('
        SELECT id, gl_code, account_title, actual, budget, remaining_amount
        FROM budget_entries
        WHERE year_id = ?
        ORDER BY gl_code
    ');
    $stmt->execute([$yearId]);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$r) {
        $actual = (float)($r['actual'] ?? 0);
        $budget = (float)($r['budget'] ?? 0);
        $remainingAmount = $budget - $actual;
        $remainingPercent = $budget != 0 ? ($remainingAmount / $budget) * 100 : 0;

        $r['actual'] = $actual;
        $r['budget'] = $budget;
        $r['remainingAmount'] = $remainingAmount;
        $r['remainingPercent'] = $remainingPercent;
    }

    echo json_encode(['success' => true, 'data' => $rows]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

