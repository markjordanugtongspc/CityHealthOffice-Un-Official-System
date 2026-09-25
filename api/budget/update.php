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

    $stmt = $pdo->prepare('SELECT id, gl_code, account_title, actual, budget FROM budget_entries WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) throw new Exception('Entry not found');

    $glCode = isset($input['glCode']) || isset($input['gl_code'])
        ? trim($input['glCode'] ?? $input['gl_code'] ?? '')
        : $row['gl_code'];

    $accountTitle = isset($input['accountTitle']) || isset($input['account_title'])
        ? trim($input['accountTitle'] ?? $input['account_title'] ?? '')
        : $row['account_title'];

    $actual = array_key_exists('actual', $input)
        ? (float)$input['actual']
        : (float)$row['actual'];

    $budget = array_key_exists('budget', $input)
        ? (float)$input['budget']
        : (float)$row['budget'];

    if (empty($glCode)) {
        throw new Exception('G/L Code is required');
    }

    $remainingAmount = $budget - $actual;

    $stmt = $pdo->prepare('
        UPDATE budget_entries
        SET gl_code = ?, account_title = ?, actual = ?, budget = ?, remaining_amount = ?
        WHERE id = ?
    ');
    $stmt->execute([$glCode, $accountTitle ?: $glCode, $actual, $budget, $remainingAmount, $id]);

    echo json_encode([
        'success' => true,
        'message' => 'Entry updated',
        'data' => [
            'id' => $id,
            'glCode' => $glCode,
            'accountTitle' => $accountTitle ?: $glCode,
            'actual' => $actual,
            'budget' => $budget,
            'remainingAmount' => $remainingAmount,
            'remainingPercent' => $budget != 0 ? ($remainingAmount / $budget) * 100 : 0,
        ]
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

