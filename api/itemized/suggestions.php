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

    $stmt = $pdo->prepare('SELECT id FROM itemized_years WHERE year = ?');
    $stmt->execute([$year]);
    $yr = $stmt->fetch();
    if (!$yr) {
        echo json_encode(['success' => true, 'requestedBy' => [], 'payee' => [], 'glByRequestedBy' => (object)[]]);
        exit;
    }
    $yearId = $yr['id'];

    $stmt = $pdo->prepare('
        SELECT DISTINCT requested_by, payee, gl_code
        FROM itemized_transactions
        WHERE year_id = ? AND archived = 0 AND requested_by IS NOT NULL AND requested_by != ""
        ORDER BY dv_date DESC, id DESC
    ');
    $stmt->execute([$yearId]);
    $rows = $stmt->fetchAll();

    $requestedBySet = [];
    $payeeSet = [];
    $glByRequestedBy = [];
    foreach ($rows as $r) {
        $rb = trim((string)($r['requested_by'] ?? ''));
        $py = trim((string)($r['payee'] ?? ''));
        $gl = trim((string)($r['gl_code'] ?? ''));
        if ($rb && !in_array($rb, $requestedBySet)) $requestedBySet[] = $rb;
        if ($py && !in_array($py, $payeeSet)) $payeeSet[] = $py;
        if ($rb && $gl && !isset($glByRequestedBy[$rb])) $glByRequestedBy[$rb] = $gl;
    }
    sort($requestedBySet);
    sort($payeeSet);

    echo json_encode([
        'success' => true,
        'requestedBy' => $requestedBySet,
        'payee' => $payeeSet,
        'glByRequestedBy' => $glByRequestedBy,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
