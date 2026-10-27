<?php
// START: list.php - Returns daily transactions from transactions table
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');

    $year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');
    if ($year < 2000 || $year > 2100) $year = (int)date('Y');

    $month = isset($_GET['month']) ? (int)$_GET['month'] : 0;
    $payeeFilter = isset($_GET['payee']) ? trim($_GET['payee']) : '';
    $dateFilter = isset($_GET['date']) ? trim($_GET['date']) : '';
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

    // Build query
    $where = ['t.year = ?'];
    $params = [$year];

    if ($month >= 1 && $month <= 12) {
        $where[] = 'MONTH(t.date) = ?';
        $params[] = $month;
    }

    if ($payeeFilter !== '') {
        $where[] = 't.payee = ?';
        $params[] = $payeeFilter;
    }

    if ($dateFilter !== '') {
        $where[] = 't.date = ?';
        $params[] = $dateFilter;
    }

    if ($search !== '') {
        $where[] = '(a.gl_code LIKE ? OR a.account_title LIKE ? OR t.dv_no LIKE ? OR t.payee LIKE ? OR t.check_no LIKE ? OR t.description LIKE ?)';
        $term = "%{$search}%";
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
    }

    $sql = '
        SELECT 
            t.id,
            t.account_id,
            a.gl_code,
            a.account_title,
            t.year,
            t.date,
            t.date AS dv_date,
            t.dv_no,
            COALESCE(t.check_no, "") AS check_no,
            t.payee,
            t.amount,
            t.amount AS check_amount,
            COALESCE(t.description, "") AS description,
            COALESCE(t.description, "") AS particulars,
            t.created_at,
            t.updated_at
        FROM transactions t
        LEFT JOIN account_titles a ON t.account_id = a.id
        WHERE ' . implode(' AND ', $where) . '
        ORDER BY t.date DESC, t.id DESC
    ';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Cast types for frontend consistency
    $data = array_map(function ($r) {
        return [
            'id' => (int)$r['id'],
            'accountId' => (int)$r['account_id'],
            'glCode' => $r['gl_code'] ?? '',
            'accountTitle' => $r['account_title'] ?? '',
            'year' => (int)$r['year'],
            'date' => $r['date'],
            'dvDate' => $r['dv_date'],
            'dvNo' => $r['dv_no'] ?? '',
            'checkNo' => $r['check_no'] ?? '',
            'payee' => $r['payee'] ?? '',
            'amount' => (float)$r['amount'],
            'checkAmount' => (float)$r['check_amount'],
            'description' => $r['description'] ?? '',
            'particulars' => $r['particulars'] ?? '',
            'createdAt' => $r['created_at'],
            'updatedAt' => $r['updated_at'],
        ];
    }, $rows);

    // Query daily totals for all days in this year (and month, optionally filtered by payee)
    $dtWhere = ['year = ?'];
    $dtParams = [$year];
    if ($payeeFilter !== '') {
        $dtWhere[] = 'payee = ?';
        $dtParams[] = $payeeFilter;
    }
    $dtSql = 'SELECT date, SUM(amount) AS total FROM transactions WHERE ' . implode(' AND ', $dtWhere) . ' GROUP BY date';
    $dtStmt = $pdo->prepare($dtSql);
    $dtStmt->execute($dtParams);
    $dailyTotals = [];
    while ($dt = $dtStmt->fetch(PDO::FETCH_ASSOC)) {
        $dailyTotals[$dt['date']] = (float)$dt['total'];
    }

    // Query distinct payees
    $pStmt = $pdo->query('SELECT DISTINCT payee FROM transactions WHERE payee IS NOT NULL AND payee != "" ORDER BY payee ASC');
    $payees = $pStmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'success' => true,
        'data' => $data,
        'dailyTotals' => $dailyTotals,
        'payees' => $payees,
        'count' => count($data),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
// END: list.php
