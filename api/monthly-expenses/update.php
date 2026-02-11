<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($input['id'] ?? 0);
    if (!$id) throw new Exception('Entry ID is required');

    $updates = [];
    $params = [];

    if (isset($input['accountTitle']) || isset($input['account_title'])) {
        $updates[] = 'account_title = ?';
        $params[] = trim($input['accountTitle'] ?? $input['account_title'] ?? '');
    }
    $monthCols = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    $months = $input['months'] ?? [];
    foreach ($monthCols as $m) {
        if (array_key_exists($m, $months)) {
            $updates[] = "`$m` = ?";
            $params[] = (float)$months[$m];
        }
    }

    if (!empty($updates)) {
        $stmt = $pdo->prepare('SELECT january, february, march, april, may, june, july, august, september, october, november, december FROM monthly_expenses_entries WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) throw new Exception('Entry not found');

        foreach ($monthCols as $m) {
            $row[$m] = array_key_exists($m, $months) ? (float)$months[$m] : (float)$row[$m];
        }
        $total = array_sum(array_values($row));
        $updates[] = 'total = ?';
        $params[] = $total;
    }

    $params[] = $id;
    $sql = 'UPDATE monthly_expenses_entries SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'message' => 'Entry updated']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
