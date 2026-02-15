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

    $groups = [];
    foreach ($rows as $r) {
        $key = $r['dv_no'] . '|' . $r['payee'] . '|' . $r['gl_code'];
        $checkAmt = (float)$r['check_amount'];
        if (!isset($groups[$key])) {
            $groups[$key] = [
                'id' => (int)$r['id'],
                'glCode' => $r['gl_code'],
                'dvDate' => $r['dv_date'],
                'dvNo' => $r['dv_no'],
                'requestedBy' => $r['requested_by'],
                'payee' => $r['payee'],
                'checkAmount' => $checkAmt,
                'particulars' => $r['particulars'],
                'checkNo' => $r['check_no'],
                'fileDate' => $r['file_date'],
                'mooe' => (float)($r['mooe'] ?? 0),
                'spf' => (float)($r['spf'] ?? 0),
                'mcpFacility' => (float)($r['mcp_facility'] ?? 0),
                'konsultaFacility' => (float)($r['konsulta_facility'] ?? 0),
                'konsultaPf' => (float)($r['konsulta_pf'] ?? 0),
            ];
        } else {
            $g = &$groups[$key];
            if ($checkAmt > 0 && $g['checkAmount'] <= 0) {
                $g['id'] = (int)$r['id'];
                $g['checkAmount'] = $checkAmt;
                $g['particulars'] = $r['particulars'];
                $g['checkNo'] = $r['check_no'];
                $g['fileDate'] = $r['file_date'];
                $g['dvDate'] = $r['dv_date'];
                $g['requestedBy'] = $r['requested_by'];
            }
            $g['mooe'] += (float)($r['mooe'] ?? 0);
            $g['spf'] += (float)($r['spf'] ?? 0);
            $g['mcpFacility'] += (float)($r['mcp_facility'] ?? 0);
            $g['konsultaFacility'] += (float)($r['konsulta_facility'] ?? 0);
            $g['konsultaPf'] += (float)($r['konsulta_pf'] ?? 0);
        }
    }

    $out = [];
    foreach ($groups as $g) {
        $out[] = [
            'id' => $g['id'],
            'glCode' => $g['glCode'],
            'dvDate' => $g['dvDate'],
            'dvNo' => $g['dvNo'],
            'requestedBy' => $g['requestedBy'],
            'payee' => $g['payee'],
            'checkAmount' => $g['checkAmount'],
            'particulars' => $g['particulars'],
            'checkNo' => $g['checkNo'],
            'fileDate' => $g['fileDate'],
            'mooe' => $g['mooe'],
            'spf' => $g['spf'],
            'mcpFacility' => $g['mcpFacility'],
            'konsultaFacility' => $g['konsultaFacility'],
            'konsultaPf' => $g['konsultaPf'],
        ];
    }

    echo json_encode(['success' => true, 'data' => $out]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
