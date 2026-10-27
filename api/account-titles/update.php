<?php
// START: UpdateAccountTitleHandler - Subchild class handling account title update
require_once __DIR__ . '/BaseAccountTitlesHandler.php';

class UpdateAccountTitleHandler extends BaseAccountTitlesHandler {
    public function handle(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
            $this->respondError('Method not allowed', 405);
        }

        try {
            $input = $this->getJsonInput();
            $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
            if (!$id) {
                $this->respondError('Account title ID is required');
            }

            // Find existing record
            $findStmt = $this->pdo->prepare('SELECT id, gl_code, account_title, display_order FROM account_titles WHERE id = ?');
            $findStmt->execute([$id]);
            $existing = $findStmt->fetch();
            if (!$existing) {
                $this->respondError('Account title not found', 404);
            }

            $glCode = isset($input['glCode']) || isset($input['gl_code'])
                ? trim($input['glCode'] ?? $input['gl_code'] ?? '')
                : $existing['gl_code'];

            $accountTitle = isset($input['accountTitle']) || isset($input['account_title'])
                ? trim($input['accountTitle'] ?? $input['account_title'] ?? '')
                : $existing['account_title'];

            $category = isset($input['category'])
                ? trim($input['category'])
                : ($existing['category'] ?? 'mooe');
            if ($category === '') {
                $category = 'mooe';
            }

            $displayOrder = isset($input['displayOrder']) || isset($input['display_order'])
                ? (int)($input['displayOrder'] ?? $input['display_order'])
                : (int)$existing['display_order'];

            if ($glCode === '') {
                $this->respondError('G/L Code cannot be empty');
            }
            if ($accountTitle === '') {
                $this->respondError('Account Title cannot be empty');
            }

            // Check if gl_code conflicts with another row
            $checkStmt = $this->pdo->prepare('SELECT id FROM account_titles WHERE gl_code = ? AND id != ? LIMIT 1');
            $checkStmt->execute([$glCode, $id]);
            if ($checkStmt->fetch()) {
                $this->respondError('Another account title with this G/L Code already exists');
            }

            $stmt = $this->pdo->prepare('
                UPDATE account_titles
                SET gl_code = ?, account_title = ?, category = ?, display_order = ?
                WHERE id = ?
            ');
            $stmt->execute([$glCode, $accountTitle, $category, $displayOrder, $id]);

            // Automatically cascades through foreign key relationships
            $this->respondSuccess([
                'message' => 'Account title updated successfully',
                'data' => [
                    'id' => $id,
                    'gl_code' => $glCode,
                    'account_title' => $accountTitle,
                    'category' => $category,
                    'display_order' => $displayOrder
                ]
            ]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }
}

try {
    $handler = new UpdateAccountTitleHandler();
    $handler->handle();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
// END: UpdateAccountTitleHandler
