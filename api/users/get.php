<?php
/**
 * Get User by Username API Endpoint
 * Returns user data for editing
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

// Require authentication and admin role
requireAuth(true);

$currentUser = getCurrentUser();
$allowedRoles = ['Administrator', 'CEO', 'Manager'];

if (!in_array($currentUser['role'], $allowedRoles)) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Access denied'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$username = $_GET['username'] ?? '';

if (empty($username)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Username is required'
    ]);
    exit;
}

try {
    $pdo = getDB();
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    $stmt = $pdo->prepare('SELECT id, username, full_name, email, role, phone_number, date_of_birth, gender, bio_graphy FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'user' => $user,
        'current_user_role' => $currentUser['role'] // Include current user role for frontend validation
    ]);

} catch (Exception $e) {
    error_log('Get user error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching user data'
    ]);
}
