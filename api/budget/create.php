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
    if ($budget <= 0) {
        throw new Exception('Budget must be greater than 0');
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
    $remainingPercent = $budget != 0 ? ($remainingAmount / $budget) * 100 : 0;

    $stmt = $pdo->prepare('INSERT INTO budget_entries (year_id, gl_code, account_title, actual, budget, remaining_amount, remaining_percent) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$yearId, $glCode, $accountTitle ?: $glCode, $actual, $budget, $remainingAmount, $remainingPercent]);
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
