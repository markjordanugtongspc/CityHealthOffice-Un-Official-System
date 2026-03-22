<?php
/**
 * Database Configuration
 * City Health Office Database Connection
 */

require_once __DIR__ . '/env.php';

// Database credentials (loaded from config/.env, with safe defaults)
define('DB_HOST', env('DB_HOST', '127.0.0.1'));
define('DB_PORT', env('DB_PORT', '3306'));
define('DB_USER', env('DB_USER', 'root'));
define('DB_PASS', env('DB_PASS', ''));
define('DB_NAME', env('DB_NAME', 'cho_db'));
define('DB_CHARSET', env('DB_CHARSET', 'utf8mb4'));

/**
 * Get database connection
 * @return PDO|null
 */
function getDB() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $port = (int) DB_PORT;
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                DB_HOST,
                $port,
                DB_NAME,
                DB_CHARSET
            );
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            return null;
        }
    }
    
    return $pdo;
}

/**
 * Execute a prepared statement
 * @param string $sql SQL query with placeholders
 * @param array $params Parameters to bind
 * @return PDOStatement|false
 */
function executeQuery($sql, $params = []) {
    $pdo = getDB();
    if (!$pdo) return false;
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    } catch (PDOException $e) {
        error_log('Query execution failed: ' . $e->getMessage());
        return false;
    }
}

/**
 * Get current year from database or system
 * @return int
 */
function getCurrentYear() {
    $pdo = getDB();
    if (!$pdo) return (int)date('Y');
    
    try {
        $stmt = $pdo->query('SELECT YEAR(CURDATE()) as year');
        $result = $stmt->fetch();
        return (int)($result['year'] ?? date('Y'));
    } catch (PDOException $e) {
        return (int)date('Y');
    }
}
