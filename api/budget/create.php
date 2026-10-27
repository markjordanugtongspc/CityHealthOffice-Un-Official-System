<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $year = (int)($input['year'] ?? $_GET['year'] ?? date('Y'));
    $glCode = trim($input['glCode'] ?? $input['gl_code'] ?? '');
    $accountTitle = trim($input['accountTitle'] ?? $input['account_title'] ?? '');
    $actual = (float)($input['actual'] ?? 0);
    $budget = (float)($input['budget'] ?? 0);

    if (empty($glCode)) {
        throw new Exception('G/L Code is required');
    }

    $stmt = $pdo->prepare('SELECT id FROM budget_years WHERE year = ?');
    $stmt->execute([$year]);
    $yr = $stmt->fetch();
    if (!$yr) {
        $pdo->prepare('INSERT INTO budget_years (year) VALUES (?)')->execute([$year]);
        $yearId = $pdo->lastInsertId();
    } else {
        $yearId = $yr['id'];
    }

    $remainingAmount = $budget - $actual;
    $stmtAt = $pdo->prepare('SELECT id, gl_code, account_title FROM account_titles WHERE gl_code = ? LIMIT 1');
    $stmtAt->execute([$glCode]);
    $atRow = $stmtAt->fetch();
    $accountId = $atRow ? (int)$atRow['id'] : null;
    if (!$accountId) {
        throw new Exception('Invalid G/L Code. Account Title does not exist in master list.');
    }

    $stmt = $pdo->prepare('INSERT INTO budget_entries (year_id, account_id, actual, budget, remaining_amount) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$yearId, $accountId, $actual, $budget, $remainingAmount]);
    $id = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Entry created',
        'data' => [
            'id' => (int)$id,
            'glCode' => $glCode,
            'accountTitle' => $accountTitle ?: $glCode,
            'actual' => $actual,
            'budget' => $budget,
            'remainingAmount' => $remainingAmount,
            'remainingPercent' => $remainingPercent,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

