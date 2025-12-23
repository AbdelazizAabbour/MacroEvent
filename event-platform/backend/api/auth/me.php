<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helpers.php';


setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Méthode non autorisée', 405);
}


if (!isLoggedIn()) {
    errorResponse('Non authentifié', 401);
}

try {
    $db = Database::getInstance();
    $userId = getCurrentUserId();
    
    $user = $db->fetchOne(
        "SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?",
        [$userId]
    );
    
    if (!$user) {
        session_destroy();
        errorResponse('Utilisateur non trouvé', 404);
    }
    
    $stats = [];
    
    $participationCount = $db->fetchOne(
        "SELECT COUNT(*) as count FROM participations WHERE user_id = ? AND status = 'registered'",
        [$userId]
    );
    $stats['participations'] = (int)$participationCount['count'];
    
    $evaluationCount = $db->fetchOne(
        "SELECT COUNT(*) as count FROM evaluations WHERE user_id = ?",
        [$userId]
    );
    $stats['evaluations'] = (int)$evaluationCount['count'];
    
    // Stats admin
    if ($user['role'] === 'admin') {
        $eventsCreated = $db->fetchOne(
            "SELECT COUNT(*) as count FROM events WHERE created_by = ?",
            [$userId]
        );
        $stats['events_created'] = (int)$eventsCreated['count'];
        
        $totalUsers = $db->fetchOne("SELECT COUNT(*) as count FROM users");
        $stats['total_users'] = (int)$totalUsers['count'];
        
        $totalEvents = $db->fetchOne("SELECT COUNT(*) as count FROM events");
        $stats['total_events'] = (int)$totalEvents['count'];
    }
    

    successResponse([
        'user' => $user,
        'stats' => $stats
    ]);
    
} catch (Exception $e) {
    logError('Erreur lors de la récupération du profil', [
        'user_id' => getCurrentUserId(),
        'error' => $e->getMessage()
    ]);
    
    errorResponse('Erreur lors de la récupération du profil', 500);
}