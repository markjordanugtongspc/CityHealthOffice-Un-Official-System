<?php
// START: CheckDuplicateAccountTitleHandler - Checks if gl_code or account_title already exists in database
require_once __DIR__ . '/BaseAccountTitlesHandler.php';

class CheckDuplicateAccountTitleHandler extends BaseAccountTitlesHandler {
    public function handle(): void {
        try {
            $glCode = trim($_GET['gl_code'] ?? $_GET['glCode'] ?? '');
            $title = trim($_GET['account_title'] ?? $_GET['accountTitle'] ?? '');
            $excludeId = (int)($_GET['exclude_id'] ?? $_GET['excludeId'] ?? 0);

            $glExists = false;
            $titleExists = false;
            $conflictingGlTitle = '';

            if ($glCode !== '') {
                $stmt = $this->pdo->prepare('SELECT id, gl_code, account_title FROM account_titles WHERE LOWER(gl_code) = LOWER(?) AND id != ? LIMIT 1');
                $stmt->execute([$glCode, $excludeId]);
                $row = $stmt->fetch();
                if ($row) {
                    $glExists = true;
                    $conflictingGlTitle = $row['account_title'];
                }
            }

            if ($title !== '') {
                $stmt = $this->pdo->prepare('SELECT id, gl_code, account_title FROM account_titles WHERE LOWER(account_title) = LOWER(?) AND id != ? LIMIT 1');
                $stmt->execute([$title, $excludeId]);
                $row = $stmt->fetch();
                if ($row) {
                    $titleExists = true;
                }
            }

            $this->respondSuccess([
                'glExists' => $glExists,
                'titleExists' => $titleExists,
                'conflictingGlTitle' => $conflictingGlTitle
            ]);
        } catch (Exception $e) {
            $this->respondError($e->getMessage(), 500);
        }
    }
}

try {
    $handler = new CheckDuplicateAccountTitleHandler();
    $handler->handle();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
// END: CheckDuplicateAccountTitleHandler
