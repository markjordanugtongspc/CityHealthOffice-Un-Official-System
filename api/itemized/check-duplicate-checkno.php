<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

try {
    $pdo = getDB();
    if (!$pdo)
        throw new Exception('Database connection failed');

    $checkNo = isset($_GET['checkNo']) ? trim($_GET['checkNo']) : '';
    if ($checkNo === '') {
        echo json_encode(['success' => true, 'exists' => false]);
        exit;
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM itemized_transactions WHERE check_no = ? AND archived = 0');
    $stmt->execute([$checkNo]);
    $count = $stmt->fetchColumn();

    echo json_encode(['success' => true, 'exists' => $count > 0]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
