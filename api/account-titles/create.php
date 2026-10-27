<?php
// START: CreateAccountTitleHandler - Subchild class handling account title creation
require_once __DIR__ . '/BaseAccountTitlesHandler.php';

class CreateAccountTitleHandler extends BaseAccountTitlesHandler {
    public function handle(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->respondError('Method not allowed', 405);
        }

        try {
            $input = $this->getJsonInput();
            $glCode = trim($input['glCode'] ?? $input['gl_code'] ?? '');
            $accountTitle = trim($input['accountTitle'] ?? $input['account_title'] ?? '');
            $category = trim($input['category'] ?? 'mooe');
            if ($category === '') {
                $category = 'mooe';
            }
            $displayOrder = isset($input['displayOrder']) || isset($input['display_order'])
                ? (int)($input['displayOrder'] ?? $input['display_order'])
                : null;

            if ($glCode === '') {
                $this->respondError('G/L Code is required');
            }
            if ($accountTitle === '') {
                $this->respondError('Account Title is required');
            }

            // Check if gl_code already exists
            $checkStmt = $this->pdo->prepare('SELECT id FROM account_titles WHERE gl_code = ? LIMIT 1');
            $checkStmt->execute([$glCode]);
            if ($checkStmt->fetch()) {
                $this->respondError('An account title with this G/L Code already exists');
            }

            if ($displayOrder === null) {
                $maxStmt = $this->pdo->query('SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM account_titles');
                $displayOrder = (int)($maxStmt->fetch()['next_order'] ?? 1);
            }

            $stmt = $this->pdo->prepare('
                INSERT INTO account_titles (gl_code, account_title, category, display_order)
                VALUES (?, ?, ?, ?)
            ');
            $stmt->execute([$glCode, $accountTitle, $category, $displayOrder]);
            $newId = (int)$this->pdo->lastInsertId();

            $this->respondSuccess([
                'message' => 'Account title added successfully',
                'data' => [
                    'id' => $newId,
                    'gl_code' => $glCode,
                    'account_title' => $accountTitle,
                    'category' => $category,
                    'display_order' => $displayOrder
                ]
            ], 201);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }
}

try {
    $handler = new CreateAccountTitleHandler();
    $handler->handle();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
// END: CreateAccountTitleHandler
