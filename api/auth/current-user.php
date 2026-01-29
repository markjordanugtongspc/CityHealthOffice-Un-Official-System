<?php
/**
 * Get Current User API Endpoint
 * Returns current logged-in user data including role
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/session.php';

if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'authenticated' => false,
        'message' => 'Not authenticated'
    ]);
    exit;
}

$user = getCurrentUser();
echo json_encode([
    'success' => true,
    'user' => $user
]);
