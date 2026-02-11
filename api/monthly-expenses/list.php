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

    $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_years WHERE year = ?');
    $stmt->execute([$year]);
    $yr = $stmt->fetch();
    if (!$yr) {
        $pdo->prepare('INSERT INTO monthly_expenses_years (year) VALUES (?)')->execute([$year]);
        $yearId = $pdo->lastInsertId();
    } else {
        $yearId = $yr['id'];
    }

    $stmt = $pdo->prepare('
        SELECT id, gl_code, account_title, january, february, march, april, may, june,
            july, august, september, october, november, december, total
        FROM monthly_expenses_entries
        WHERE year_id = ?
        ORDER BY gl_code
    ');
    $stmt->execute([$yearId]);
    $rows = $stmt->fetchAll();

    $out = [];
    foreach ($rows as $r) {
        $out[] = [
            'id' => (int)$r['id'],
            'glCode' => $r['gl_code'],
            'accountTitle' => $r['account_title'],
            'months' => [
                'january' => (float)$r['january'],
                'february' => (float)$r['february'],
                'march' => (float)$r['march'],
                'april' => (float)$r['april'],
                'may' => (float)$r['may'],
                'june' => (float)$r['june'],
                'july' => (float)$r['july'],
                'august' => (float)$r['august'],
                'september' => (float)$r['september'],
                'october' => (float)$r['october'],
                'november' => (float)$r['november'],
                'december' => (float)$r['december'],
            ],
            'total' => (float)$r['total'],
        ];
    }

    echo json_encode(['success' => true, 'data' => $out]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
