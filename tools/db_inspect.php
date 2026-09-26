<?php
require_once __DIR__ . '/../config/db.php';
$pdo = getDB();

echo "=== Verification (InnoDB reports) ===\n";
$r = $pdo->query("SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('account_titles','budget_entries')")->fetchAll(PDO::FETCH_ASSOC);
foreach ($r as $row) echo $row['TABLE_NAME'] . ": ~{$row['TABLE_ROWS']} rows\n";

echo "\n=== account_titles DISTINCT count ===\n";
$c = $pdo->query("SELECT COUNT(DISTINCT gl_code) as uniq, COUNT(*) as total FROM account_titles")->fetch(PDO::FETCH_ASSOC);
echo "Total={$c['total']} Unique gl_codes={$c['uniq']}\n";
if ($c['total'] == $c['uniq']) echo "[OK] No duplicates.\n"; else echo "[WARN] Duplicates exist!\n";

echo "\n=== budget_entries DISTINCT count ===\n";
$c = $pdo->query("SELECT COUNT(*) as total, COUNT(DISTINCT CONCAT(year_id,'-',gl_code)) as uniq FROM budget_entries")->fetch(PDO::FETCH_ASSOC);
echo "Total={$c['total']} Unique year+gl pairs={$c['uniq']}\n";
if ($c['total'] == $c['uniq']) echo "[OK] No duplicates.\n"; else echo "[WARN] Duplicates exist!\n";

echo "\n=== UNIQUE constraints check ===\n";
$r = $pdo->query("SHOW INDEX FROM account_titles WHERE Key_name != 'PRIMARY'")->fetchAll(PDO::FETCH_ASSOC);
foreach ($r as $row) echo "account_titles key: {$row['Key_name']} col={$row['Column_name']} unique=" . ($row['Non_unique'] == 0 ? 'YES' : 'NO') . "\n";
if (!$r) echo "(no non-primary keys yet)\n";

$r = $pdo->query("SHOW INDEX FROM budget_entries WHERE Key_name != 'PRIMARY'")->fetchAll(PDO::FETCH_ASSOC);
foreach ($r as $row) echo "budget_entries key: {$row['Key_name']} col={$row['Column_name']} unique=" . ($row['Non_unique'] == 0 ? 'YES' : 'NO') . "\n";
if (!$r) echo "(no non-primary keys yet)\n";

echo "\n=== Trying to add UNIQUE constraints ===\n";
try {
    $pdo->exec("ALTER TABLE account_titles ADD UNIQUE KEY uq_at_gl_code (gl_code)");
    echo "[OK] UNIQUE added to account_titles.gl_code\n";
} catch (Exception $e) {
    echo "[INFO] " . $e->getMessage() . "\n";
}

try {
    $pdo->exec("ALTER TABLE budget_entries ADD UNIQUE KEY uq_be_year_gl (year_id, gl_code)");
    echo "[OK] UNIQUE added to budget_entries (year_id, gl_code)\n";
} catch (Exception $e) {
    echo "[INFO] " . $e->getMessage() . "\n";
}
