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

    // Auto-create tables if not exists
    $pdo->exec('
        CREATE TABLE IF NOT EXISTS fund_downloaded_years (
            id INT AUTO_INCREMENT PRIMARY KEY,
            year INT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ');

    $pdo->exec('
        CREATE TABLE IF NOT EXISTS fund_downloaded_entries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            year_id INT NOT NULL,
            category VARCHAR(60) NOT NULL DEFAULT "mooe",
            gl_code VARCHAR(60) NOT NULL,
            program_title VARCHAR(255) NOT NULL,
            january DECIMAL(15,2) NOT NULL DEFAULT 0,
            february DECIMAL(15,2) NOT NULL DEFAULT 0,
            march DECIMAL(15,2) NOT NULL DEFAULT 0,
            april DECIMAL(15,2) NOT NULL DEFAULT 0,
            may DECIMAL(15,2) NOT NULL DEFAULT 0,
            june DECIMAL(15,2) NOT NULL DEFAULT 0,
            july DECIMAL(15,2) NOT NULL DEFAULT 0,
            august DECIMAL(15,2) NOT NULL DEFAULT 0,
            september DECIMAL(15,2) NOT NULL DEFAULT 0,
            october DECIMAL(15,2) NOT NULL DEFAULT 0,
            november DECIMAL(15,2) NOT NULL DEFAULT 0,
            december DECIMAL(15,2) NOT NULL DEFAULT 0,
            total DECIMAL(15,2) NOT NULL DEFAULT 0,
            spent DECIMAL(15,2) NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_year_cat (year_id, category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON payload']);
        exit;
    }

    $year = isset($input['year']) ? (int)$input['year'] : (int)date('Y');
    if ($year < 2000 || $year > 2100) $year = (int)date('Y');

    // Ensure year in fund_downloaded_years
    $stmt = $pdo->prepare('SELECT id FROM fund_downloaded_years WHERE year = ?');
    $stmt->execute([$year]);
    $yr = $stmt->fetch();
    if (!$yr) {
        $pdo->prepare('INSERT INTO fund_downloaded_years (year) VALUES (?)')->execute([$year]);
        $yearId = (int)$pdo->lastInsertId();
    } else {
        $yearId = (int)$yr['id'];
    }

    $category = trim($input['category'] ?? 'mooe');
    $glCode = trim($input['glCode'] ?? $input['gl_code'] ?? '');
    $programTitle = trim($input['programTitle'] ?? $input['program_title'] ?? '');
    $months = $input['months'] ?? [];

    if (empty($glCode)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'G/L Code is required']);
        exit;
    }

    $monthCols = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    $vals = [];
    $total = 0.0;
    foreach ($monthCols as $col) {
        // support short or long keys
        $short = substr($col, 0, 3);
        $v = 0.0;
        if (isset($months[$col])) {
            $v = (float)$months[$col];
        } elseif (isset($months[$short])) {
            $v = (float)$months[$short];
        }
        $vals[] = $v;
        $total += $v;
    }

    $stmt = $pdo->prepare('
        INSERT INTO fund_downloaded_entries 
        (year_id, category, gl_code, program_title, january, february, march, april, may, june, july, august, september, october, november, december, total, spent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    ');
    $stmt->execute(array_merge([$yearId, $category, $glCode, $programTitle], $vals, [$total]));
    $newEntryId = (int)$pdo->lastInsertId();

    // Automatically sync / update Budget in budget_entries for this fiscal year and GL code
    try {
        $bYearStmt = $pdo->prepare('SELECT id FROM budget_years WHERE year = ?');
        $bYearStmt->execute([$year]);
        $bYr = $bYearStmt->fetch();
        if (!$bYr) {
            $pdo->prepare('INSERT INTO budget_years (year) VALUES (?)')->execute([$year]);
            $budgetYearId = (int)$pdo->lastInsertId();
        } else {
            $budgetYearId = (int)$bYr['id'];
        }

        // Check if an existing budget entry exists for this GL code
        $bEntryStmt = $pdo->prepare('SELECT id, actual, budget FROM budget_entries WHERE year_id = ? AND gl_code = ?');
        $bEntryStmt->execute([$budgetYearId, $glCode]);
        $bEntry = $bEntryStmt->fetch();

        if ($bEntry) {
            $currentActual = (float)($bEntry['actual'] ?? 0);
            $newBudget = (float)$total; // or updated total allotment
            $remaining = $newBudget - $currentActual;
            $percent = $newBudget != 0 ? ($remaining / $newBudget) * 100 : 0;

            $upd = $pdo->prepare('
                UPDATE budget_entries 
                SET account_title = ?, budget = ?, remaining_amount = ? 
                WHERE id = ?
            ');
            $upd->execute([$programTitle ?: $glCode, $newBudget, $remaining, $bEntry['id']]);
        } else {
            $remaining = (float)$total;
            $insBudget = $pdo->prepare('
                INSERT INTO budget_entries (year_id, gl_code, account_title, actual, budget, remaining_amount)
                VALUES (?, ?, ?, 0, ?, ?)
            ');
            $insBudget->execute([$budgetYearId, $glCode, $programTitle ?: $glCode, $total, $remaining]);
        }
    } catch (Exception $e) {
        // Silently continue if budget sync has minor mismatch, ensuring primary entry was stored
        error_log('Failed to sync budget entry: ' . $e->getMessage());
    }

    echo json_encode([
        'success' => true,
        'message' => 'Fund Downloaded entry created successfully',
        'id' => $newEntryId
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
