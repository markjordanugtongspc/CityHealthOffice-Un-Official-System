<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');
    $year = isset($_GET['year']) ? (int) $_GET['year'] : (int) date('Y');
    if ($year < 2000 || $year > 2100) $year = (int) date('Y');
    $months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    $expenses = array_fill(0, 12, 0.0);

    $monthlyYear = $pdo->prepare('SELECT id FROM monthly_expenses_years WHERE year = ?');
    $monthlyYear->execute([$year]);
    $monthlyYearId = $monthlyYear->fetchColumn();
    if ($monthlyYearId) {
        $columns = implode(', ', array_map(fn($month) => "COALESCE(SUM($month), 0) AS $month", $months));
        $statement = $pdo->prepare("SELECT $columns FROM monthly_expenses_entries WHERE year_id = ?");
        $statement->execute([$monthlyYearId]);
        $row = $statement->fetch() ?: [];
        foreach ($months as $index => $month) $expenses[$index] = (float) ($row[$month] ?? 0);
    }

    // The budget ledger is the application's available-income/allocation source.
    $budgetYear = $pdo->prepare('SELECT id FROM budget_years WHERE year = ?');
    $budgetYear->execute([$year]);
    $budgetYearId = $budgetYear->fetchColumn();
    $annualIncome = 0.0;
    if ($budgetYearId) {
        $statement = $pdo->prepare('SELECT COALESCE(SUM(budget), 0) FROM budget_entries WHERE year_id = ?');
        $statement->execute([$budgetYearId]);
        $annualIncome = (float) $statement->fetchColumn();
    }
    $income = array_fill(0, 12, $annualIncome / 12);
    // Keep the API shape ready for future live bank-feed integration.
    $dataSources = [
        'income' => $annualIncome > 0 ? 'database' : 'placeholder',
        'expenses' => array_sum($expenses) > 0 ? 'database' : 'placeholder',
    ];
    echo json_encode(['success' => true, 'year' => $year, 'months' => array_map(fn($month) => ucfirst(substr($month, 0, 3)), $months), 'income' => $income, 'expenses' => $expenses, 'totals' => ['income' => array_sum($income), 'expenses' => array_sum($expenses)], 'data_sources' => $dataSources]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}