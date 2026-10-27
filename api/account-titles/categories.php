<?php
// START: CategoriesAccountTitlesHandler - Subchild class handling fund categories listing for account titles
require_once __DIR__ . '/BaseAccountTitlesHandler.php';

class CategoriesAccountTitlesHandler extends BaseAccountTitlesHandler {
    public function handle(): void {
        try {
            $stmt = $this->pdo->query('
                SELECT code, name, description, display_order
                FROM fund_categories
                ORDER BY display_order ASC, name ASC
            ');
            $rows = $stmt->fetchAll();

            $this->respondSuccess(['data' => $rows]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }
}

try {
    $handler = new CategoriesAccountTitlesHandler();
    $handler->handle();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
// END: CategoriesAccountTitlesHandler
