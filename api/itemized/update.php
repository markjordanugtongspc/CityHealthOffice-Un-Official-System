<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $pdo = getDB();
    if (!$pdo)
        throw new Exception('Database connection failed');

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int) ($input['id'] ?? 0);
    if (!$id)
        throw new Exception('Transaction ID is required');

    $fields = [
        'gl_code' => 'glCode',
        'dv_date' => 'dvDate',
        'dv_no' => 'dvNo',
        'requested_by' => 'requestedBy',
        'payee' => 'payee',
        'check_amount' => 'checkAmount',
        'particulars' => 'particulars',
        'check_no' => 'checkNo',
        'file_date' => 'fileDate',
        'mooe' => 'mooe',
        'spf' => 'spf',
        'mcp_facility' => 'mcpFacility',
        'konsulta_facility' => 'konsultaFacility',
        'konsulta_pf' => 'konsultaPf',
        'remarks' => 'remarks',
    ];
    $updates = [];
    $params = [];
    foreach ($fields as $col => $key) {
        $camel = $key;
        $snake = $col;
        $v = $input[$camel] ?? $input[$snake] ?? null;
        if ($v === null)
            continue;
        if (in_array($col, ['check_amount', 'mooe', 'spf', 'mcp_facility', 'konsulta_facility', 'konsulta_pf'])) {
            $v = $v === '' ? 0 : (float) $v;
        } else {
            $v = is_string($v) ? trim($v) : $v;
        }
        $updates[] = "`$col` = ?";
        $params[] = $v;
    }
    if (empty($updates))
        throw new Exception('No fields to update');

    $params[] = $id;
    $sql = 'UPDATE itemized_transactions SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'message' => 'Transaction updated']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
