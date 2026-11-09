<?php
// START: helper_sync.php - Centralized synchronizer for Itemized -> Monthly -> Budget -> Fund Downloaded
function syncAllFinancialLedgers(PDO $pdo, int $year): void {
    // 1. Ensure monthly_expenses_years exists
    $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_years WHERE year = ?');
    $stmt->execute([$year]);
    $meYr = $stmt->fetch();
    if (!$meYr) {
        $pdo->prepare('INSERT INTO monthly_expenses_years (year) VALUES (?)')->execute([$year]);
        $monthlyYearId = (int)$pdo->lastInsertId();
    } else {
        $monthlyYearId = (int)$meYr['id'];
    }

    $monthNumToCol = [
        1=>'january', 2=>'february', 3=>'march', 4=>'april',
        5=>'may', 6=>'june', 7=>'july', 8=>'august',
        9=>'september', 10=>'october', 11=>'november', 12=>'december'
    ];
    $allCols = array_values($monthNumToCol);

    // Query all transactions for this fiscal year
    $stmt = $pdo->prepare('
        SELECT t.account_id, a.gl_code, a.account_title, t.date, t.amount
        FROM transactions t
        INNER JOIN account_titles a ON t.account_id = a.id
        WHERE t.year = ?
    ');
    $stmt->execute([$year]);
    $agg = [];
    $accountIds = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $gl = $row['gl_code'];
        $amt = (float)$row['amount'];
        $accId = (int)$row['account_id'];
        $accountIds[$gl] = $accId;

        $m = (int)date('n', strtotime($row['date']));
        if ($m < 1 || $m > 12) $m = 1;

        if (!isset($agg[$gl])) {
            $agg[$gl] = array_fill_keys($allCols, 0.0);
        }
        $col = $monthNumToCol[$m];
        $agg[$gl][$col] += $amt;
    }

    // A. Update or Clear monthly_expenses_entries
    // If there are accounts with transactions, upsert them
    $activeAccountIds = [];
    foreach ($agg as $glCode => $months) {
        $accId = $accountIds[$glCode] ?? null;
        if (!$accId) continue;
        $activeAccountIds[] = $accId;
        $total = array_sum($months);

        $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_entries WHERE year_id = ? AND account_id = ?');
        $stmt->execute([$monthlyYearId, $accId]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $pdo->prepare('
                UPDATE monthly_expenses_entries SET
                    january=?, february=?, march=?, april=?, may=?, june=?,
                    july=?, august=?, september=?, october=?, november=?, december=?,
                    total=?
                WHERE id=?
            ')->execute([
                $months['january'], $months['february'], $months['march'], $months['april'], $months['may'], $months['june'],
                $months['july'], $months['august'], $months['september'], $months['october'], $months['november'], $months['december'],
                $total, $existing['id'],
            ]);
        } else {
            $pdo->prepare('
                INSERT INTO monthly_expenses_entries 
                (year_id, account_id, january, february, march, april, may, june, july, august, september, october, november, december, total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ')->execute([
                $monthlyYearId, $accId,
                $months['january'], $months['february'], $months['march'], $months['april'], $months['may'], $months['june'],
                $months['july'], $months['august'], $months['september'], $months['october'], $months['november'], $months['december'],
                $total,
            ]);
        }
    }

    // Zero out any monthly_expenses_entries for this year whose transactions were completely deleted
    if (empty($activeAccountIds)) {
        $pdo->prepare('
            UPDATE monthly_expenses_entries 
            SET january=0, february=0, march=0, april=0, may=0, june=0,
                july=0, august=0, september=0, october=0, november=0, december=0, total=0
            WHERE year_id = ?
        ')->execute([$monthlyYearId]);
    } else {
        $inClause = implode(',', array_map('intval', $activeAccountIds));
        $pdo->prepare("
            UPDATE monthly_expenses_entries 
            SET january=0, february=0, march=0, april=0, may=0, june=0,
                july=0, august=0, september=0, october=0, november=0, december=0, total=0
            WHERE year_id = ? AND account_id NOT IN ($inClause)
        ")->execute([$monthlyYearId]);
    }

    // B. Sync Budget entries (actual & remaining_amount)
    $bYrStmt = $pdo->prepare('SELECT id FROM budget_years WHERE year = ?');
    $bYrStmt->execute([$year]);
    $bYr = $bYrStmt->fetch(PDO::FETCH_ASSOC);
    if ($bYr) {
        $budgetYearId = (int)$bYr['id'];
        $totalsStmt = $pdo->prepare('SELECT account_id, total FROM monthly_expenses_entries WHERE year_id = ?');
        $totalsStmt->execute([$monthlyYearId]);
        $monthlyTotals = $totalsStmt->fetchAll(PDO::FETCH_KEY_PAIR);

        $allBudgetEntries = $pdo->prepare('SELECT id, account_id, budget FROM budget_entries WHERE year_id = ?');
        $allBudgetEntries->execute([$budgetYearId]);
        while ($bRow = $allBudgetEntries->fetch(PDO::FETCH_ASSOC)) {
            $accId = (int)$bRow['account_id'];
            $actual = (float)($monthlyTotals[$accId] ?? 0.0);
            $budget = (float)$bRow['budget'];
            $rem = $budget - $actual;

            $pdo->prepare('
                UPDATE budget_entries 
                SET actual = ?, remaining_amount = ?, updated_at = NOW()
                WHERE id = ?
            ')->execute([$actual, $rem, $bRow['id']]);
        }
    }

    // C. Sync Fund Downloaded entries spent amounts
    $fdYrStmt = $pdo->prepare('SELECT id FROM fund_downloaded_years WHERE year = ?');
    $fdYrStmt->execute([$year]);
    $fdYr = $fdYrStmt->fetch(PDO::FETCH_ASSOC);
    if ($fdYr) {
        $fdYearId = (int)$fdYr['id'];
        $fdEntriesStmt = $pdo->prepare('SELECT id, gl_code FROM fund_downloaded_entries WHERE year_id = ?');
        $fdEntriesStmt->execute([$fdYearId]);
        $fdEntries = $fdEntriesStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($fdEntries as $fde) {
            $gl = $fde['gl_code'];
            $txSumStmt = $pdo->prepare('
                SELECT COALESCE(SUM(t.amount), 0) AS total_spent
                FROM transactions t
                INNER JOIN account_titles a ON t.account_id = a.id
                WHERE t.year = ? AND a.gl_code = ?
            ');
            $txSumStmt->execute([$year, $gl]);
            $spent = (float)$txSumStmt->fetchColumn();

            $pdo->prepare('UPDATE fund_downloaded_entries SET spent = ? WHERE id = ?')->execute([$spent, $fde['id']]);
        }
    }
}
