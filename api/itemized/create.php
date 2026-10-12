<?php
// START: create.php - Creates a new transaction entry in transactions table
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

    // Ensure accounts table is synced
    $pdo->exec("INSERT IGNORE INTO accounts (id, gl_code, account_title, category, display_order)
                SELECT id, gl_code, account_title, 'Expense', display_order
                FROM account_titles");

    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $date = trim($input['date'] ?? $input['dvDate'] ?? $input['dv_date'] ?? date('Y-m-d'));
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $date = date('Y-m-d');
    }
    $year = (int)date('Y', strtotime($date));

    $glCode = trim($input['glCode'] ?? $input['gl_code'] ?? '');
    $accountId = isset($input['accountId']) ? (int)$input['accountId'] : (isset($input['account_id']) ? (int)$input['account_id'] : 0);
    $payee = trim($input['payee'] ?? '');
    $amount = (float)($input['amount'] ?? $input['checkAmount'] ?? $input['check_amount'] ?? 0);
    $dvNo = trim($input['dvNo'] ?? $input['dv_no'] ?? '');
    $checkNo = trim($input['checkNo'] ?? $input['check_no'] ?? '');
    $description = trim($input['description'] ?? $input['particulars'] ?? $input['remarks'] ?? '');

    if (empty($payee)) {
        throw new Exception('Payee / Individual name is required.');
    }
    if ($amount <= 0) {
        throw new Exception('Amount must be greater than 0.');
    }

    // Resolve account_id
    if ($accountId <= 0 && !empty($glCode)) {
        $stmt = $pdo->prepare('SELECT id FROM accounts WHERE gl_code = ? LIMIT 1');
        $stmt->execute([$glCode]);
        $acc = $stmt->fetch();
        if ($acc) {
            $accountId = (int)$acc['id'];
        } else {
            // Check account_titles
            $stmtAt = $pdo->prepare('SELECT id, gl_code, account_title, display_order FROM account_titles WHERE gl_code = ? LIMIT 1');
            $stmtAt->execute([$glCode]);
            $at = $stmtAt->fetch();
            if ($at) {
                $pdo->prepare('INSERT INTO accounts (id, gl_code, account_title, category, display_order) VALUES (?, ?, ?, "Expense", ?)')
                    ->execute([$at['id'], $at['gl_code'], $at['account_title'], $at['display_order']]);
                $accountId = (int)$at['id'];
            }
        }
    }

    // If still no account_id, pick the first expense account as default
    if ($accountId <= 0) {
        $stmt = $pdo->query('SELECT id FROM accounts LIMIT 1');
        $acc = $stmt->fetch();
        if ($acc) {
            $accountId = (int)$acc['id'];
        } else {
            throw new Exception('No valid G/L Account found. Please select an Account Title.');
        }
    }

    // Auto-generate DV No if blank
    if (empty($dvNo)) {
        $monthStr = date('m', strtotime($date));
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM transactions WHERE year = ? AND MONTH(date) = ?');
        $stmt->execute([$year, (int)$monthStr]);
        $count = (int)$stmt->fetchColumn() + 1;
        $dvNo = sprintf('%04d-%s-%03d', $year, $monthStr, $count);
    }

    // Insert transaction
    $stmt = $pdo->prepare('
        INSERT INTO transactions (account_id, year, date, dv_no, check_no, payee, amount, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $accountId,
        $year,
        $date,
        $dvNo,
        $checkNo,
        $payee,
        $amount,
        $description
    ]);
    $id = (int)$pdo->lastInsertId();

    // Trigger sync to monthly_expenses_entries
    try {
        syncToMonthlyExpenses($pdo, $year);
    } catch (Exception $syncErr) {
        error_log('Sync error: ' . $syncErr->getMessage());
    }

    echo json_encode([
        'success' => true,
        'message' => 'Daily expense entry added successfully.',
        'data' => [
            'id' => $id,
            'year' => $year,
            'date' => $date,
            'payee' => $payee,
            'amount' => $amount
        ]
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// START: syncToMonthlyExpenses - Internal helper to keep monthly summary updated
function syncToMonthlyExpenses($pdo, $year) {
    $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_years WHERE year = ?');
    $stmt->execute([$year]);
    $meYr = $stmt->fetch();
    if (!$meYr) {
        $pdo->prepare('INSERT INTO monthly_expenses_years (year) VALUES (?)')->execute([$year]);
        $monthlyYearId = $pdo->lastInsertId();
    } else {
        $monthlyYearId = $meYr['id'];
    }

    $monthNumToCol = [
        1=>'january', 2=>'february', 3=>'march', 4=>'april',
        5=>'may', 6=>'june', 7=>'july', 8=>'august',
        9=>'september', 10=>'october', 11=>'november', 12=>'december'
    ];
    $allCols = array_values($monthNumToCol);

    $stmt = $pdo->prepare('
        SELECT t.account_id, a.gl_code, a.account_title, t.date, t.amount
        FROM transactions t
        INNER JOIN accounts a ON t.account_id = a.id
        WHERE t.year = ?
    ');
    $stmt->execute([$year]);
    $agg = [];
    $accountTitles = [];

    while ($row = $stmt->fetch()) {
        $gl = $row['gl_code'];
        $amt = (float)$row['amount'];
        $accountTitles[$gl] = $row['account_title'];
        $m = (int)date('n', strtotime($row['date']));
        if ($m < 1 || $m > 12) $m = 1;

        if (!isset($agg[$gl])) {
            $agg[$gl] = array_fill_keys($allCols, 0);
        }
        $col = $monthNumToCol[$m];
        $agg[$gl][$col] += $amt;
    }

    foreach ($agg as $glCode => $months) {
        $accountTitle = $accountTitles[$glCode] ?? $glCode;
        $total = array_sum($months);

        $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_entries WHERE year_id = ? AND gl_code = ?');
        $stmt->execute([$monthlyYearId, $glCode]);
        $existing = $stmt->fetch();

        if ($existing) {
            $pdo->prepare('
                UPDATE monthly_expenses_entries SET
                    account_title=?,
                    january=?, february=?, march=?, april=?, may=?, june=?,
                    july=?, august=?, september=?, october=?, november=?, december=?,
                    total=?
                WHERE year_id=? AND gl_code=?
            ')->execute([
                $accountTitle,
                $months['january'], $months['february'], $months['march'], $months['april'], $months['may'], $months['june'],
                $months['july'], $months['august'], $months['september'], $months['october'], $months['november'], $months['december'],
                $total, $monthlyYearId, $glCode,
            ]);
        } else {
            $pdo->prepare('
                INSERT INTO monthly_expenses_entries (year_id, gl_code, account_title, january, february, march, april, may, june, july, august, september, october, november, december, total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ')->execute([
                $monthlyYearId, $glCode, $accountTitle,
                $months['january'], $months['february'], $months['march'], $months['april'], $months['may'], $months['june'],
                $months['july'], $months['august'], $months['september'], $months['october'], $months['november'], $months['december'],
                $total,
            ]);
        }
    }
}
// END: syncToMonthlyExpenses
// END: create.php
