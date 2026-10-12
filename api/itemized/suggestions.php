<?php
// START: suggestions.php - Returns suggestions for payees, gl codes, and accounts
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');

    // Get distinct payees
    $stmtP = $pdo->query('
        SELECT DISTINCT payee 
        FROM transactions 
        WHERE payee IS NOT NULL AND TRIM(payee) != "" 
        ORDER BY payee ASC
    ');
    $payees = $stmtP->fetchAll(PDO::FETCH_COLUMN);

    // Get accounts/account_titles
    $stmtA = $pdo->query('
        SELECT id, gl_code, account_title 
        FROM account_titles 
        ORDER BY display_order ASC, gl_code ASC
    ');
    $accounts = $stmtA->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'payee' => $payees,
        'accounts' => $accounts,
        'requestedBy' => $payees
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
// END: suggestions.php
