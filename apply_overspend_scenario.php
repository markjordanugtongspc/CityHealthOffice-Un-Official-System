<?php
/**
 * Setup realistic overspent & underbudget data for Dashboard & Budget
 */
require_once __DIR__ . '/config/db.php';

try {
    $pdo = getDB();
    if (!$pdo) die("DB failed\n");

    $year = 2026;

    // 1. Ensure Year IDs
    $stmt = $pdo->prepare('SELECT id FROM budget_years WHERE year = ?');
    $stmt->execute([$year]);
    $bYr = $stmt->fetch();
    $bYearId = $bYr ? $bYr['id'] : null;
    if (!$bYearId) {
        $pdo->prepare('INSERT INTO budget_years (year) VALUES (?)')->execute([$year]);
        $bYearId = $pdo->lastInsertId();
    }

    $stmt = $pdo->prepare('SELECT id FROM monthly_expenses_years WHERE year = ?');
    $stmt->execute([$year]);
    $mYr = $stmt->fetch();
    $mYearId = $mYr ? $mYr['id'] : null;
    if (!$mYearId) {
        $pdo->prepare('INSERT INTO monthly_expenses_years (year) VALUES (?)')->execute([$year]);
        $mYearId = $pdo->lastInsertId();
    }

    // Set a realistic Total Annual Budget: 12,000,000 => Monthly Allocation = 1,000,000
    // We update/insert budget entries for year 2026
    $pdo->prepare("
        INSERT INTO budget_entries (year_id, gl_code, account_title, actual, budget, remaining_amount)
        VALUES 
            (?, '50201010-00', 'Travelling Expenses - Local', 450000.00, 1500000.00, 1050000.00),
            (?, '50203010-00', 'Office Supplies Expenses', 2800000.00, 2000000.00, -800000.00),
            (?, '50203080-00', 'Medical, Dental and Laboratory Supplies', 5200000.00, 4500000.00, -700000.00),
            (?, '50202010-00', 'Training Expenses', 650000.00, 2000000.00, 1350000.00),
            (?, '50203990-00', 'Other Supplies and Materials Expenses', 900000.00, 2000000.00, 1100000.00)
        ON DUPLICATE KEY UPDATE 
            actual = VALUES(actual),
            budget = VALUES(budget),
            remaining_amount = VALUES(remaining_amount)
    ")->execute([$bYearId, $bYearId, $bYearId, $bYearId, $bYearId]);

    // Total Budget = 1,500,000 + 2,000,000 + 4,500,000 + 2,000,000 + 2,000,000 = 12,000,000
    // Monthly Allocation = 12,000,000 / 12 = 1,000,000 per month
    
    // Now configure monthly expenses across months:
    // Jan: 750,000 (Remaining: +250,000 -> Green)
    // Feb: 820,000 (Remaining: +180,000 -> Green)
    // Mar: 1,450,000 (Remaining: -450,000 -> RED OVERSPENT)
    // Apr: 680,000 (Remaining: +320,000 -> Green)
    // May: 910,000 (Remaining: +90,000 -> Green)
    // Jun: 1,600,000 (Remaining: -600,000 -> RED OVERSPENT)
    // Jul: 850,000 (Remaining: +150,000 -> Green)
    // Aug: 1,350,000 (Remaining: -350,000 -> RED OVERSPENT)
    // Sep: 720,000 (Remaining: +280,000 -> Green)
    // Oct: 1,250,000 (Remaining: -250,000 -> RED OVERSPENT)
    // Nov: 690,000 (Remaining: +310,000 -> Green)
    // Dec: 930,000 (Remaining: +70,000 -> Green)

    // Clear and insert monthly expenses
    $pdo->prepare('DELETE FROM monthly_expenses_entries WHERE year_id = ?')->execute([$mYearId]);

    $pdo->prepare("
        INSERT INTO monthly_expenses_entries 
        (year_id, gl_code, account_title, january, february, march, april, may, june, july, august, september, october, november, december, total)
        VALUES 
        (?, '50203080-00', 'Medical, Dental and Laboratory Supplies', 
         400000, 450000, 850000, 350000, 500000, 950000, 450000, 800000, 400000, 750000, 350000, 500000, 7300000),
        (?, '50203010-00', 'Office Supplies Expenses', 
         350000, 370000, 600000, 330000, 410000, 650000, 400000, 550000, 320000, 500000, 340000, 430000, 5250000)
    ")->execute([$mYearId, $mYearId]);

    echo "Data updated! Overspent months (March, June, August, October) configured alongside Green surplus months.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
