<?php
// Démarrer la session si pas encore active
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}


function setCorsHeaders(): void {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    $allowed_origins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173'
    ];
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: http://localhost:5173");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json; charset=UTF-8");
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}


function jsonResponse($data, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function errorResponse(string $message, int $statusCode = 400): void {
    jsonResponse([
        'success' => false,
        'error' => $message
    ], $statusCode);
}

function successResponse($data = null, string $message = ''): void {
    $response = ['success' => true];
    
    if ($message) {
        $response['message'] = $message;
    }
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    jsonResponse($response);
}


function getJsonInput(): array {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return is_array($data) ? $data : [];
}


function validateRequired(array $data, array $required): array {
    $errors = [];
    
    foreach ($required as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $errors[] = "Le champ '$field' est requis";
        }
    }
    
    return $errors;
}


function sanitizeString(string $str): string {
    return htmlspecialchars(strip_tags(trim($str)), ENT_QUOTES, 'UTF-8');
}


function isLoggedIn(): bool {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}


function isAdmin(): bool {
    return isLoggedIn() && isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}


function getCurrentUserId(): ?int {
    return isLoggedIn() ? (int)$_SESSION['user_id'] : null;
}


function requireAuth(): void {
    if (!isLoggedIn()) {
        errorResponse('Authentification requise', 401);
    }
}


function requireAdmin(): void {
    requireAuth();
    if (!isAdmin()) {
        errorResponse('Droits administrateur requis', 403);
    }
}


function isValidEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}


function generateToken(array $payload): string {
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload['exp'] = time() + 3600 * 24;
    $payload = base64_encode(json_encode($payload));
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", 'secret_key_change_in_production', true));
    
    return "$header.$payload.$signature";
}


function verifyToken(string $token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    [$header, $payload, $signature] = $parts;
    
    $expectedSig = base64_encode(hash_hmac('sha256', "$header.$payload", 'secret_key_change_in_production', true));
    
    if ($signature !== $expectedSig) {
        return false;
    }
    
    $data = json_decode(base64_decode($payload), true);
    
    if (isset($data['exp']) && $data['exp'] < time()) {
        return false;
    }
    
    return $data;
}


function formatDate(string $date, string $format = 'd/m/Y H:i'): string {
    return date($format, strtotime($date));
}

function logError(string $message, array $context = []): void {
    $logMessage = date('Y-m-d H:i:s') . " - $message";
    if (!empty($context)) {
        $logMessage .= " - " . json_encode($context);
    }
    error_log($logMessage);
}