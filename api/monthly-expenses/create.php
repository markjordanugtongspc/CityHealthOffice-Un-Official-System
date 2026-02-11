<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $year = (int)($input['year'] ?? date('Y'));
    $glCode = trim($input['glCode'] ?? $input['gl_code'] ?? '');
    $accountTitle = trim($input['accountTitle'] ?? $input['account_title'] ?? '');
    $months = $input['months'] ?? [];

    if (empty($glCode) || empty($accountTitle)) {
        throw new Exception('G/L Code and Account Title are required');
    }

    $monthCols = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    $vals = [];
    foreach ($monthCols as $m) {
        $vals[$m] = (float)($months[$m] ?? 0);
    }
    $total = array_sum($vals);

    $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_years WHERE year = ?');
    $stmt->execute([$year]);
    $yr = $stmt->fetch();
    if (!$yr) {
        $pdo->prepare('INSERT INTO monthly_expenses_years (year) VALUES (?)')->execute([$year]);
        $yearId = $pdo->lastInsertId();
    } else {
        $yearId = $yr['id'];
    }

    $stmt = $pdo->prepare('
        INSERT INTO monthly_expenses_entries (year_id, gl_code, account_title, january, february, march, april, may, june,
            july, august, september, october, november, december, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $yearId, $glCode, $accountTitle,
        $vals['january'], $vals['february'], $vals['march'], $vals['april'], $vals['may'], $vals['june'],
        $vals['july'], $vals['august'], $vals['september'], $vals['october'], $vals['november'], $vals['december'],
        $total,
    ]);
    $id = $pdo->lastInsertId();

    echo json_encode(['success' => true, 'message' => 'Entry created', 'data' => ['id' => (int)$id]]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
