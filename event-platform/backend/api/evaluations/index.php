<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helpers.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getEvaluations();
        break;
    case 'POST':
        createEvaluation();
        break;
    case 'PUT':
        updateEvaluation();
        break;
    case 'DELETE':
        deleteEvaluation();
        break;
    default:
        errorResponse('Méthode non autorisée', 405);
}

function getEvaluations(): void {
    try {
        $db = Database::getInstance();
        
        $eventId = isset($_GET['event_id']) ? (int)$_GET['event_id'] : null;
        $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
        
        $sql = "SELECT ev.*, 
                       e.title as event_title,
                       e.event_date,
                       u.username
                FROM evaluations ev
                JOIN events e ON ev.event_id = e.id
                JOIN users u ON ev.user_id = u.id
                WHERE 1=1";
        
        $params = [];
        
        if ($eventId) {
            $sql .= " AND ev.event_id = ?";
            $params[] = $eventId;
        }
        
        if ($userId) {
            $sql .= " AND ev.user_id = ?";
            $params[] = $userId;
        }
        
        $sql .= " ORDER BY ev.created_at DESC";
        
        $evaluations = $db->fetchAll($sql, $params);
        
        $formatted = array_map(function($e) {
            return [
                'id' => (int)$e['id'],
                'user_id' => (int)$e['user_id'],
                'username' => $e['username'],
                'event_id' => (int)$e['event_id'],
                'event_title' => $e['event_title'],
                'event_date' => $e['event_date'],
                'rating' => (int)$e['rating'],
                'comment' => $e['comment'],
                'created_at' => $e['created_at'],
                'updated_at' => $e['updated_at']
            ];
        }, $evaluations);
        
        $stats = null;
        if ($eventId) {
            $stats = $db->fetchOne(
                "SELECT 
                    COUNT(*) as total_evaluations,
                    AVG(rating) as average_rating,
                    MIN(rating) as min_rating,
                    MAX(rating) as max_rating,
                    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_stars,
                    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_stars,
                    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_stars,
                    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_stars,
                    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
                 FROM evaluations
                 WHERE event_id = ?",
                [$eventId]
            );
        }
        
        successResponse([
            'evaluations' => $formatted,
            'stats' => $stats
        ]);
        
    } catch (Exception $e) {
        logError('Erreur lors de la récupération des évaluations', [
            'error' => $e->getMessage()
        ]);
        errorResponse('Erreur lors de la récupération des évaluations', 500);
    }
}


function createEvaluation(): void {
    requireAuth();
    
    $data = getJsonInput();
    
    $errors = validateRequired($data, ['event_id', 'rating']);
    if (!empty($errors)) {
        errorResponse(implode(', ', $errors));
    }
    
    $eventId = (int)$data['event_id'];
    $rating = (int)$data['rating'];
    $comment = isset($data['comment']) ? sanitizeString($data['comment']) : '';
    $userId = getCurrentUserId();
    
    if ($rating < 1 || $rating > 5) {
        errorResponse('La note doit être comprise entre 1 et 5');
    }
    
    try {
        $db = Database::getInstance();
        
        $event = $db->fetchOne("SELECT * FROM events WHERE id = ?", [$eventId]);
        if (!$event) {
            errorResponse('Événement non trouvé', 404);
        }
        
        $participation = $db->fetchOne(
            "SELECT * FROM participations WHERE user_id = ? AND event_id = ? AND status = 'registered'",
            [$userId, $eventId]
        );
        
        if (!$participation) {
            errorResponse('Vous devez être inscrit à l\'événement pour l\'évaluer');
        }
        
        $existingEval = $db->fetchOne(
            "SELECT * FROM evaluations WHERE user_id = ? AND event_id = ?",
            [$userId, $eventId]
        );
        
        if ($existingEval) {
            errorResponse('Vous avez déjà évalué cet événement');
        }
        
        $db->query(
            "INSERT INTO evaluations (user_id, event_id, rating, comment) VALUES (?, ?, ?, ?)",
            [$userId, $eventId, $rating, $comment]
        );
        
        $evaluationId = $db->lastInsertId();
        
        $evaluation = $db->fetchOne(
            "SELECT ev.*, u.username
             FROM evaluations ev
             JOIN users u ON ev.user_id = u.id
             WHERE ev.id = ?",
            [$evaluationId]
        );
        
        $eventStats = $db->fetchOne(
            "SELECT average_rating, total_ratings FROM events WHERE id = ?",
            [$eventId]
        );
        
        successResponse([
            'evaluation' => [
                'id' => (int)$evaluation['id'],
                'user_id' => (int)$evaluation['user_id'],
                'username' => $evaluation['username'],
                'event_id' => (int)$evaluation['event_id'],
                'rating' => (int)$evaluation['rating'],
                'comment' => $evaluation['comment'],
                'created_at' => $evaluation['created_at']
            ],
            'event_stats' => [
                'average_rating' => (float)$eventStats['average_rating'],
                'total_ratings' => (int)$eventStats['total_ratings']
            ]
        ], 'Évaluation enregistrée avec succès');
        
    } catch (Exception $e) {
        logError('Erreur lors de la création de l\'évaluation', [
            'user_id' => $userId,
            'event_id' => $eventId,
            'error' => $e->getMessage()
        ]);
        errorResponse('Erreur lors de l\'enregistrement de l\'évaluation', 500);
    }
}


function updateEvaluation(): void {
    requireAuth();
    
    $evaluationId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($evaluationId <= 0) {
        errorResponse('ID d\'évaluation invalide');
    }
    
    $data = getJsonInput();
    $userId = getCurrentUserId();
    
    try {
        $db = Database::getInstance();
        
        $evaluation = $db->fetchOne(
            "SELECT * FROM evaluations WHERE id = ?",
            [$evaluationId]
        );
        
        if (!$evaluation) {
            errorResponse('Évaluation non trouvée', 404);
        }
        
        if ($evaluation['user_id'] != $userId && !isAdmin()) {
            errorResponse('Vous ne pouvez modifier que vos propres évaluations', 403);
        }
        
        $updates = [];
        $params = [];
        
        if (isset($data['rating'])) {
            $rating = (int)$data['rating'];
            if ($rating < 1 || $rating > 5) {
                errorResponse('La note doit être comprise entre 1 et 5');
            }
            $updates[] = "rating = ?";
            $params[] = $rating;
        }
        
        if (isset($data['comment'])) {
            $updates[] = "comment = ?";
            $params[] = sanitizeString($data['comment']);
        }
        
        if (empty($updates)) {
            errorResponse('Aucune donnée à mettre à jour');
        }
        
        $params[] = $evaluationId;
        $sql = "UPDATE evaluations SET " . implode(', ', $updates) . " WHERE id = ?";
        $db->query($sql, $params);
        
        $updatedEval = $db->fetchOne(
            "SELECT ev.*, u.username
             FROM evaluations ev
             JOIN users u ON ev.user_id = u.id
             WHERE ev.id = ?",
            [$evaluationId]
        );
        
        successResponse([
            'evaluation' => $updatedEval
        ], 'Évaluation mise à jour avec succès');
        
    } catch (Exception $e) {
        logError('Erreur lors de la mise à jour de l\'évaluation', [
            'evaluation_id' => $evaluationId,
            'error' => $e->getMessage()
        ]);
        errorResponse('Erreur lors de la mise à jour', 500);
    }
}


function deleteEvaluation(): void {
    requireAuth();
    
    $evaluationId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($evaluationId <= 0) {
        errorResponse('ID d\'évaluation invalide');
    }
    
    $userId = getCurrentUserId();
    
    try {
        $db = Database::getInstance();
        
        $evaluation = $db->fetchOne(
            "SELECT * FROM evaluations WHERE id = ?",
            [$evaluationId]
        );
        
        if (!$evaluation) {
            errorResponse('Évaluation non trouvée', 404);
        }
        
        if ($evaluation['user_id'] != $userId && !isAdmin()) {
            errorResponse('Vous ne pouvez supprimer que vos propres évaluations', 403);
        }
        
        $eventId = $evaluation['event_id'];
        
        $db->query("DELETE FROM evaluations WHERE id = ?", [$evaluationId]);
        
        $newAvg = $db->fetchOne(
            "SELECT fn_calculate_average_rating(?) as average",
            [$eventId]
        );
        
        $db->query(
            "UPDATE events SET 
                average_rating = ?,
                total_ratings = (SELECT COUNT(*) FROM evaluations WHERE event_id = ?)
             WHERE id = ?",
            [$newAvg['average'], $eventId, $eventId]
        );
        
        successResponse(null, 'Évaluation supprimée avec succès');
        
    } catch (Exception $e) {
        logError('Erreur lors de la suppression de l\'évaluation', [
            'evaluation_id' => $evaluationId,
            'error' => $e->getMessage()
        ]);
        errorResponse('Erreur lors de la suppression', 500);
    }
}
