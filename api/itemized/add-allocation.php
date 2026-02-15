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
    $dvDate = $input['dvDate'] ?? $input['dv_date'] ?? date('Y-m-d');
    $dvNo = trim($input['dvNo'] ?? $input['dv_no'] ?? '');
    $requestedBy = trim($input['requestedBy'] ?? $input['requested_by'] ?? '');
    $payee = trim($input['payee'] ?? '');
    $particulars = trim($input['particulars'] ?? '');
    $checkNo = trim($input['checkNo'] ?? $input['check_no'] ?? '');
    $fileDate = $input['fileDate'] ?? $input['file_date'] ?? $dvDate;
    $mooe = $input['mooe'] ?? '';
    $spf = $input['spf'] ?? '';
    $mcpFacility = $input['mcpFacility'] ?? $input['mcp_facility'] ?? '';
    $konsultaFacility = $input['konsultaFacility'] ?? $input['konsulta_facility'] ?? '';
    $konsultaPf = $input['konsultaPf'] ?? $input['konsulta_pf'] ?? '';

    if (empty($glCode) || empty($dvDate) || empty($dvNo) || empty($payee)) {
        throw new Exception('G/L Code, DV Date, DV No, and Payee are required');
    }

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
        INSERT INTO itemized_transactions (year_id, gl_code, dv_date, dv_no, requested_by, payee, check_amount,
            particulars, check_no, file_date, mooe, spf, mcp_facility, konsulta_facility, konsulta_pf)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?,
            ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $yearId, $glCode, $dvDate, $dvNo, $requestedBy, $payee,
        $particulars, $checkNo, $fileDate,
        $mooe !== '' ? (float)$mooe : 0, $spf !== '' ? (float)$spf : 0,
        $mcpFacility !== '' ? (float)$mcpFacility : 0,
        $konsultaFacility !== '' ? (float)$konsultaFacility : 0,
        $konsultaPf !== '' ? (float)$konsultaPf : 0,
    ]);
    $id = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Allocation log added',
        'data' => ['id' => (int)$id],
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
