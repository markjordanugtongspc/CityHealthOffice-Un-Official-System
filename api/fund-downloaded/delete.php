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

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON payload']);
        exit;
    }

    $id = isset($input['id']) ? (int)$input['id'] : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Entry ID is required']);
        exit;
    }

    $stmt = $pdo->prepare('DELETE FROM fund_downloaded_entries WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'Entry not found or already deleted']);
        exit;
    }

    echo json_encode(['success' => true, 'message' => 'Entry deleted successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
