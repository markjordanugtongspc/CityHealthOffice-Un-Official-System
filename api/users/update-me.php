<?php
/**
 * Update current user's own profile (not role/username)
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

$userId = getCurrentUserId();
if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

$fullName = trim($input['full_name'] ?? '');
$email = trim($input['email'] ?? '');

if ($fullName === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Full name is required']);
    exit;
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Valid email is required']);
    exit;
}

$phoneNumber = null;
if (isset($input['phone_number']) && $input['phone_number'] !== null && $input['phone_number'] !== '') {
    $digits = preg_replace('/\D+/', '', (string) $input['phone_number']);
    if ($digits !== '') {
        if ($digits[0] === '9') {
            $digits = '0' . $digits;
        }
        $phoneNumber = $digits;
    }
}

$dob = isset($input['date_of_birth']) ? ($input['date_of_birth'] ?: null) : null;
$gender = isset($input['gender']) ? (trim((string) $input['gender']) ?: null) : null;
$bio = isset($input['bio_graphy']) ? (trim((string) $input['bio_graphy']) ?: null) : null;
$languagesSpoken = isset($input['languages_spoken'])
    ? (trim((string) $input['languages_spoken']) ?: null)
    : null;
if ($languagesSpoken !== null && strlen($languagesSpoken) > 500) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Languages field is too long (max 500 characters)']);
    exit;
}

try {
    $pdo = getDB();
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    $stmt = $pdo->prepare('SELECT username FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    $username = $row['username'];

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1');
    $stmt->execute([$email, $userId]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email is already used by another account']);
        exit;
    }

    try {
        $stmt = $pdo->prepare(
            'UPDATE users SET full_name = ?, email = ?, phone_number = ?, date_of_birth = ?, gender = ?, bio_graphy = ?, languages_spoken = ? WHERE id = ?'
        );
        $stmt->execute([$fullName, $email, $phoneNumber, $dob, $gender, $bio, $languagesSpoken, $userId]);
    } catch (PDOException $updEx) {
        if (stripos($updEx->getMessage(), 'languages_spoken') !== false) {
            $stmt = $pdo->prepare(
                'UPDATE users SET full_name = ?, email = ?, phone_number = ?, date_of_birth = ?, gender = ?, bio_graphy = ? WHERE id = ?'
            );
            $stmt->execute([$fullName, $email, $phoneNumber, $dob, $gender, $bio, $userId]);
        } else {
            throw $updEx;
        }
    }

    $_SESSION['full_name'] = $fullName;
    $_SESSION['email'] = $email;

    echo json_encode([
        'success' => true,
        'message' => 'Profile saved',
        'user' => [
            'id' => (int) $userId,
            'username' => $username,
            'full_name' => $fullName,
            'email' => $email,
            'role' => $_SESSION['role'] ?? null,
            'phone_number' => $phoneNumber,
            'date_of_birth' => $dob,
            'gender' => $gender,
            'bio_graphy' => $bio,
            'languages_spoken' => $languagesSpoken,
        ],
    ]);
} catch (Exception $e) {
    error_log('update-me.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Could not save profile']);
}
