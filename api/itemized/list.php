<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');

    $year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');
    if ($year < 2000 || $year > 2100) $year = (int)date('Y');

    $stmt = $pdo->prepare('SELECT id FROM itemized_years WHERE year = ?');
    $stmt->execute([$year]);
    $yr = $stmt->fetch();
    if (!$yr) {
        $pdo->prepare('INSERT INTO itemized_years (year) VALUES (?)')->execute([$year]);
        $yearId = $pdo->lastInsertId();
    } else {
        $yearId = $yr['id'];
    }

    $stmt = $pdo->prepare('
        SELECT id, gl_code, dv_date, dv_no, requested_by, payee, check_amount,
            particulars, check_no, file_date, mooe, spf, mcp_facility,
            konsulta_facility, konsulta_pf, archived
        FROM itemized_transactions
        WHERE year_id = ? AND archived = 0
        ORDER BY dv_date DESC, id DESC
    ');
    $stmt->execute([$yearId]);
    $rows = $stmt->fetchAll();

    $out = [];
    foreach ($rows as $r) {
        $out[] = [
            'id' => (int)$r['id'],
            'glCode' => $r['gl_code'],
            'dvDate' => $r['dv_date'],
            'dvNo' => $r['dv_no'],
            'requestedBy' => $r['requested_by'],
            'payee' => $r['payee'],
            'checkAmount' => (float)$r['check_amount'],
            'particulars' => $r['particulars'],
            'checkNo' => $r['check_no'],
            'fileDate' => $r['file_date'],
            'mooe' => $r['mooe'] ?? '',
            'spf' => $r['spf'] ?? '',
            'mcpFacility' => $r['mcp_facility'] ?? '',
            'konsultaFacility' => $r['konsulta_facility'] ?? '',
            'konsultaPf' => $r['konsulta_pf'] ?? '',
        ];
    }

    echo json_encode(['success' => true, 'data' => $out]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
