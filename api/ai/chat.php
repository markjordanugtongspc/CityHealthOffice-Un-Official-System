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
