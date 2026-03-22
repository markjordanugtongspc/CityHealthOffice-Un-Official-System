<?php
/**
 * Change password for the logged-in user
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
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

$current = $input['current_password'] ?? '';
$new = $input['new_password'] ?? '';

if ($current === '' || $new === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Current and new passwords are required']);
    exit;
}

if (strlen($new) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'New password must be at least 8 characters']);
    exit;
}

if ($new === $current) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'New password must differ from the current one']);
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
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    if (!password_verify($current, $row['password'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        exit;
    }

    $hash = password_hash($new, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
    $stmt->execute([$hash, $userId]);

    echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
} catch (Exception $e) {
    error_log('change-password.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Could not update password']);
}
