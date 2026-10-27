<?php
// START: ListAccountTitlesHandler - Subchild class handling account titles listing
require_once __DIR__ . '/BaseAccountTitlesHandler.php';

class ListAccountTitlesHandler extends BaseAccountTitlesHandler {
    public function handle(): void {
        try {
            $stmt = $this->pdo->query('
                SELECT id, gl_code, account_title, category, created_at, updated_at
                FROM account_titles
                ORDER BY CAST(gl_code AS UNSIGNED) ASC, gl_code ASC
            ');
            $rows = $stmt->fetchAll();

            $this->respondSuccess(['data' => $rows]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }
}

try {
    $handler = new ListAccountTitlesHandler();
    $handler->handle();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
// END: ListAccountTitlesHandler
