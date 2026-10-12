<?php
// START: DeleteAccountTitleHandler - Subchild class handling account title deletion
require_once __DIR__ . '/BaseAccountTitlesHandler.php';

class DeleteAccountTitleHandler extends BaseAccountTitlesHandler {
    public function handle(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            $this->respondError('Method not allowed', 405);
        }

        try {
            $input = $this->getJsonInput();
            $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
            if (!$id) {
                $this->respondError('Account title ID is required');
            }

            // Verify existence
            $findStmt = $this->pdo->prepare('SELECT id, gl_code, account_title FROM account_titles WHERE id = ?');
            $findStmt->execute([$id]);
            $existing = $findStmt->fetch();
            if (!$existing) {
                $this->respondError('Account title not found', 404);
            }

            $stmt = $this->pdo->prepare('DELETE FROM account_titles WHERE id = ?');
            $stmt->execute([$id]);

            $this->respondSuccess([
                'message' => 'Account title deleted successfully',
                'data' => [
                    'id' => $id,
                    'gl_code' => $existing['gl_code'],
                    'account_title' => $existing['account_title']
                ]
            ]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }
}

try {
    $handler = new DeleteAccountTitleHandler();
    $handler->handle();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
// END: DeleteAccountTitleHandler
