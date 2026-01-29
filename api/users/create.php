<?php
/**
 * Create User API Endpoint
 * Handles user creation with password hashing
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

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

    // Validate required fields
    $required = ['username', 'full_name', 'email', 'role'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            throw new Exception("Field '{$field}' is required");
        }
    }

    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Validate username length
    if (strlen($input['username']) < 3) {
        throw new Exception('Username must be at least 3 characters');
    }

    // Validate role
    $validRoles = ['Administrator', 'CEO', 'Manager', 'Workmate', 'Staff'];
    if (!in_array($input['role'], $validRoles)) {
        throw new Exception('Invalid role');
    }

    // Check if username already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$input['username']]);
    if ($stmt->fetch()) {
        throw new Exception('Username already exists');
    }

    // Check if email already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$input['email']]);
    if ($stmt->fetch()) {
        throw new Exception('Email already exists');
    }

    // Hash password (default password: mjUgtong2026!)
    $defaultPassword = 'mjUgtong2026!';
    $hashedPassword = password_hash($defaultPassword, PASSWORD_DEFAULT);

    // Normalize phone number: ensure leading 0 is stored when needed
    $phoneNumber = null;
    if (isset($input['phone_number']) && $input['phone_number'] !== null && $input['phone_number'] !== '') {
        $rawPhone = (string)$input['phone_number'];
        $digits = preg_replace('/\D+/', '', $rawPhone);
        if ($digits !== '') {
            if ($digits[0] === '9') {
                // UI sends 9XXXXXXX, store as 09XXXXXXX
                $digits = '0' . $digits;
            }
            $phoneNumber = $digits;
        }
    }

    // Prepare date of birth (convert from MM/DD/YYYY to YYYY-MM-DD)
    $dateOfBirth = null;
    if (!empty($input['date_of_birth'])) {
        $dateParts = explode('/', $input['date_of_birth']);
        if (count($dateParts) === 3) {
            $dateOfBirth = sprintf('%s-%s-%s', $dateParts[2], $dateParts[0], $dateParts[1]);
        }
    }

    // Insert user
    $sql = 'INSERT INTO users (
        username, password, full_name, email, role,
        phone_number, date_of_birth, gender, bio_graphy,
        home_address, languages, religion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $input['username'],
        $hashedPassword,
        $input['full_name'],
        $input['email'],
        $input['role'],
        $phoneNumber,
        $dateOfBirth,
        $input['gender'] ?? null,
        $input['bio_graphy'] ?? null,
        $input['home_address'] ?? null,
        $input['languages'] ?? null,
        $input['religion'] ?? null,
    ]);

    $userId = $pdo->lastInsertId();

    // Fetch created user
    $stmt = $pdo->prepare('SELECT id, username, full_name, email, role, created_at FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'message' => 'User created successfully',
        'user' => $user,
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
}
