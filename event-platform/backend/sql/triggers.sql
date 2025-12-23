-- ============================================================================
-- PLATEFORME INTELLIGENTE DE GESTION D'ÉVÉNEMENTS
-- Fichier : triggers.sql
-- Description : Triggers MySQL pour automatiser les opérations
-- ============================================================================

USE event_platform;

-- Suppression des triggers existants
DROP TRIGGER IF EXISTS trg_after_insert_participation;
DROP TRIGGER IF EXISTS trg_before_insert_participation;
DROP TRIGGER IF EXISTS trg_after_insert_evaluation;
DROP TRIGGER IF EXISTS trg_after_delete_participation;
DROP TRIGGER IF EXISTS trg_after_update_event;
DROP TRIGGER IF EXISTS trg_before_delete_event;
DROP TRIGGER IF EXISTS trg_after_update_evaluation;

DELIMITER //

-- ============================================================================
-- TRIGGER 1 : trg_before_insert_participation
-- Description : AVANT l'inscription, vérifie si l'événement n'est pas complet
-- Événement : BEFORE INSERT sur participations
-- Action : Bloque l'insertion si la capacité max est atteinte
-- ============================================================================
CREATE TRIGGER trg_before_insert_participation
BEFORE INSERT ON participations
FOR EACH ROW
BEGIN
    DECLARE v_current INT;
    DECLARE v_max INT;
    DECLARE v_status VARCHAR(20);
    
    -- Récupérer les informations de l'événement
    SELECT current_participants, max_capacity, status
    INTO v_current, v_max, v_status
    FROM events
    WHERE id = NEW.event_id;
    
    -- Vérifier si l'événement est annulé
    IF v_status = 'cancelled' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Impossible de s\'inscrire : événement annulé';
    END IF;
    
    -- Vérifier si l'événement est terminé
    IF v_status = 'completed' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Impossible de s\'inscrire : événement terminé';
    END IF;
    
    -- Vérifier la capacité (seulement pour les nouvelles inscriptions actives)
    IF NEW.status = 'registered' AND v_current >= v_max THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Impossible de s\'inscrire : événement complet';
    END IF;
END //

-- ============================================================================
-- TRIGGER 2 : trg_after_insert_participation
-- Description : APRÈS l'inscription, incrémente le compteur de participants
-- Événement : AFTER INSERT sur participations
-- Action : Met à jour current_participants et vérifie si événement devient complet
-- ============================================================================
CREATE TRIGGER trg_after_insert_participation
AFTER INSERT ON participations
FOR EACH ROW
BEGIN
    DECLARE v_new_count INT;
    DECLARE v_max INT;
    
    -- Incrémenter le nombre de participants seulement si statut = 'registered'
    IF NEW.status = 'registered' THEN
        UPDATE events
        SET current_participants = current_participants + 1
        WHERE id = NEW.event_id;
        
        -- Vérifier si l'événement devient complet
        SELECT current_participants, max_capacity
        INTO v_new_count, v_max
        FROM events
        WHERE id = NEW.event_id;
        
        -- Mettre à jour le statut si complet
        IF v_new_count >= v_max THEN
            UPDATE events
            SET status = 'full'
            WHERE id = NEW.event_id AND status = 'open';
        END IF;
    END IF;
END //

-- ============================================================================
-- TRIGGER 3 : trg_after_delete_participation
-- Description : APRÈS suppression d'une participation, décrémente le compteur
-- Événement : AFTER DELETE sur participations
-- Action : Met à jour current_participants et rouvre l'événement si nécessaire
-- ============================================================================
CREATE TRIGGER trg_after_delete_participation
AFTER DELETE ON participations
FOR EACH ROW
BEGIN
    DECLARE v_new_count INT;
    DECLARE v_max INT;
    DECLARE v_current_status VARCHAR(20);
    
    -- Décrémenter seulement si la participation était active
    IF OLD.status = 'registered' THEN
        UPDATE events
        SET current_participants = GREATEST(current_participants - 1, 0)
        WHERE id = OLD.event_id;
        
        -- Vérifier si l'événement peut être rouvert
        SELECT current_participants, max_capacity, status
        INTO v_new_count, v_max, v_current_status
        FROM events
        WHERE id = OLD.event_id;
        
        -- Rouvrir l'événement s'il était complet et qu'il y a maintenant de la place
        IF v_current_status = 'full' AND v_new_count < v_max THEN
            UPDATE events
            SET status = 'open'
            WHERE id = OLD.event_id;
        END IF;
    END IF;
END //

-- ============================================================================
-- TRIGGER 4 : trg_after_insert_evaluation
-- Description : APRÈS une évaluation, recalcule la moyenne des notes
-- Événement : AFTER INSERT sur evaluations
-- Action : Met à jour average_rating et total_ratings de l'événement
-- ============================================================================
CREATE TRIGGER trg_after_insert_evaluation
AFTER INSERT ON evaluations
FOR EACH ROW
BEGIN
    DECLARE v_new_average DECIMAL(3,2);
    DECLARE v_total INT;
    
    -- Calculer la nouvelle moyenne
    SELECT AVG(rating), COUNT(*)
    INTO v_new_average, v_total
    FROM evaluations
    WHERE event_id = NEW.event_id;
    
    -- Mettre à jour l'événement
    UPDATE events
    SET average_rating = COALESCE(v_new_average, 0),
        total_ratings = v_total
    WHERE id = NEW.event_id;
END //

-- ============================================================================
-- TRIGGER 5 : trg_after_update_evaluation
-- Description : APRÈS modification d'une évaluation, recalcule la moyenne
-- Événement : AFTER UPDATE sur evaluations
-- Action : Met à jour average_rating de l'événement
-- ============================================================================
CREATE TRIGGER trg_after_update_evaluation
AFTER UPDATE ON evaluations
FOR EACH ROW
BEGIN
    DECLARE v_new_average DECIMAL(3,2);
    
    -- Recalculer la moyenne si la note a changé
    IF OLD.rating != NEW.rating THEN
        SELECT AVG(rating)
        INTO v_new_average
        FROM evaluations
        WHERE event_id = NEW.event_id;
        
        UPDATE events
        SET average_rating = COALESCE(v_new_average, 0)
        WHERE id = NEW.event_id;
    END IF;
END //

-- ============================================================================
-- TRIGGER 6 : trg_after_update_event
-- Description : APRÈS modification d'un événement, enregistre l'action dans les logs
-- Événement : AFTER UPDATE sur events
-- Action : Insère une entrée dans event_logs pour traçabilité
-- ============================================================================
CREATE TRIGGER trg_after_update_event
AFTER UPDATE ON events
FOR EACH ROW
BEGIN
    DECLARE v_changes TEXT DEFAULT '';
    
    -- Construire la liste des changements
    IF OLD.title != NEW.title THEN
        SET v_changes = CONCAT(v_changes, 'title: ', OLD.title, ' -> ', NEW.title, '; ');
    END IF;
    
    IF OLD.description != NEW.description OR 
       (OLD.description IS NULL AND NEW.description IS NOT NULL) OR
       (OLD.description IS NOT NULL AND NEW.description IS NULL) THEN
        SET v_changes = CONCAT(v_changes, 'description modified; ');
    END IF;
    
    IF OLD.event_date != NEW.event_date THEN
        SET v_changes = CONCAT(v_changes, 'date: ', OLD.event_date, ' -> ', NEW.event_date, '; ');
    END IF;
    
    IF OLD.location != NEW.location THEN
        SET v_changes = CONCAT(v_changes, 'location: ', OLD.location, ' -> ', NEW.location, '; ');
    END IF;
    
    IF OLD.max_capacity != NEW.max_capacity THEN
        SET v_changes = CONCAT(v_changes, 'capacity: ', OLD.max_capacity, ' -> ', NEW.max_capacity, '; ');
    END IF;
    
    IF OLD.status != NEW.status THEN
        SET v_changes = CONCAT(v_changes, 'status: ', OLD.status, ' -> ', NEW.status, '; ');
    END IF;
    
    -- Enregistrer le log seulement s'il y a des changements significatifs
    -- (exclure les mises à jour automatiques de current_participants et average_rating)
    IF v_changes != '' THEN
        INSERT INTO event_logs (event_id, action_type, old_value, new_value)
        VALUES (
            NEW.id,
            'UPDATE',
            JSON_OBJECT(
                'title', OLD.title,
                'status', OLD.status,
                'max_capacity', OLD.max_capacity,
                'event_date', OLD.event_date
            ),
            JSON_OBJECT(
                'title', NEW.title,
                'status', NEW.status,
                'max_capacity', NEW.max_capacity,
                'event_date', NEW.event_date,
                'changes', v_changes
            )
        );
    END IF;
END //

-- ============================================================================
-- TRIGGER 7 : trg_before_delete_event
-- Description : AVANT suppression d'un événement, vérifie s'il a des participants
-- Événement : BEFORE DELETE sur events
-- Action : Empêche la suppression si des participants sont inscrits
-- ============================================================================
CREATE TRIGGER trg_before_delete_event
BEFORE DELETE ON events
FOR EACH ROW
BEGIN
    DECLARE v_participant_count INT;
    
    -- Compter les participants actifs
    SELECT COUNT(*)
    INTO v_participant_count
    FROM participations
    WHERE event_id = OLD.id AND status = 'registered';
    
    -- Empêcher la suppression si des participants sont inscrits
    IF v_participant_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Impossible de supprimer : des participants sont inscrits à cet événement';
    END IF;
    
    -- Logger la tentative de suppression
    INSERT INTO event_logs (event_id, action_type, old_value, new_value)
    VALUES (
        OLD.id,
        'DELETE_ATTEMPT',
        JSON_OBJECT(
            'title', OLD.title,
            'status', OLD.status,
            'participants', OLD.current_participants
        ),
        'Event deletion requested'
    );
END //

DELIMITER ;

-- ============================================================================
-- INFORMATIONS SUR LES TRIGGERS
-- ============================================================================
-- 
-- RÉCAPITULATIF DES TRIGGERS :
-- 
-- 1. trg_before_insert_participation
--    - Vérifie la capacité AVANT inscription
--    - Empêche l'inscription si événement complet/annulé/terminé
-- 
-- 2. trg_after_insert_participation
--    - Incrémente current_participants APRÈS inscription
--    - Change le statut en 'full' si capacité atteinte
-- 
-- 3. trg_after_delete_participation
--    - Décrémente current_participants APRÈS suppression
--    - Rouvre l'événement si place disponible
-- 
-- 4. trg_after_insert_evaluation
--    - Recalcule la moyenne APRÈS nouvelle évaluation
--    - Met à jour total_ratings
-- 
-- 5. trg_after_update_evaluation
--    - Recalcule la moyenne APRÈS modification d'évaluation
-- 
-- 6. trg_after_update_event
--    - Log toutes les modifications d'événements
--    - Stocke les anciennes et nouvelles valeurs en JSON
-- 
-- 7. trg_before_delete_event
--    - Empêche la suppression si participants inscrits
--    - Log les tentatives de suppression
-- 
-- ============================================================================
