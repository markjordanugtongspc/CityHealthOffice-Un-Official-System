<?php
/**
 * Update User API Endpoint
 * Updates user data in database
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $pdo = getDB();
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    $username = trim($input['username'] ?? '');
    $fullName = trim($input['full_name'] ?? '');
    $email = trim($input['email'] ?? '');

    // Validation
    if (empty($username)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Username is required'
        ]);
        exit;
    }

    if (empty($fullName)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Full name is required'
        ]);
        exit;
    }

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Valid email is required'
        ]);
        exit;
    }

    // Check if user exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $existingUser = $stmt->fetch();

    if (!$existingUser) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }

    // Check if email is already taken by another user
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND username != ? LIMIT 1');
    $stmt->execute([$email, $username]);
    $emailTaken = $stmt->fetch();

    if ($emailTaken) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email is already taken by another user'
        ]);
        exit;
    }

    // Prepare update data
    $updateFields = [];
    $updateParams = [];

    $updateFields[] = 'full_name = ?';
    $updateParams[] = $fullName;

    $updateFields[] = 'email = ?';
    $updateParams[] = $email;

    // Role update with permission check
    if (isset($input['role'])) {
        $newRole = trim($input['role']);
        
        // Define role hierarchy and order
        $roleHierarchy = [
            'Administrator' => ['Administrator', 'CEO', 'Manager', 'Staff', 'Workmate'],
            'CEO' => ['CEO', 'Manager', 'Staff', 'Workmate'],
            'Manager' => ['Manager', 'Staff', 'Workmate'],
        ];

        $roleOrder = [
            'Administrator' => 1,
            'CEO' => 2,
            'Manager' => 3,
            'Staff' => 4,
            'Workmate' => 5,
        ];

        $allowedRoles = $roleHierarchy[$currentUser['role']] ?? [];
        
        if (!in_array($newRole, $allowedRoles)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => "You don't have permission to assign the role \"{$newRole}\""
            ]);
            exit;
        }

        // Get current role of user being edited
        $stmt = $pdo->prepare('SELECT role FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $targetUser = $stmt->fetch();
        
        if ($targetUser) {
            $currentUserRoleLevel = $roleOrder[$currentUser['role']] ?? 999;
            $newRoleLevel = $roleOrder[$newRole] ?? 999;
            $targetUserRoleLevel = $roleOrder[$targetUser['role']] ?? 999;

            // Prevent changing to a role higher than current user's role
            if ($newRoleLevel < $currentUserRoleLevel) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => "You cannot assign a role higher than your own ({$currentUser['role']})"
                ]);
                exit;
            }

            // Prevent changing a user who has a higher role than current user
            if ($targetUserRoleLevel < $currentUserRoleLevel) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => "You cannot modify users with a higher role than yours ({$targetUser['role']})"
                ]);
                exit;
            }
        }

        $updateFields[] = 'role = ?';
        $updateParams[] = $newRole;
    }

    // Optional fields
    if (isset($input['phone_number'])) {
        $phoneNumber = null;
        if ($input['phone_number'] !== null && $input['phone_number'] !== '') {
            $rawPhone = (string)$input['phone_number'];
            $digits = preg_replace('/\D+/', '', $rawPhone);
            if ($digits !== '') {
                if ($digits[0] === '9') {
                    $digits = '0' . $digits;
                }
                $phoneNumber = $digits;
            }
        }
        $updateFields[] = 'phone_number = ?';
        $updateParams[] = $phoneNumber;
    }

    if (isset($input['date_of_birth'])) {
        $updateFields[] = 'date_of_birth = ?';
        $updateParams[] = $input['date_of_birth'] ?: null;
    }

    if (isset($input['gender'])) {
        $updateFields[] = 'gender = ?';
        $updateParams[] = $input['gender'] ?: null;
    }

    if (isset($input['bio_graphy'])) {
        $updateFields[] = 'bio_graphy = ?';
        $updateParams[] = $input['bio_graphy'] ?: null;
    }

    // Add username for WHERE clause
    $updateParams[] = $username;

    // Update user
    $sql = 'UPDATE users SET ' . implode(', ', $updateFields) . ' WHERE username = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($updateParams);

    echo json_encode([
        'success' => true,
        'message' => 'User updated successfully'
    ]);

} catch (Exception $e) {
    error_log('Update user error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while updating user'
    ]);
}
