<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Méthode non autorisée', 405);
}

$data = getJsonInput();

$errors = validateRequired($data, ['username', 'email', 'password']);

if (!empty($errors)) {
    errorResponse(implode(', ', $errors));
}

$username = sanitizeString($data['username']);
$email = sanitizeString($data['email']);
$password = $data['password']; 

if (strlen($username) < 3 || strlen($username) > 50) {
    errorResponse('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères');
}

if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    errorResponse('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores');
}

if (!isValidEmail($email)) {
    errorResponse('Adresse email invalide');
}

if (strlen($password) < 6) {
    errorResponse('Le mot de passe doit contenir au moins 6 caractères');
}

try {
    $db = Database::getInstance();
    
    $existingUser = $db->fetchOne(
        "SELECT id FROM users WHERE username = ?",
        [$username]
    );
    
    if ($existingUser) {
        errorResponse('Ce nom d\'utilisateur est déjà utilisé');
    }
    
    $existingEmail = $db->fetchOne(
        "SELECT id FROM users WHERE email = ?",
        [$email]
    );
    
    if ($existingEmail) {
        errorResponse('Cette adresse email est déjà utilisée');
    }
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $db->query(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'user')",
        [$username, $email, $hashedPassword]
    );
    
    $userId = $db->lastInsertId();
    
    $user = $db->fetchOne(
        "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
        [$userId]
    );
    
    successResponse([
        'user' => $user,
        'message' => 'Inscription réussie ! Vous pouvez maintenant vous connecter.'
    ], 'Inscription réussie');
    
} catch (Exception $e) {
    logError('Erreur lors de l\'inscription', [
        'username' => $username,
        'email' => $email,
        'error' => $e->getMessage()
    ]);
    
    errorResponse('Une erreur est survenue lors de l\'inscription', 500);
}
