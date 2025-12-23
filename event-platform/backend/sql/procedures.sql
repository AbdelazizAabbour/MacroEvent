-- ============================================================================
-- PLATEFORME INTELLIGENTE DE GESTION D'ÉVÉNEMENTS
-- Fichier : procedures.sql
-- Description : Procédures stockées MySQL (incluant les curseurs)
-- ============================================================================

USE event_platform;

-- Suppression des procédures existantes
DROP PROCEDURE IF EXISTS sp_register_user_to_event;
DROP PROCEDURE IF EXISTS sp_cancel_participation;
DROP PROCEDURE IF EXISTS sp_update_event_status;
DROP PROCEDURE IF EXISTS sp_update_past_events_status;
DROP PROCEDURE IF EXISTS sp_calculate_event_statistics;
DROP PROCEDURE IF EXISTS sp_cleanup_cancelled_participations;

DELIMITER //

CREATE PROCEDURE sp_register_user_to_event(
    IN p_user_id INT,
    IN p_event_id INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN   
    DECLARE v_event_exists INT DEFAULT 0;
    DECLARE v_event_status VARCHAR(20);
    DECLARE v_already_registered INT DEFAULT 0;
    DECLARE v_is_full BOOLEAN;
    
    -- Gestion des erreurs
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Erreur lors de l\'inscription';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Vérifier si l'événement existe et récupérer son statut
    SELECT COUNT(*), COALESCE(status, '')
    INTO v_event_exists, v_event_status
    FROM events
    WHERE id = p_event_id;
    
    IF v_event_exists = 0 THEN
        SET p_success = FALSE;
        SET p_message = 'Événement introuvable';
        ROLLBACK;
    ELSEIF v_event_status = 'cancelled' THEN
        SET p_success = FALSE;
        SET p_message = 'Cet événement a été annulé';
        ROLLBACK;
    ELSEIF v_event_status = 'completed' THEN
        SET p_success = FALSE;
        SET p_message = 'Cet événement est déjà terminé';
        ROLLBACK;
    ELSE
        -- Vérifier si l'utilisateur est déjà inscrit
        SELECT COUNT(*)
        INTO v_already_registered
        FROM participations
        WHERE user_id = p_user_id 
          AND event_id = p_event_id
          AND status = 'registered';
        
        IF v_already_registered > 0 THEN
            SET p_success = FALSE;
            SET p_message = 'Vous êtes déjà inscrit à cet événement';
            ROLLBACK;
        ELSE
            -- Vérifier si l'événement est complet
            SET v_is_full = fn_is_event_full(p_event_id);
            
            IF v_is_full THEN
                SET p_success = FALSE;
                SET p_message = 'Cet événement est complet';
                ROLLBACK;
            ELSE
                -- Inscription de l'utilisateur
                -- Le trigger AFTER INSERT se chargera d'incrémenter current_participants
                INSERT INTO participations (user_id, event_id, status)
                VALUES (p_user_id, p_event_id, 'registered')
                ON DUPLICATE KEY UPDATE status = 'registered', registration_date = CURRENT_TIMESTAMP;
                
                SET p_success = TRUE;
                SET p_message = 'Inscription réussie !';
                COMMIT;
            END IF;
        END IF;
    END IF;
END //

-- ============================================================================
-- PROCÉDURE 2 : sp_cancel_participation
-- Description : Annule la participation d'un utilisateur à un événement
-- Paramètres :
--   p_user_id (INT) - L'ID de l'utilisateur
--   p_event_id (INT) - L'ID de l'événement
-- Sortie :
--   p_success (BOOLEAN) - Succès de l'opération
--   p_message (VARCHAR) - Message de retour
-- ============================================================================
CREATE PROCEDURE sp_cancel_participation(
    IN p_user_id INT,
    IN p_event_id INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_participation_exists INT DEFAULT 0;
    DECLARE v_participation_status VARCHAR(20);
    
    -- Gestion des erreurs
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Erreur lors de l\'annulation';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Vérifier si la participation existe
    SELECT COUNT(*), COALESCE(status, '')
    INTO v_participation_exists, v_participation_status
    FROM participations
    WHERE user_id = p_user_id AND event_id = p_event_id;
    
    IF v_participation_exists = 0 THEN
        SET p_success = FALSE;
        SET p_message = 'Aucune inscription trouvée pour cet événement';
        ROLLBACK;
    ELSEIF v_participation_status = 'cancelled' THEN
        SET p_success = FALSE;
        SET p_message = 'Cette inscription a déjà été annulée';
        ROLLBACK;
    ELSE
        -- Suppression de la participation
        -- Le trigger AFTER DELETE se chargera de décrémenter current_participants
        DELETE FROM participations 
        WHERE user_id = p_user_id AND event_id = p_event_id;
        
        SET p_success = TRUE;
        SET p_message = 'Participation annulée avec succès';
        COMMIT;
    END IF;
END //

-- ============================================================================
-- PROCÉDURE 3 : sp_update_event_status
-- Description : Met à jour le statut d'un événement selon ses paramètres
-- Paramètre :
--   p_event_id (INT) - L'ID de l'événement
-- ============================================================================
CREATE PROCEDURE sp_update_event_status(
    IN p_event_id INT
)
BEGIN
    DECLARE v_current INT DEFAULT 0;
    DECLARE v_max INT DEFAULT 0;
    DECLARE v_event_date DATETIME;
    DECLARE v_current_status VARCHAR(20);
    DECLARE v_new_status VARCHAR(20);
    DECLARE v_event_exists INT DEFAULT 0;
    
    -- Récupérer les informations de l'événement
    SELECT COUNT(*), COALESCE(current_participants, 0), COALESCE(max_capacity, 0), event_date, COALESCE(status, '')
    INTO v_event_exists, v_current, v_max, v_event_date, v_current_status
    FROM events
    WHERE id = p_event_id;
    
    -- Vérifier que l'événement existe
    IF v_event_exists = 0 THEN
        RETURN;
    END IF;
    
    -- Ne pas modifier les événements annulés
    IF v_current_status = 'cancelled' THEN
        RETURN;
    END IF;
    
    -- Déterminer le nouveau statut
    IF v_event_date < NOW() THEN
        SET v_new_status = 'completed';
    ELSEIF v_current >= v_max THEN
        SET v_new_status = 'full';
    ELSE
        SET v_new_status = 'open';
    END IF;
    
    -- Mettre à jour uniquement si le statut change
    IF v_new_status != v_current_status THEN
        UPDATE events
        SET status = v_new_status
        WHERE id = p_event_id;
    END IF;
END //

-- ============================================================================
-- PROCÉDURE 4 : sp_update_past_events_status (avec CURSEUR)
-- Description : Parcourt tous les événements passés et met à jour leur statut
-- Utilisation d'un CURSEUR pour itérer sur les événements
-- ============================================================================
CREATE PROCEDURE sp_update_past_events_status()
BEGIN
    -- Variables pour le curseur
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_event_id INT;
    DECLARE v_event_title VARCHAR(200);
    DECLARE v_events_updated INT DEFAULT 0;
    
    -- Déclaration du CURSEUR pour parcourir les événements passés
    DECLARE cur_past_events CURSOR FOR
        SELECT id, title
        FROM events
        WHERE event_date < NOW()
          AND status NOT IN ('completed', 'cancelled');
    
    -- Handler pour la fin du curseur
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    -- Ouverture du curseur
    OPEN cur_past_events;
    
    -- Boucle de lecture
    read_loop: LOOP
        -- Récupération de la ligne courante
        FETCH cur_past_events INTO v_event_id, v_event_title;
        
        -- Sortie si plus de lignes
        IF v_done THEN
            LEAVE read_loop;
        END IF;
        
        -- Mise à jour du statut de l'événement
        UPDATE events
        SET status = 'completed'
        WHERE id = v_event_id;
        
        -- Compteur d'événements mis à jour
        SET v_events_updated = v_events_updated + 1;
        
        -- Log de l'action (optionnel, pour debug)
        INSERT INTO event_logs (event_id, action_type, old_value, new_value)
        VALUES (v_event_id, 'AUTO_COMPLETE', 
                CONCAT('Event: ', v_event_title), 
                'Status changed to completed');
    END LOOP;
    
    -- Fermeture du curseur
    CLOSE cur_past_events;
    
    -- Retour du nombre d'événements mis à jour
    SELECT v_events_updated AS events_updated;
END //

-- ============================================================================
-- PROCÉDURE 5 : sp_calculate_event_statistics (avec CURSEUR)
-- Description : Calcule des statistiques pour tous les événements
-- Utilise un CURSEUR pour parcourir et calculer
-- ============================================================================
CREATE PROCEDURE sp_calculate_event_statistics()
BEGIN
    -- Variables pour le curseur
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_event_id INT;
    DECLARE v_title VARCHAR(200);
    DECLARE v_participants INT;
    DECLARE v_max_capacity INT;
    DECLARE v_avg_rating DECIMAL(3,2);
    DECLARE v_total_ratings INT;
    
    -- Curseur pour parcourir tous les événements
    DECLARE cur_events CURSOR FOR
        SELECT id, title, current_participants, max_capacity, average_rating, total_ratings
        FROM events
        ORDER BY event_date DESC;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    -- Table temporaire pour stocker les statistiques
    DROP TEMPORARY TABLE IF EXISTS temp_event_stats;
    CREATE TEMPORARY TABLE temp_event_stats (
        event_id INT,
        event_title VARCHAR(200),
        participants INT,
        max_capacity INT,
        fill_percentage DECIMAL(5,2),
        average_rating DECIMAL(3,2),
        total_ratings INT,
        popularity_score DECIMAL(5,2)
    );
    
    -- Ouverture du curseur
    OPEN cur_events;
    
    -- Parcours des événements
    stats_loop: LOOP
        FETCH cur_events INTO v_event_id, v_title, v_participants, 
                              v_max_capacity, v_avg_rating, v_total_ratings;
        
        IF v_done THEN
            LEAVE stats_loop;
        END IF;
        
        -- Calcul et insertion des statistiques
        INSERT INTO temp_event_stats VALUES (
            v_event_id,
            v_title,
            v_participants,
            v_max_capacity,
            (v_participants / v_max_capacity) * 100,  -- Pourcentage de remplissage
            v_avg_rating,
            v_total_ratings,
            -- Score de popularité (combinaison remplissage + notes)
            ((v_participants / v_max_capacity) * 50) + (v_avg_rating * 10)
        );
    END LOOP;
    
    CLOSE cur_events;
    
    -- Retour des statistiques
    SELECT * FROM temp_event_stats ORDER BY popularity_score DESC;
    
    -- Nettoyage
    DROP TEMPORARY TABLE IF EXISTS temp_event_stats;
END //

-- ============================================================================
-- PROCÉDURE 6 : sp_cleanup_cancelled_participations (avec CURSEUR)
-- Description : Nettoie les anciennes participations annulées
-- Utilise un CURSEUR pour parcourir et supprimer sélectivement
-- ============================================================================
CREATE PROCEDURE sp_cleanup_cancelled_participations(
    IN p_days_old INT  -- Nombre de jours après lesquels supprimer
)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_participation_id INT;
    DECLARE v_user_id INT;
    DECLARE v_event_id INT;
    DECLARE v_deleted_count INT DEFAULT 0;
    
    -- Curseur pour les participations annulées anciennes
    DECLARE cur_old_participations CURSOR FOR
        SELECT p.id, p.user_id, p.event_id
        FROM participations p
        JOIN events e ON p.event_id = e.id
        WHERE p.status = 'cancelled'
          AND e.event_date < DATE_SUB(NOW(), INTERVAL p_days_old DAY);
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    OPEN cur_old_participations;
    
    cleanup_loop: LOOP
        FETCH cur_old_participations INTO v_participation_id, v_user_id, v_event_id;
        
        IF v_done THEN
            LEAVE cleanup_loop;
        END IF;
        
        -- Suppression de la participation
        DELETE FROM participations WHERE id = v_participation_id;
        
        SET v_deleted_count = v_deleted_count + 1;
    END LOOP;
    
    CLOSE cur_old_participations;
    
    -- Retour du nombre de participations supprimées
    SELECT v_deleted_count AS participations_deleted;
END //

DELIMITER ;

-- ============================================================================
-- TESTS DES PROCÉDURES
-- ============================================================================
-- Décommentez les lignes suivantes pour tester les procédures

-- Test inscription
-- CALL sp_register_user_to_event(2, 1, @success, @message);
-- SELECT @success, @message;

-- Test annulation
-- CALL sp_cancel_participation(2, 1, @success, @message);
-- SELECT @success, @message;

-- Test mise à jour statut
-- CALL sp_update_event_status(1);

-- Test mise à jour événements passés (avec curseur)
-- CALL sp_update_past_events_status();

-- Test statistiques (avec curseur)
-- CALL sp_calculate_event_statistics();

-- Test nettoyage (avec curseur)
-- CALL sp_cleanup_cancelled_participations(30);
