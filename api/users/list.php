<?php
/**
 * List Users API Endpoint
 * Returns paginated list of users
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

try {
    $pdo = getDB();
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    // Get all users (for now, pagination can be added later)
    $stmt = $pdo->query('SELECT id, username, full_name, email, role, created_at FROM users ORDER BY created_at DESC');
    $users = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'users' => $users,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'users' => [],
    ]);
}
