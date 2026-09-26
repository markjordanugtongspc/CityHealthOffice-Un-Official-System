<?php
require_once __DIR__ . '/../config/db.php';
$pdo = getDB();

echo "=== FIXING account_titles (no PRIMARY KEY — rebuilding) ===\n";

// Step 1: Create a clean temp table with proper structure + AUTO_INCREMENT PK
$pdo->exec("
    CREATE TABLE IF NOT EXISTS account_titles_clean (
        id int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
        gl_code varchar(20) NOT NULL,
        account_title varchar(255) NOT NULL,
        display_order int DEFAULT 0,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_gl_code (gl_code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");
echo "[OK] Created account_titles_clean\n";

// Step 2: Insert DISTINCT rows
$pdo->exec("
    INSERT IGNORE INTO account_titles_clean (id, gl_code, account_title, display_order, created_at, updated_at)
    SELECT DISTINCT id, gl_code, account_title, display_order, created_at, updated_at
    FROM account_titles
");
$c = $pdo->query("SELECT COUNT(*) FROM account_titles_clean")->fetchColumn();
echo "[OK] Inserted $c distinct rows into account_titles_clean\n";

// Step 3: Swap tables
$pdo->exec("DROP TABLE account_titles");
$pdo->exec("RENAME TABLE account_titles_clean TO account_titles");
echo "[OK] Swapped account_titles -> clean version\n";

// Verify
$c = $pdo->query("SELECT COUNT(*) FROM account_titles")->fetchColumn();
echo "account_titles now has: $c rows\n";

echo "\n=== FIXING budget_entries (rebuilding) ===\n";

$pdo->exec("
    CREATE TABLE IF NOT EXISTS budget_entries_clean LIKE budget_entries
");

// Add AUTO_INCREMENT PK if missing
try {
    $pdo->exec("ALTER TABLE budget_entries_clean MODIFY id int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY");
} catch (Exception $e) {
    echo "[INFO] PK mod: " . $e->getMessage() . "\n";
}

// Add UNIQUE
try {
    $pdo->exec("ALTER TABLE budget_entries_clean ADD UNIQUE KEY uq_year_gl (year_id, gl_code)");
} catch (Exception $e) { /* might already exist */ }

$pdo->exec("
    INSERT IGNORE INTO budget_entries_clean (id, year_id, gl_code, account_title, actual, budget, remaining_amount, remaining_percent, created_at, updated_at)
    SELECT DISTINCT id, year_id, gl_code, account_title, actual, budget, remaining_amount, remaining_percent, created_at, updated_at
    FROM budget_entries
");
$c = $pdo->query("SELECT COUNT(*) FROM budget_entries_clean")->fetchColumn();
echo "[OK] Inserted $c distinct rows into budget_entries_clean\n";

$pdo->exec("DROP TABLE budget_entries");
$pdo->exec("RENAME TABLE budget_entries_clean TO budget_entries");
echo "[OK] Swapped budget_entries -> clean version\n";

$c = $pdo->query("SELECT COUNT(*) FROM budget_entries")->fetchColumn();
echo "budget_entries now has: $c rows\n";

// Final duplication check
$dupes = $pdo->query("SELECT COUNT(*) FROM account_titles")->fetchColumn();
$uniq  = $pdo->query("SELECT COUNT(DISTINCT gl_code) FROM account_titles")->fetchColumn();
echo "\nFINAL: account_titles total=$dupes unique_gl=$uniq " . ($dupes==$uniq ? "[CLEAN]" : "[STILL DUPED]") . "\n";

$dupes = $pdo->query("SELECT COUNT(*) FROM budget_entries")->fetchColumn();
$uniq  = $pdo->query("SELECT COUNT(DISTINCT CONCAT(year_id,'-',gl_code)) FROM budget_entries")->fetchColumn();
echo "FINAL: budget_entries total=$dupes unique_pairs=$uniq " . ($dupes==$uniq ? "[CLEAN]" : "[STILL DUPED]") . "\n";
