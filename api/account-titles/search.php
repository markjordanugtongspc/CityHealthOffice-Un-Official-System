<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAuth(true);

try {
    $pdo = getDB();
    if (!$pdo) throw new Exception('Database connection failed');

    $q = isset($_GET['q']) ? trim($_GET['q']) : '';
    $limit = min(50, max(5, (int)($_GET['limit'] ?? 25)));

    if ($q === '') {
        $stmt = $pdo->prepare('SELECT id, gl_code, account_title, display_order FROM account_titles ORDER BY display_order ASC, gl_code ASC LIMIT :lim');
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    } else {
        $pattern = '%' . $q . '%';
        $stmt = $pdo->prepare('SELECT id, gl_code, account_title, display_order FROM account_titles WHERE account_title LIKE :q OR gl_code LIKE :q2 ORDER BY display_order ASC, gl_code ASC LIMIT :lim');
        $stmt->bindValue(':q', $pattern, PDO::PARAM_STR);
        $stmt->bindValue(':q2', $pattern, PDO::PARAM_STR);
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    }
    $stmt->execute();
    $rows = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $rows]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
