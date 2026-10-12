<?php
// START: BaseAccountTitlesHandler - Parent base class for Account Titles API actions
abstract class BaseAccountTitlesHandler {
    protected PDO $pdo;

    public function __construct() {
        require_once __DIR__ . '/../../config/db.php';
        require_once __DIR__ . '/../../config/session.php';

        header('Content-Type: application/json');
        requireAuth(true);

        $db = getDB();
        if (!$db) {
            throw new Exception('Database connection failed');
        }
        $this->pdo = $db;
    }

    /**
     * Get JSON input body as associative array
     */
    protected function getJsonInput(): array {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    /**
     * Send standard JSON success response
     */
    protected function respondSuccess(array $payload = [], int $statusCode = 200): void {
        http_response_code($statusCode);
        echo json_encode(array_merge(['success' => true], $payload));
        exit;
    }

    /**
     * Send standard JSON error response
     */
    protected function respondError(string $message, int $statusCode = 400): void {
        http_response_code($statusCode);
        echo json_encode(['success' => false, 'message' => $message]);
        exit;
    }

    /**
     * Abstract execution entry point implemented by subchild handlers
     */
    abstract public function handle(): void;
}
// END: BaseAccountTitlesHandler
