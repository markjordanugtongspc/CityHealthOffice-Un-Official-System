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
    if (!$pdo) throw new Exception('Database connection failed');

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
    if (!$id) throw new Exception('Entry ID is required');

    $updates = [];
    $params = [];

    if (isset($input['accountTitle']) || isset($input['account_title'])) {
        $v = trim($input['accountTitle'] ?? $input['account_title'] ?? '');
        $updates[] = 'account_title = ?';
        $params[] = $v;
    }
    // We no longer accept manual "actual" updates here; Actual is derived from monthly_expenses.
    if (array_key_exists('budget', $input)) {
        $v = (float)$input['budget'];
        $updates[] = 'budget = ?';
        $params[] = $v;
    }
    if (isset($input['glCode']) || isset($input['gl_code'])) {
        $v = trim($input['glCode'] ?? $input['gl_code'] ?? '');
        $updates[] = 'gl_code = ?';
        $params[] = $v;
    }

    if (empty($updates)) {
        throw new Exception('No fields to update');
    }

    $stmt = $pdo->prepare('SELECT budget, actual FROM budget_entries WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) throw new Exception('Entry not found');

    // Keep remaining_* fields loosely in sync based on stored actual (for completeness),
    // but the API consumers recompute from monthly_expenses on read, so this is secondary.
    $budget = array_key_exists('budget', $input) ? (float)$input['budget'] : (float)$row['budget'];
    $actual = (float)$row['actual'];
    $remainingAmount = $budget - $actual;
    $remainingPercent = $budget != 0 ? ($remainingAmount / $budget) * 100 : 0;

    $updates[] = 'remaining_amount = ?';
    $params[] = $remainingAmount;
    $updates[] = 'remaining_percent = ?';
    $params[] = $remainingPercent;
    $params[] = $id;

    $sql = 'UPDATE budget_entries SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'message' => 'Entry updated']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
