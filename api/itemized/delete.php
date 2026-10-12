<?php
// START: delete.php - Deletes a transaction from transactions table
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
    if ($id <= 0) {
        throw new Exception('Transaction ID is required.');
    }

    $stmt = $pdo->prepare('DELETE FROM transactions WHERE id = ?');
    $stmt->execute([$id]);

    echo json_encode(['success' => true, 'message' => 'Daily expense transaction deleted successfully.']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
// END: delete.php
