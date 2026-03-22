<?php
/**
 * Current user profile (self) — full row fields for settings page
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$userId = getCurrentUserId();
if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

try {
    $pdo = getDB();
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    $sqlFull = 'SELECT id, username, full_name, email, role, phone_number, date_of_birth, gender, bio_graphy, languages_spoken FROM users WHERE id = ? LIMIT 1';
    $sqlLegacy = 'SELECT id, username, full_name, email, role, phone_number, date_of_birth, gender, bio_graphy FROM users WHERE id = ? LIMIT 1';

    $user = null;
    try {
        $stmt = $pdo->prepare($sqlFull);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        if (stripos($e->getMessage(), 'languages_spoken') !== false) {
            $stmt = $pdo->prepare($sqlLegacy);
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                $user['languages_spoken'] = null;
            }
        } else {
            throw $e;
        }
    }

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    echo json_encode(['success' => true, 'user' => $user]);
} catch (Exception $e) {
    error_log('me.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
