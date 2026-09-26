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

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON payload']);
        exit;
    }

    $id = isset($input['id']) ? (int)$input['id'] : null;
    $field = trim($input['field'] ?? '');
    $value = isset($input['value']) ? (float)$input['value'] : 0.0;

    $monthCols = ['january','february','march','april','may','june','july','august','september','october','november','december'];

    if ($id && in_array(strtolower($field), $monthCols)) {
        $col = strtolower($field);
        $stmt = $pdo->prepare("UPDATE fund_downloaded_entries SET `$col` = ? WHERE id = ?");
        $stmt->execute([$value, $id]);

        // Recalculate total
        $sumStmt = $pdo->prepare('SELECT january, february, march, april, may, june, july, august, september, october, november, december FROM fund_downloaded_entries WHERE id = ?');
        $sumStmt->execute([$id]);
        $row = $sumStmt->fetch();
        if ($row) {
            $total = 0.0;
            foreach ($monthCols as $c) {
                $total += (float)$row[$c];
            }
            $pdo->prepare('UPDATE fund_downloaded_entries SET total = ? WHERE id = ?')->execute([$total, $id]);
        }

        echo json_encode(['success' => true, 'message' => 'Entry updated successfully']);
        exit;
    }

    // Direct full update
    if ($id) {
        $category = trim($input['category'] ?? 'mooe');
        $glCode = trim($input['glCode'] ?? $input['gl_code'] ?? '');
        $programTitle = trim($input['programTitle'] ?? $input['program_title'] ?? '');
        $months = $input['months'] ?? [];

        $vals = [];
        $total = 0.0;
        foreach ($monthCols as $col) {
            $v = isset($months[$col]) ? (float)$months[$col] : 0.0;
            $vals[] = $v;
            $total += $v;
        }

        $stmt = $pdo->prepare('
            UPDATE fund_downloaded_entries
            SET category = ?, gl_code = ?, program_title = ?,
                january = ?, february = ?, march = ?, april = ?, may = ?, june = ?,
                july = ?, august = ?, september = ?, october = ?, november = ?, december = ?,
                total = ?
            WHERE id = ?
        ');
        $stmt->execute(array_merge([$category, $glCode, $programTitle], $vals, [$total, $id]));

        // Sync with budget_entries
        try {
            $eStmt = $pdo->prepare('SELECT year_id FROM fund_downloaded_entries WHERE id = ?');
            $eStmt->execute([$id]);
            $entryRow = $eStmt->fetch();
            if ($entryRow) {
                $yStmt = $pdo->prepare('SELECT year FROM fund_downloaded_years WHERE id = ?');
                $yStmt->execute([$entryRow['year_id']]);
                $yRow = $yStmt->fetch();
                if ($yRow) {
                    $yearVal = (int)$yRow['year'];
                    $bYrStmt = $pdo->prepare('SELECT id FROM budget_years WHERE year = ?');
                    $bYrStmt->execute([$yearVal]);
                    $bYr = $bYrStmt->fetch();
                    if ($bYr) {
                        $bEntryStmt = $pdo->prepare('SELECT id, actual FROM budget_entries WHERE year_id = ? AND gl_code = ?');
                        $bEntryStmt->execute([$bYr['id'], $glCode]);
                        $bEntry = $bEntryStmt->fetch();
                        if ($bEntry) {
                            $actual = (float)($bEntry['actual'] ?? 0);
                            $rem = $total - $actual;
                            $pdo->prepare('UPDATE budget_entries SET account_title = ?, budget = ?, remaining_amount = ? WHERE id = ?')
                                ->execute([$programTitle ?: $glCode, $total, $rem, $bEntry['id']]);
                        }
                    }
                }
            }
        } catch (Exception $e) {
            error_log('Budget sync update error: ' . $e->getMessage());
        }

        echo json_encode(['success' => true, 'message' => 'Entry updated successfully']);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
