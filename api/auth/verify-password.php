<?php
/**
 * Verify current password (for settings UX before showing change-password fields)
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$password = $input['password'] ?? $input['current_password'] ?? '';

if ($password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'valid' => false, 'message' => 'Password is required']);
    exit;
}

$userId = getCurrentUserId();

try {
    $pdo = getDB();
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'valid' => false, 'message' => 'User not found']);
        exit;
    }

    $ok = password_verify($password, $row['password']);

    echo json_encode([
        'success' => true,
        'valid' => $ok,
        'message' => $ok ? 'Password verified' : 'Current password does not match',
    ]);
} catch (Exception $e) {
    error_log('verify-password.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'valid' => false, 'message' => 'Server error']);
}
