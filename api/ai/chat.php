<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/env.php';
require_once __DIR__ . '/../../config/session.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Authentication required']);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
$history = $input['history'] ?? [];
$message = $input['message'] ?? '';

if (empty($message)) {
    echo json_encode(['error' => 'Message is required']);
    exit;
}

// Get API Key and settings from .env
$apiKey = env('LITEROUTER_API_KEY');
$modelOptions = env('LITEROUTER_MODEL', 'deepseek-free');
$modelName = explode(',', explode(' ', $modelOptions)[0])[0];
$baseUrl = env('LITEROUTER_BASE_URL', 'https://api.literouter.com/v1');

if (empty($apiKey)) {
    echo json_encode(['error' => 'AI Service is not fully configured (Missing API Key)']);
    exit;
}

// Load Knowledge Base
$knowledgePath = __DIR__ . '/../../config/ai_knowledge.json';
$knowledge = [];
if (is_readable($knowledgePath)) {
    $knowledge = json_decode(file_get_contents($knowledgePath), true);
}

$devName = $knowledge['developer'] ?? 'Mark Jordan Ugtong';
$projName = $knowledge['project_name'] ?? 'City Health Office System';

// Build the dynamic system prompt
$systemPrompt = "You are a helpful AI Personal Assistant for the $projName, developed by $devName. ";
$systemPrompt .= "If anyone asks who created or developed you, answer it was $devName. ";

if (!empty($knowledge['modules'])) {
    $systemPrompt .= "Here is information about the system modules: ";
    foreach ($knowledge['modules'] as $name => $desc) {
        $systemPrompt .= "[$name]: $desc ";
    }
}

$systemPrompt .= "Always be professional, concise, and friendly. ";
if (isset($knowledge['about_me_link'])) {
    $systemPrompt .= "Refer users to " . $knowledge['about_me_link'] . " for more info about the developer. ";
}

// Fetch real-time DB context for the AI
require_once __DIR__ . '/../../config/db.php';
$dbContext = "CURRENT SYSTEM DATA FROM DATABASE:\n";
try {
    $pdo = getDB();
    if ($pdo) {
        // Budget
        $stmt = $pdo->query("SELECT SUM(budget) as budget, SUM(actual) as actual, SUM(remaining_amount) as rem FROM budget_entries");
        $b = $stmt->fetch(PDO::FETCH_ASSOC);
        $dbContext .= "- Total Budget / Total Income / Fund Downloaded: ₱" . number_format($b['budget'] ?? 0, 2) . "\n";
        $dbContext .= "- Total Expenses (Budget Actuals): ₱" . number_format($b['actual'] ?? 0, 2) . "\n";
        $dbContext .= "- Total Remaining Budget: ₱" . number_format($b['rem'] ?? 0, 2) . "\n";

        // Itemized
        $stmt = $pdo->query("SELECT COUNT(*) as cnt, SUM(check_amount) as total, SUM(mooe) as mooe, SUM(spf) as spf, SUM(mcp_facility) as mcp, SUM(konsulta_facility) as kf, SUM(konsulta_pf) as kpf FROM itemized_transactions WHERE archived = 0");
        $i = $stmt->fetch(PDO::FETCH_ASSOC);
        $dbContext .= "- Total Itemized Transactions Count: " . number_format($i['cnt'] ?? 0) . "\n";
        $dbContext .= "- Total Itemized Expenses/Vouchers/Checks Amount: ₱" . number_format($i['total'] ?? 0, 2) . "\n";
        $dbContext .= "- Itemized Breakdown: MOOE: ₱" . number_format($i['mooe'] ?? 0, 2) . ", SPF: ₱" . number_format($i['spf'] ?? 0, 2) . ", MCP Facility: ₱" . number_format($i['mcp'] ?? 0, 2) . ", Konsulta Facility: ₱" . number_format($i['kf'] ?? 0, 2) . ", Konsulta PF: ₱" . number_format($i['kpf'] ?? 0, 2) . "\n";

        // Special Fund
        $stmt = $pdo->query("SELECT SUM(budget) as budget, SUM(actual) as actual, SUM(remaining_amount) as rem FROM special_fund_entries");
        $sf = $stmt->fetch(PDO::FETCH_ASSOC);
        $dbContext .= "- Total Special Fund Budget: ₱" . number_format($sf['budget'] ?? 0, 2) . "\n";
        $dbContext .= "- Total Special Fund Expenses: ₱" . number_format($sf['actual'] ?? 0, 2) . "\n";
        $dbContext .= "- Total Special Fund Remaining: ₱" . number_format($sf['rem'] ?? 0, 2) . "\n";
    }
} catch (Exception $e) {
    // Gracefully handle if tables don't exist yet or connection fails
}

$systemPrompt .= "\n" . $dbContext . "\n";
$systemPrompt .= "CRITICAL SYSTEM RULES:\n";
$systemPrompt .= "1. You are READ-ONLY. You are strictly forbidden from adding, editing, or deleting any data. If the user asks to modify data, politely inform them that you do not have permission and can only read/provide information.\n";
$systemPrompt .= "2. Whenever the user asks about financial data, amounts, total income, or expenses, use the EXACT values provided in the CURRENT SYSTEM DATA above.\n";
$systemPrompt .= "3. You MUST format any fetched financial amounts with the Philippine Peso sign (₱) and make the amount bold (e.g., **₱123,456.00**).\n";

if (!empty($knowledge['general_instructions'])) {
    $systemPrompt .= "Follow these additional rules: ";
    foreach ($knowledge['general_instructions'] as $instruction) {
        $systemPrompt .= "- $instruction ";
    }
}

// Build the messages array for the API
$apiMessages = [];

$apiMessages[] = [
    'role' => 'system',
    'content' => $systemPrompt
];

// Add conversation history
foreach ($history as $msg) {
    if (isset($msg['role']) && isset($msg['content'])) {
        $apiMessages[] = [
            'role' => $msg['role'] === 'user' ? 'user' : 'assistant',
            'content' => $msg['content']
        ];
    }
}

// Add the current message
$apiMessages[] = [
    'role' => 'user',
    'content' => $message
];

// Prepare cURL request to Literouter (OpenAI compatible endpoint)
// rtrim removes trailing slashes, then we append /chat/completions Since base is ../v1
$ch = curl_init(rtrim($baseUrl, '/') . '/chat/completions');
$payload = json_encode([
    'model' => $modelName,
    'messages' => $apiMessages,
    'max_tokens' => 1000,
    'temperature' => 0.7
]);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ],
    CURLOPT_TIMEOUT => 30 // Wait up to 30 seconds for AI response
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo json_encode(['error' => 'Connection to AI service failed: ' . $error]);
    exit;
}

$responseData = json_decode($response, true);

if ($httpCode >= 400 || isset($responseData['error'])) {
    $errorMsg = $responseData['error']['message'] ?? 'Unknown API error (HTTP ' . $httpCode . ')';
    echo json_encode(['error' => $errorMsg]);
    exit;
}

$aiMessage = $responseData['choices'][0]['message']['content'] ?? 'I could not generate a response. Please try again.';

echo json_encode([
    'response' => $aiMessage,
    'timestamp' => date('Y-m-d H:i:s')
]);
