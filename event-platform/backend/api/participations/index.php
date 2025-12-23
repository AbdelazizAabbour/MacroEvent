<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helpers.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getParticipations();
        break;
    case 'POST':
        registerToEvent();
        break;
    case 'DELETE':
        cancelParticipation();
        break;
    default:
        errorResponse('Méthode non autorisée', 405);
}


function getParticipations(): void {
    try {
        $db = Database::getInstance();
        
        $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
        $eventId = isset($_GET['event_id']) ? (int)$_GET['event_id'] : null;
        
        if ($userId === null && isLoggedIn()) {
            $userId = getCurrentUserId();
        }
        
        $sql = "SELECT p.*, 
                       e.title as event_title,
                       e.event_date,
                       e.location,
                       e.status as event_status,
                       u.username
                FROM participations p
                JOIN events e ON p.event_id = e.id
                JOIN users u ON p.user_id = u.id
                WHERE 1=1";
        
        $params = [];
        
        if ($userId) {
            $sql .= " AND p.user_id = ?";
            $params[] = $userId;
        }
        
        if ($eventId) {
            $sql .= " AND p.event_id = ?";
            $params[] = $eventId;
        }
        
        $sql .= " ORDER BY p.registration_date DESC";
        
        $participations = $db->fetchAll($sql, $params);
        
        $formatted = array_map(function($p) {
            return [
                'id' => (int)$p['id'],
                'user_id' => (int)$p['user_id'],
                'username' => $p['username'],
                'event_id' => (int)$p['event_id'],
                'event_title' => $p['event_title'],
                'event_date' => $p['event_date'],
                'location' => $p['location'],
                'event_status' => $p['event_status'],
                'registration_date' => $p['registration_date'],
                'status' => $p['status']
            ];
        }, $participations);
        
        successResponse(['participations' => $formatted]);
        
    } catch (Exception $e) {
        logError('Erreur lors de la récupération des participations', [
            'error' => $e->getMessage()
        ]);
        errorResponse('Erreur lors de la récupération des participations', 500);
    }
}

function registerToEvent(): void {
    requireAuth();
    
    $data = getJsonInput();
    
    if (!isset($data['event_id']) || !is_numeric($data['event_id'])) {
        errorResponse('ID d\'événement requis');
    }
    
    $eventId = (int)$data['event_id'];
    $userId = getCurrentUserId();
    
    try {
        $db = Database::getInstance();
        
        
        $result = $db->callProcedure(
            'sp_register_user_to_event',
            [$userId, $eventId],
            ['success', 'message']
        );
        
        if ($result['success']) {
            $participation = $db->fetchOne(
                "SELECT p.*, e.title as event_title, e.event_date
                 FROM participations p
                 JOIN events e ON p.event_id = e.id
                 WHERE p.user_id = ? AND p.event_id = ?",
                [$userId, $eventId]
            );
            
            successResponse([
                'participation' => $participation
            ], $result['message']);
        } else {
            errorResponse($result['message']);
        }
        
    } catch (Exception $e) {
        // Vérifier si c'est une erreur du trigger
        if (strpos($e->getMessage(), 'Impossible de s\'inscrire') !== false ||
            strpos($e->getMessage(), 'événement complet') !== false ||
            strpos($e->getMessage(), 'événement annulé') !== false ||
            strpos($e->getMessage(), 'événement terminé') !== false) {
            errorResponse($e->getMessage());
        }
        
        logError('Erreur lors de l\'inscription', [
            'user_id' => $userId,
            'event_id' => $eventId,
            'error' => $e->getMessage()
        ]);
        errorResponse('Erreur lors de l\'inscription à l\'événement', 500);
    }
}


function cancelParticipation(): void {
    requireAuth();
    
    $eventId = isset($_GET['event_id']) ? (int)$_GET['event_id'] : null;
    
    if (!$eventId) {
        $data = getJsonInput();
        $eventId = isset($data['event_id']) ? (int)$data['event_id'] : null;
    }
    
    if (!$eventId) {
        errorResponse('ID d\'événement requis');
    }
    
    $userId = getCurrentUserId();
    
    try {
        $db = Database::getInstance();
        
        $result = $db->callProcedure(
            'sp_cancel_participation',
            [$userId, $eventId],
            ['success', 'message']
        );
        
        if ($result['success']) {
            successResponse(null, $result['message']);
        } else {
            errorResponse($result['message']);
        }
        
    } catch (Exception $e) {
        logError('Erreur lors de l\'annulation', [
            'user_id' => $userId,
            'event_id' => $eventId,
            'error' => $e->getMessage()
        ]);
        errorResponse('Erreur lors de l\'annulation de la participation', 500);
    }
}
