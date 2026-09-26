<?php
/**
 * Test Seed Script for Under-budget / Over-budget Simulation
 */
require_once __DIR__ . '/config/db.php';

try {
    $pdo = getDB();
    if (!$pdo) die("Failed to connect to database.\n");

    $year = 2026;

    // 1. Ensure year records exist
    $stmt = $pdo->prepare('SELECT id FROM budget_years WHERE year = ?');
    $stmt->execute([$year]);
    $bYr = $stmt->fetch();
    $bYearId = $bYr ? $bYr['id'] : null;
    if (!$bYearId) {
        $pdo->prepare('INSERT INTO budget_years (year) VALUES (?)')->execute([$year]);
        $bYearId = $pdo->lastInsertId();
    }

    $stmt = $pdo->prepare('SELECT id FROM fund_downloaded_years WHERE year = ?');
    $stmt->execute([$year]);
    $fdYr = $stmt->fetch();
    $fdYearId = $fdYr ? $fdYr['id'] : null;
    if (!$fdYearId) {
        $pdo->prepare('INSERT INTO fund_downloaded_years (year) VALUES (?)')->execute([$year]);
        $fdYearId = $pdo->lastInsertId();
    }

    echo "Manipulating test budget and downloaded fund records for Year {$year}...\n";

    // A. Normal / Balanced Allocation: Travelling Expenses (G/L: 50201010-00)
    // Budget = 500,000 | Actual = 250,000 | Remaining = +250,000 (Positive / Healthy)
    $pdo->prepare("
        INSERT INTO budget_entries (year_id, gl_code, account_title, actual, budget, remaining_amount)
        VALUES (?, '50201010-00', 'Travelling Expenses - Local', 250000.00, 500000.00, 250000.00)
        ON DUPLICATE KEY UPDATE actual = 250000.00, budget = 500000.00, remaining_amount = 250000.00
    ")->execute([$bYearId]);

    // B. Over-budget / Overspent: Office Supplies Expenses (G/L: 50203010-00)
    // Budget = 1,000,000 | Actual = 1,450,000 | Remaining = -450,000 (Overspent in Red)
    $pdo->prepare("
        INSERT INTO budget_entries (year_id, gl_code, account_title, actual, budget, remaining_amount)
        VALUES (?, '50203010-00', 'Office Supplies Expenses', 1450000.00, 1000000.00, -450000.00)
        ON DUPLICATE KEY UPDATE actual = 1450000.00, budget = 1000000.00, remaining_amount = -450000.00
    ")->execute([$bYearId]);

    // C. Highly Under-budget / Surplus: Training & Scholarship Expenses (G/L: 50202010-00)
    // Budget = 3,000,000 | Actual = 400,000 | Remaining = +2,600,000 (High Remaining)
    $pdo->prepare("
        INSERT INTO budget_entries (year_id, gl_code, account_title, actual, budget, remaining_amount)
        VALUES (?, '50202010-00', 'Training Expenses', 400000.00, 3000000.00, 2600000.00)
        ON DUPLICATE KEY UPDATE actual = 400000.00, budget = 3000000.00, remaining_amount = 2600000.00
    ")->execute([$bYearId]);

    // D. Update Fund Downloaded Entries to show varied Spent vs Total
    // 1) Entry with partial spent (Remaining > 0)
    $pdo->prepare("
        UPDATE fund_downloaded_entries 
        SET spent = 45000000.00 
        WHERE year_id = ? AND gl_code = '50203010-00'
    ")->execute([$fdYearId]);

    // 2) Entry with high spent / nearly zero remaining
    $pdo->prepare("
        UPDATE fund_downloaded_entries 
        SET spent = 54000000.00 
        WHERE year_id = ? AND gl_code = '50203990-PH'
    ")->execute([$fdYearId]);

    echo "Test scenario data applied successfully!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
