<?php
// Test de connexion à la base de données
require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $db = Database::getInstance();
    
    // Tester la connexion
    $user = $db->fetchOne("SELECT id, email, password FROM users WHERE email = ?", ['admin@eventplatform.com']);
    
    if ($user) {
        // Tester le mot de passe
        $testPassword = 'admin123';
        $isValid = password_verify($testPassword, $user['password']);
        
        echo json_encode([
            'database' => 'OK',
            'user_found' => true,
            'email' => $user['email'],
            'password_valid' => $isValid,
            'stored_hash' => $user['password']
        ]);
    } else {
        echo json_encode([
            'database' => 'OK',
            'user_found' => false,
            'message' => 'Utilisateur admin non trouvé'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'database' => 'ERROR',
        'message' => $e->getMessage()
    ]);
}