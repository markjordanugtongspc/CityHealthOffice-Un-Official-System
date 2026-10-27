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

    $stmt = $pdo->prepare('
        SELECT be.id, be.account_id, at.gl_code, at.account_title, be.actual, be.budget
        FROM budget_entries be
        INNER JOIN account_titles at ON be.account_id = at.id
        WHERE be.id = ?
    ');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) throw new Exception('Entry not found');

    $glCode = isset($input['glCode']) || isset($input['gl_code'])
        ? trim($input['glCode'] ?? $input['gl_code'] ?? '')
        : $row['gl_code'];

    $accountId = (int)$row['account_id'];
    $accountTitle = $row['account_title'];

    if (!empty($glCode) && $glCode !== $row['gl_code']) {
        $stmtAt = $pdo->prepare('SELECT id, gl_code, account_title FROM account_titles WHERE gl_code = ? LIMIT 1');
        $stmtAt->execute([$glCode]);
        $atRow = $stmtAt->fetch();
        if ($atRow) {
            $accountId = (int)$atRow['id'];
            $glCode = $atRow['gl_code'];
            $accountTitle = $atRow['account_title'];
        }
    }

    $actual = array_key_exists('actual', $input)
        ? (float)$input['actual']
        : (float)$row['actual'];

    $budget = array_key_exists('budget', $input)
        ? (float)$input['budget']
        : (float)$row['budget'];

    $remainingAmount = $budget - $actual;

    $stmt = $pdo->prepare('
        UPDATE budget_entries
        SET account_id = ?, actual = ?, budget = ?, remaining_amount = ?
        WHERE id = ?
    ');
    $stmt->execute([$accountId, $actual, $budget, $remainingAmount, $id]);

    echo json_encode([
        'success' => true,
        'message' => 'Entry updated',
        'data' => [
            'id' => $id,
            'accountId' => $accountId,
            'glCode' => $glCode,
            'accountTitle' => $accountTitle,
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

