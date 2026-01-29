<?php
/**
 * Check Authentication Status API
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/session.php';

if (isLoggedIn()) {
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'user' => getCurrentUser()
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'authenticated' => false,
        'message' => 'Not authenticated'
    ]);
}
