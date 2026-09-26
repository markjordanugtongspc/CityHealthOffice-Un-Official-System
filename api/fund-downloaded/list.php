<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

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

    $year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');
    if ($year < 2000 || $year > 2100) $year = (int)date('Y');

    // Ensure year exists in fund_downloaded_years
    $stmt = $pdo->prepare('SELECT id FROM fund_downloaded_years WHERE year = ?');
    $stmt->execute([$year]);
    $yr = $stmt->fetch();
    if (!$yr) {
        $pdo->prepare('INSERT INTO fund_downloaded_years (year) VALUES (?)')->execute([$year]);
        $yearId = (int)$pdo->lastInsertId();
    } else {
        $yearId = (int)$yr['id'];
    }

    // Check if initial template rows exist for this year, if not seed default categories
    $stmt = $pdo->prepare('SELECT COUNT(*) AS c FROM fund_downloaded_entries WHERE year_id = ?');
    $stmt->execute([$yearId]);
    $countRow = $stmt->fetch();
    if ((int)($countRow['c'] ?? 0) === 0) {
        $seedEntries = [
            ['mooe', '50203010-00', 'BTSD MOOE Regular Allotment', 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000],
            ['sp-philhealth', '50203990-PH', 'PhilHealth Primary Care & Capitation', 4500000, 4500000, 4500000, 4500000, 4500000, 4500000, 4500000, 4500000, 4500000, 4500000, 4500000, 4500000],
            ['sp-ntp', '50203990-TB', 'SPF National Tuberculosis Program (NTP)', 2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000, 2500000],
            ['sp-mcp', '50203990-MC', 'Maternal & Child Care Package Facility Fund', 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000, 2000000],
            ['sp-konsulta', '50203990-KO', 'PhilHealth Konsulta & Diagnostic Fund', 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000, 3000000],
        ];

        $ins = $pdo->prepare('
            INSERT INTO fund_downloaded_entries 
            (year_id, category, gl_code, program_title, january, february, march, april, may, june, july, august, september, october, november, december, total, spent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        ');
        foreach ($seedEntries as $se) {
            $cat = $se[0];
            $gl = $se[1];
            $title = $se[2];
            $monthlyVals = array_slice($se, 3, 12); // exactly 12 months
            $totalVal = array_sum($monthlyVals);
            $params = array_merge([$yearId, $cat, $gl, $title], $monthlyVals, [$totalVal]);
            $ins->execute($params);
        }
    }

    $category = $_GET['category'] ?? 'all';
    $monthCols = ['january','february','march','april','may','june','july','august','september','october','november','december'];

    if ($category !== 'all') {
        $stmt = $pdo->prepare('
            SELECT id, category, gl_code, program_title, january, february, march, april, may, june, july, august, september, october, november, december, total, spent
            FROM fund_downloaded_entries
            WHERE year_id = ? AND category = ?
            ORDER BY id ASC
        ');
        $stmt->execute([$yearId, $category]);
    } else {
        $stmt = $pdo->prepare('
            SELECT id, category, gl_code, program_title, january, february, march, april, may, june, july, august, september, october, november, december, total, spent
            FROM fund_downloaded_entries
            WHERE year_id = ?
            ORDER BY id ASC
        ');
        $stmt->execute([$yearId]);
    }

    $rows = $stmt->fetchAll();
    $data = [];
    foreach ($rows as $r) {
        $months = [];
        $total = 0.0;
        foreach ($monthCols as $col) {
            $v = (float)$r[$col];
            $months[$col] = $v;
            $total += $v;
        }
        $spent = (float)($r['spent'] ?? 0);
        $remaining = max(0.0, $total - $spent);

        $data[] = [
            'id' => (int)$r['id'],
            'category' => $r['category'],
            'glCode' => $r['gl_code'],
            'programTitle' => $r['program_title'],
            'months' => $months,
            'total' => $total,
            'spent' => $spent,
            'remaining' => $remaining,
        ];
    }

    echo json_encode(['success' => true, 'data' => $data, 'year' => $year]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
