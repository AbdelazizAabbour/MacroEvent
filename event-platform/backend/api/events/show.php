<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helpers.php';


setCorsHeaders();


$eventId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($eventId <= 0) {
    errorResponse('ID d\'événement invalide');
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getEvent($eventId);
        break;
    case 'PUT':
        updateEvent($eventId);
        break;
    case 'DELETE':
        deleteEvent($eventId);
        break;
    default:
        errorResponse('Méthode non autorisée', 405);
}


function getEvent(int $eventId): void {
    try {
        $db = Database::getInstance();
        
        
        $event = $db->fetchOne(
            "SELECT e.*, 
                    u.username as creator_name,
                    fn_get_available_spots(e.id) as available_spots,
                    fn_is_event_full(e.id) as is_full,
                    fn_get_event_status_label(e.status) as status_label
             FROM events e
             LEFT JOIN users u ON e.created_by = u.id
             WHERE e.id = ?",
            [$eventId]
        );
        
        if (!$event) {
            errorResponse('Événement non trouvé', 404);
        }
        
       
        $participants = $db->fetchAll(
            "SELECT u.id, u.username, p.registration_date, p.status
             FROM participations p
             JOIN users u ON p.user_id = u.id
             WHERE p.event_id = ? AND p.status = 'registered'
             ORDER BY p.registration_date ASC",
            [$eventId]
        );
        
       
        $evaluations = $db->fetchAll(
            "SELECT ev.*, u.username
             FROM evaluations ev
             JOIN users u ON ev.user_id = u.id
             WHERE ev.event_id = ?
             ORDER BY ev.created_at DESC",
            [$eventId]
        );
        
      
        $userParticipation = null;
        $userEvaluation = null;
        
        if (isLoggedIn()) {
            $userId = getCurrentUserId();
            
            
            $participation = $db->fetchOne(
                "SELECT * FROM participations WHERE user_id = ? AND event_id = ?",
                [$userId, $eventId]
            );
            $userParticipation = $participation ?: null;
            
          
            $evaluation = $db->fetchOne(
                "SELECT * FROM evaluations WHERE user_id = ? AND event_id = ?",
                [$userId, $eventId]
            );
            $userEvaluation = $evaluation ?: null;
        }
        
     
        successResponse([
            'event' => [
                'id' => (int)$event['id'],
                'title' => $event['title'],
                'description' => $event['description'],
                'event_date' => $event['event_date'],
                'location' => $event['location'],
                'max_capacity' => (int)$event['max_capacity'],
                'current_participants' => (int)$event['current_participants'],
                'available_spots' => (int)$event['available_spots'],
                'is_full' => (bool)$event['is_full'],
                'status' => $event['status'],
                'status_label' => $event['status_label'],
                'average_rating' => (float)$event['average_rating'],
                'total_ratings' => (int)$event['total_ratings'],
                'creator_name' => $event['creator_name'],
                'created_by' => (int)$event['created_by'],
                'created_at' => $event['created_at'],
                'updated_at' => $event['updated_at']
            ],
            'participants' => array_map(function($p) {
                return [
                    'id' => (int)$p['id'],
                    'username' => $p['username'],
                    'registration_date' => $p['registration_date'],
                    'status' => $p['status']
                ];
            }, $participants),
            'evaluations' => array_map(function($e) {
                return [
                    'id' => (int)$e['id'],
                    'user_id' => (int)$e['user_id'],
                    'username' => $e['username'],
                    'rating' => (int)$e['rating'],
                    'comment' => $e['comment'],
                    'created_at' => $e['created_at']
                ];
            }, $evaluations),
            'user_participation' => $userParticipation,
            'user_evaluation' => $userEvaluation
        ]);
        
    } catch (Exception $e) {
        logError('Erreur lors de la récupération de l\'événement', [
            'event_id' => $eventId,
            'error' => $e->getMessage()
        ]);
        errorResponse('Erreur lors de la récupération de l\'événement', 500);
    }
}


function updateEvent(int $eventId): void {
    requireAdmin();
    
    $data = getJsonInput();
    
    try {
        $db = Database::getInstance();
        
        $event = $db->fetchOne("SELECT * FROM events WHERE id = ?", [$eventId]);
        
        if (!$event) {
            errorResponse('Événement non trouvé', 404);
        }
        
        $updates = [];
        $params = [];
        
        if (isset($data['title'])) {
            $title = sanitizeString($data['title']);
            if (strlen($title) >= 3 && strlen($title) <= 200) {
                $updates[] = "title = ?";
                $params[] = $title;
            }
        }
        
        if (isset($data['description'])) {
            $updates[] = "description = ?";
            $params[] = sanitizeString($data['description']);
        }
        
        if (isset($data['event_date'])) {
            $eventDate = $data['event_date'];
            if (strtotime($eventDate) !== false) {
                $updates[] = "event_date = ?";
                $params[] = $eventDate;
            }
        }
        
        if (isset($data['location'])) {
            $updates[] = "location = ?";
            $params[] = sanitizeString($data['location']);
        }
        
        if (isset($data['max_capacity'])) {
            $maxCapacity = (int)$data['max_capacity'];
            if ($maxCapacity >= $event['current_participants']) {
                $updates[] = "max_capacity = ?";
                $params[] = $maxCapacity;
            } else {
                errorResponse('La capacité ne peut pas être inférieure au nombre de participants actuels');
            }
        }
        
        if (isset($data['status'])) {
            $status = $data['status'];
            if (in_array($status, ['open', 'full', 'cancelled', 'completed'])) {
                $updates[] = "status = ?";
                $params[] = $status;
            }
        }
        
        if (empty($updates)) {
            errorResponse('Aucune donnée à mettre à jour');
        }
        
        $params[] = $eventId;
        
        $sql = "UPDATE events SET " . implode(', ', $updates) . " WHERE id = ?";
        $db->query($sql, $params);
        
        $db->query("CALL sp_update_event_status(?)", [$eventId]);
        
        
        $updatedEvent = $db->fetchOne(
            "SELECT e.*, u.username as creator_name
             FROM events e
             LEFT JOIN users u ON e.created_by = u.id
             WHERE e.id = ?",
            [$eventId]
        );
        
        successResponse([
            'event' => $updatedEvent
        ], 'Événement mis à jour avec succès');
        
    } catch (Exception $e) {
        logError('Erreur lors de la mise à jour de l\'événement', [
            'event_id' => $eventId,
            'error' => $e->getMessage()
        ]);
        errorResponse('Erreur lors de la mise à jour', 500);
    }
}


function deleteEvent(int $eventId): void {
    requireAdmin();
    
    try {
        $db = Database::getInstance();
        
        $event = $db->fetchOne("SELECT * FROM events WHERE id = ?", [$eventId]);
        
        if (!$event) {
            errorResponse('Événement non trouvé', 404);
        }
        
        try {
            $db->query("DELETE FROM events WHERE id = ?", [$eventId]);
            successResponse(null, 'Événement supprimé avec succès');
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'participants sont inscrits') !== false) {
                errorResponse('Impossible de supprimer : des participants sont inscrits à cet événement');
            }
            throw $e;
        }
        
    } catch (Exception $e) {
        logError('Erreur lors de la suppression de l\'événement', [
            'event_id' => $eventId,
            'error' => $e->getMessage()
        ]);
        errorResponse('Erreur lors de la suppression', 500);
    }
}
