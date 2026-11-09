<?php
require_once __DIR__ . '/../config/db.php';
$_GET['year'] = 2026;
ob_start();
try {
    $pdo = getDB();
    $year = 2026;
    $months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    $expenses = array_fill(0, 12, 0.0);

    $monthlyYear = $pdo->prepare('SELECT id FROM monthly_expenses_years WHERE year = ?');
    $monthlyYear->execute([$year]);
    $monthlyYearId = $monthlyYear->fetchColumn();
    echo "monthlyYearId: $monthlyYearId\n";
    if ($monthlyYearId) {
        $columns = implode(', ', array_map(fn($month) => "COALESCE(SUM($month), 0) AS $month", $months));
        $statement = $pdo->prepare("SELECT $columns FROM monthly_expenses_entries WHERE year_id = ?");
        $statement->execute([$monthlyYearId]);
        $row = $statement->fetch(PDO::FETCH_ASSOC) ?: [];
        print_r($row);
        foreach ($months as $index => $month) $expenses[$index] = (float) ($row[$month] ?? 0);
    }

    $fundYear = $pdo->prepare('SELECT id FROM fund_downloaded_years WHERE year = ?');
    $fundYear->execute([$year]);
    $fundYearId = $fundYear->fetchColumn();
    echo "fundYearId: $fundYearId\n";
    $income = array_fill(0, 12, 0.0);
    if ($fundYearId) {
        $fundCols = implode(', ', array_map(fn($m) => "COALESCE(SUM($m), 0) AS $m", $months));
        $fStmt = $pdo->prepare("SELECT $fundCols FROM fund_downloaded_entries WHERE year_id = ?");
        $fStmt->execute([$fundYearId]);
        $fRow = $fStmt->fetch(PDO::FETCH_ASSOC) ?: [];
        print_r($fRow);
        foreach ($months as $index => $month) {
            $income[$index] = (float)($fRow[$month] ?? 0);
        }
    }

    echo "INCOME: " . json_encode($income) . "\n";
    echo "EXPENSES: " . json_encode($expenses) . "\n";
} catch (Throwable $e) {
    echo "ERR: " . $e->getMessage() . "\n";
}
