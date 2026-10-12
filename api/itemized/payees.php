<?php
// START: payees.php - Returns distinct payees from transactions table
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');

    $stmt = $pdo->query('
        SELECT DISTINCT payee 
        FROM transactions 
        WHERE payee IS NOT NULL AND TRIM(payee) != "" 
        ORDER BY payee ASC
    ');
    $payees = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'success' => true,
        'payees' => $payees
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
// END: payees.php
