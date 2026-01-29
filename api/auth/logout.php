<?php
/**
 * Logout API Endpoint
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/session.php';

clearUserSession();

echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);
