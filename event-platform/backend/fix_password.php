<?php
require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $db = Database::getInstance();
    
    // Générer un nouveau hash pour "admin123"
    $newPassword = 'admin123';
    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Mettre à jour dans la base
    $db->query(
        "UPDATE users SET password = ? WHERE email = ?",
        [$newHash, 'admin@eventplatform.com']
    );
    
    // Mettre à jour aussi les autres utilisateurs de test
    $db->query(
        "UPDATE users SET password = ? WHERE email IN (?, ?, ?)",
        [$newHash, 'john@example.com', 'jane@example.com', 'bob@example.com']
    );
    
    echo json_encode([
        'success' => true,
        'message' => 'Mots de passe mis à jour!',
        'new_hash' => $newHash,
        'test_verify' => password_verify('admin123', $newHash)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}