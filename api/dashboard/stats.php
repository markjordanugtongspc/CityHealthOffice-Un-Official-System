<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';
requireAuth(true);

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');
    $year = (int)($_GET['year'] ?? date('Y'));
    if ($year < 2000 || $year > 2100) $year = (int)date('Y');

    $fundCategory = trim($_GET['fund_category'] ?? $_GET['category'] ?? 'all');
    $expenseCategory = trim($_GET['expense_category'] ?? 'all');

    // 1. Fetch Budget Year & MOOE numbers from budget_entries
    $stmt = $pdo->prepare('SELECT id FROM budget_years WHERE year = ?');
    $stmt->execute([$year]);
    $yr = $stmt->fetch();
    $budgetYearId = $yr['id'] ?? null;

    $totalBudget = 0.0;
    $totalMooeActual = 0.0;

    if ($budgetYearId) {
        $row = $pdo->prepare('SELECT SUM(budget) AS tb, SUM(actual) AS ta FROM budget_entries WHERE year_id = ?');
        $row->execute([$budgetYearId]);
        $sums = $row->fetch();
        $totalBudget = (float)($sums['tb'] ?? 0);
        $totalMooeActual = (float)($sums['ta'] ?? 0);
    }

    // 2. Fetch Fund Downloaded data from fund_downloaded_entries
    $fundYearStmt = $pdo->prepare('SELECT id FROM fund_downloaded_years WHERE year = ?');
    $fundYearStmt->execute([$year]);
    $fyr = $fundYearStmt->fetch();
    $fundYearId = $fyr['id'] ?? null;

    $categoryFundTotals = [
        'mooe' => (float)$totalBudget,
        'sp-philhealth' => 0.0,
        'sp-ntp' => 0.0,
        'sp-mcp' => 0.0,
        'sp-konsulta' => 0.0,
    ];

    $categoryExpenseTotals = [
        'mooe' => (float)$totalMooeActual,
        'sp-philhealth' => 0.0,
        'sp-ntp' => 0.0,
        'sp-mcp' => 0.0,
        'sp-konsulta' => 0.0,
    ];

    if ($fundYearId) {
        $fStmt = $pdo->prepare('SELECT category, SUM(total) as cat_total, SUM(spent) as cat_spent FROM fund_downloaded_entries WHERE year_id = ? GROUP BY category');
        $fStmt->execute([$fundYearId]);
        while ($frow = $fStmt->fetch()) {
            $c = $frow['category'];
            if (isset($categoryFundTotals[$c])) {
                $categoryFundTotals[$c] = (float)$frow['cat_total'];
                if ((float)$frow['cat_spent'] > 0) {
                    $categoryExpenseTotals[$c] = (float)$frow['cat_spent'];
                }
            }
        }
    }

    // Calculate Total Expenses based on expenseCategory selection
    $totalExpenses = 0.0;
    if ($expenseCategory === 'all') {
        $totalExpenses = array_sum($categoryExpenseTotals);
    } elseif (isset($categoryExpenseTotals[$expenseCategory])) {
        $totalExpenses = $categoryExpenseTotals[$expenseCategory];
    } else {
        $totalExpenses = $totalMooeActual;
    }

    // Calculate Fund Downloaded (Raw total downloaded allotments received) based on fundCategory selection
    $fundDownloadedTotal = 0.0;
    if ($fundCategory === 'all') {
        $fundDownloadedTotal = array_sum($categoryFundTotals);
    } elseif (isset($categoryFundTotals[$fundCategory])) {
        $fundDownloadedTotal = $categoryFundTotals[$fundCategory];
    } else {
        $fundDownloadedTotal = $totalBudget;
    }

    // Grand total budget (All funds combined)
    $grandTotalBudget = array_sum($categoryFundTotals);

    // Actual Budget (Remaining balance: Total Budget minus Disbursed Expenses)
    $actualRemainingBudget = max(0.0, $grandTotalBudget - $totalExpenses);

    echo json_encode([
        'success' => true,
        'data' => [
            'totalBudget'    => $grandTotalBudget,      // Card 1: TOTAL BUDGET ALLOCATION
            'yearlyBudget'   => $actualRemainingBudget, // Card 2: ACTUAL BUDGET (Remaining after deductions)
            'totalExpenses'  => $totalExpenses,         // Card 3: TOTAL EXPENSES (DISBURSED)
            'fundDownloaded' => $fundDownloadedTotal,    // Card 4: FUND DOWNLOADED (Total Allotments Received)
            'year'           => $year,
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
