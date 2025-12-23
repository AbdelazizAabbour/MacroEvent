<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helpers.php';


setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Méthode non autorisée', 405);
}

$data = getJsonInput();

$errors = validateRequired($data, ['email', 'password']);

if (!empty($errors)) {
    errorResponse(implode(', ', $errors));
}
$email = sanitizeString($data['email']);
$password = $data['password'];

if (!isValidEmail($email)) {
    errorResponse('Adresse email invalide');
}

try {
    $db = Database::getInstance();
    
    $user = $db->fetchOne(
        "SELECT id, username, email, password, role, created_at FROM users WHERE email = ?",
        [$email]
    );
    
    if (!$user) {
        errorResponse('Email ou mot de passe incorrect', 401);
    }
    if (!password_verify($password, $user['password'])) {
        errorResponse('Email ou mot de passe incorrect', 401);
    }
    
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['logged_in'] = true;
    $_SESSION['login_time'] = time();
    
    $token = generateToken([
        'user_id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role']
    ]);
    
    $userData = [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role'],
        'created_at' => $user['created_at']
    ];
    
    successResponse([
        'user' => $userData,
        'token' => $token
    ], 'Connexion réussie');
    
} catch (Exception $e) {
    logError('Erreur lors de la connexion', [
        'email' => $email,
        'error' => $e->getMessage()
    ]);
    
    errorResponse('Une erreur est survenue lors de la connexion', 500);
}
