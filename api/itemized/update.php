<?php
// START: update.php - Updates an existing daily transaction entry in transactions table
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
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) {
        throw new Exception('Transaction ID is required.');
    }

    $stmt = $pdo->prepare('SELECT * FROM transactions WHERE id = ?');
    $stmt->execute([$id]);
    $existingTx = $stmt->fetch();
    if (!$existingTx) {
        throw new Exception('Transaction not found.');
    }

    $date = trim($input['date'] ?? $input['dvDate'] ?? $input['dv_date'] ?? $existingTx['date']);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $date = $existingTx['date'];
    }
    $year = (int)date('Y', strtotime($date));

    $glCode = trim($input['glCode'] ?? $input['gl_code'] ?? '');
    $accountId = isset($input['accountId']) ? (int)$input['accountId'] : (isset($input['account_id']) ? (int)$input['account_id'] : (int)$existingTx['account_id']);
    $payee = trim($input['payee'] ?? $existingTx['payee']);
    $amount = isset($input['amount']) ? (float)$input['amount'] : (isset($input['checkAmount']) ? (float)$input['checkAmount'] : (float)$existingTx['amount']);
    $dvNo = trim($input['dvNo'] ?? $input['dv_no'] ?? $existingTx['dv_no']);
    $checkNo = trim($input['checkNo'] ?? $input['check_no'] ?? $existingTx['check_no']);
    $description = trim($input['description'] ?? $input['particulars'] ?? $existingTx['description']);

    if (empty($payee)) {
        throw new Exception('Payee name is required.');
    }
    if ($amount <= 0) {
        throw new Exception('Amount must be greater than 0.');
    }

    // Resolve account_id if gl_code given
    if (!empty($glCode)) {
        $stmt = $pdo->prepare('SELECT id FROM accounts WHERE gl_code = ? LIMIT 1');
        $stmt->execute([$glCode]);
        $acc = $stmt->fetch();
        if ($acc) {
            $accountId = (int)$acc['id'];
        } else {
            $stmtAt = $pdo->prepare('SELECT id, gl_code, account_title, display_order FROM account_titles WHERE gl_code = ? LIMIT 1');
            $stmtAt->execute([$glCode]);
            $at = $stmtAt->fetch();
            if ($at) {
                $pdo->prepare('INSERT INTO accounts (id, gl_code, account_title, category, display_order) VALUES (?, ?, ?, "Expense", ?)')
                    ->execute([$at['id'], $at['gl_code'], $at['account_title'], $at['display_order']]);
                $accountId = (int)$at['id'];
            }
        }
    }

    $stmt = $pdo->prepare('
        UPDATE transactions SET
            account_id = ?,
            year = ?,
            date = ?,
            dv_no = ?,
            check_no = ?,
            payee = ?,
            amount = ?,
            description = ?
        WHERE id = ?
    ');
    $stmt->execute([
        $accountId,
        $year,
        $date,
        $dvNo,
        $checkNo,
        $payee,
        $amount,
        $description,
        $id
    ]);

    // Resync monthly expenses
    try {
        require_once __DIR__ . '/../monthly-expenses/sync-from-itemized.php';
    } catch (Exception $e) { /* ignore */ }

    echo json_encode([
        'success' => true,
        'message' => 'Daily expense entry updated successfully.'
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
// END: update.php
