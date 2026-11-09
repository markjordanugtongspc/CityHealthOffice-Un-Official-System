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

    $category = $_GET['category'] ?? 'all';
    $monthCols = ['january','february','march','april','may','june','july','august','september','october','november','december'];

    $sql = '
        SELECT 
            fde.id,
            fde.category_id,
            COALESCE(fc.code, fde.category, "mooe") AS category,
            fc.name AS category_name,
            fde.gl_code,
            fde.program_title,
            fde.january, fde.february, fde.march, fde.april, fde.may, fde.june,
            fde.july, fde.august, fde.september, fde.october, fde.november, fde.december,
            fde.total, fde.spent
        FROM fund_downloaded_entries fde
        LEFT JOIN fund_categories fc ON fde.category_id = fc.id
        WHERE fde.year_id = ?
    ';

    if ($category !== 'all') {
        $sql .= ' AND (fde.category = ? OR fc.code = ?) ORDER BY fde.id ASC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$yearId, $category, $category]);
    } else {
        $sql .= ' ORDER BY fde.id ASC';
        $stmt = $pdo->prepare($sql);
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
