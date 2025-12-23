<?php

error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helpers.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];


switch ($method) {
    case 'GET':
        getEvents();
        break;
    case 'POST':
        createEvent();
        break;
    default:
        errorResponse('Méthode non autorisée', 405);
}


function getEvents(): void {
    try {
        $db = Database::getInstance();
        
        $status = isset($_GET['status']) ? $_GET['status'] : null;
        $search = isset($_GET['search']) ? $_GET['search'] : null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $offset = ($page - 1) * $limit;
        

        $sql = "SELECT e.*, 
                       u.username as creator_name,
                       fn_get_available_spots(e.id) as available_spots,
                       fn_is_event_full(e.id) as is_full
                FROM events e
                LEFT JOIN users u ON e.created_by = u.id
                WHERE 1=1";
        
        $params = [];
        
     
        if ($status && in_array($status, ['open', 'full', 'cancelled', 'completed'])) {
            $sql .= " AND e.status = ?";
            $params[] = $status;
        }
        
    
        if ($search) {
            $sql .= " AND (e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)";
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
  
        $sql .= " ORDER BY e.event_date ASC";
        
   
        $sql .= " LIMIT $limit OFFSET $offset";
        
   
        $events = $db->fetchAll($sql, $params);
        

        $countSql = "SELECT COUNT(*) as total FROM events e WHERE 1=1";
        $countParams = [];
        
        if ($status && in_array($status, ['open', 'full', 'cancelled', 'completed'])) {
            $countSql .= " AND e.status = ?";
            $countParams[] = $status;
        }
        
        if ($search) {
            $countSql .= " AND (e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)";
            $searchTerm = "%$search%";
            $countParams[] = $searchTerm;
            $countParams[] = $searchTerm;
            $countParams[] = $searchTerm;
        }
        
        $totalResult = $db->fetchOne($countSql, $countParams);
        $total = $totalResult ? (int)$totalResult['total'] : 0;
        
        // Formatage des événements
        $formattedEvents = array_map(function($event) {
            return [
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
                'average_rating' => (float)$event['average_rating'],
                'total_ratings' => (int)$event['total_ratings'],
                'creator_name' => $event['creator_name'],
                'created_at' => $event['created_at']
            ];
        }, $events);
        
        successResponse([
            'events' => $formattedEvents,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'total_pages' => $total > 0 ? ceil($total / $limit) : 0
            ]
        ]);
        
    } catch (Exception $e) {
        logError('Erreur lors de la récupération des événements', [
            'error' => $e->getMessage()
        ]);
        errorResponse('Erreur lors de la récupération des événements', 500);
    }
}


function createEvent(): void {
    requireAdmin();
    
    $data = getJsonInput();
    
 
    $errors = validateRequired($data, ['title', 'event_date', 'location']);
    if (!empty($errors)) {
        errorResponse(implode(', ', $errors));
    }
    

    $title = sanitizeString($data['title']);
    if (strlen($title) < 3 || strlen($title) > 200) {
        errorResponse('Le titre doit contenir entre 3 et 200 caractères');
    }
    
   
    $eventDate = $data['event_date'];
    if (strtotime($eventDate) === false) {
        errorResponse('Format de date invalide');
    }
    
    if (strtotime($eventDate) <= time()) {
        errorResponse('La date de l\'événement doit être dans le futur');
    }
    
    $maxCapacity = isset($data['max_capacity']) ? (int)$data['max_capacity'] : 50;
    if ($maxCapacity < 1 || $maxCapacity > 10000) {
        errorResponse('La capacité doit être comprise entre 1 et 10000');
    }
    
    try {
        $db = Database::getInstance();
        
        $db->query(
            "INSERT INTO events (title, description, event_date, location, max_capacity, created_by) 
             VALUES (?, ?, ?, ?, ?, ?)",
            [
                $title,
                sanitizeString($data['description'] ?? ''),
                $eventDate,
                sanitizeString($data['location']),
                $maxCapacity,
                getCurrentUserId()
            ]
        );
        
        $eventId = $db->lastInsertId();
        
        $event = $db->fetchOne(
            "SELECT e.*, u.username as creator_name
             FROM events e
             LEFT JOIN users u ON e.created_by = u.id
             WHERE e.id = ?",
            [$eventId]
        );
        
        successResponse([
            'event' => $event
        ], 'Événement créé avec succès');
        
    } catch (Exception $e) {
        logError('Erreur lors de la création de l\'événement', [
            'error' => $e->getMessage()
        ]);
        errorResponse('Erreur lors de la création de l\'événement', 500);
    }
}