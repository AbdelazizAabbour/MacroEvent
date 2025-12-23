-- ============================================================================
-- PLATEFORME INTELLIGENTE DE GESTION D'ÉVÉNEMENTS
-- Fichier : functions.sql
-- Description : Fonctions stockées MySQL
-- ============================================================================

USE event_platform;

-- Suppression des fonctions existantes pour éviter les conflits
DROP FUNCTION IF EXISTS fn_calculate_average_rating;
DROP FUNCTION IF EXISTS fn_is_event_full;
DROP FUNCTION IF EXISTS fn_get_available_spots;
DROP FUNCTION IF EXISTS fn_user_has_participated;
DROP FUNCTION IF EXISTS fn_get_event_status_label;

DELIMITER //

-- ============================================================================
-- FONCTION 1 : fn_calculate_average_rating
-- Description : Calcule la moyenne des notes d'un événement
-- Paramètre : p_event_id (INT) - L'ID de l'événement
-- Retour : DECIMAL(3,2) - La moyenne des notes (0.00 si aucune évaluation)
-- ============================================================================
CREATE FUNCTION fn_calculate_average_rating(p_event_id INT)
RETURNS DECIMAL(3,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_average DECIMAL(3,2);
    
    -- Calcul de la moyenne des notes pour l'événement
    SELECT COALESCE(AVG(rating), 0.00)
    INTO v_average
    FROM evaluations
    WHERE event_id = p_event_id;
    
    RETURN v_average;
END //

-- ============================================================================
-- FONCTION 2 : fn_is_event_full
-- Description : Vérifie si un événement a atteint sa capacité maximale
-- Paramètre : p_event_id (INT) - L'ID de l'événement
-- Retour : BOOLEAN (1 = complet, 0 = places disponibles)
-- ============================================================================
CREATE FUNCTION fn_is_event_full(p_event_id INT)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_current INT;
    DECLARE v_max INT;
    
    -- Récupération du nombre actuel et de la capacité max
    SELECT current_participants, max_capacity
    INTO v_current, v_max
    FROM events
    WHERE id = p_event_id;
    
    -- Si l'événement n'existe pas, retourner TRUE (considéré comme "plein")
    IF v_max IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Comparaison : TRUE si complet, FALSE sinon
    RETURN v_current >= v_max;
END //

-- ============================================================================
-- FONCTION 3 : fn_get_available_spots
-- Description : Retourne le nombre de places disponibles pour un événement
-- Paramètre : p_event_id (INT) - L'ID de l'événement
-- Retour : INT - Nombre de places restantes (0 si complet ou inexistant)
-- ============================================================================
CREATE FUNCTION fn_get_available_spots(p_event_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_current INT;
    DECLARE v_max INT;
    DECLARE v_available INT;
    
    -- Récupération des données de l'événement
    SELECT current_participants, max_capacity
    INTO v_current, v_max
    FROM events
    WHERE id = p_event_id;
    
    -- Si l'événement n'existe pas
    IF v_max IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calcul des places disponibles
    SET v_available = v_max - v_current;
    
    -- S'assurer de ne pas retourner une valeur négative
    IF v_available < 0 THEN
        RETURN 0;
    END IF;
    
    RETURN v_available;
END //

-- ============================================================================
-- FONCTION 4 : fn_user_has_participated
-- Description : Vérifie si un utilisateur est inscrit à un événement
-- Paramètres : 
--   p_user_id (INT) - L'ID de l'utilisateur
--   p_event_id (INT) - L'ID de l'événement
-- Retour : BOOLEAN (1 = inscrit, 0 = non inscrit)
-- ============================================================================
CREATE FUNCTION fn_user_has_participated(p_user_id INT, p_event_id INT)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_count INT;
    
    -- Comptage des participations actives
    SELECT COUNT(*)
    INTO v_count
    FROM participations
    WHERE user_id = p_user_id 
      AND event_id = p_event_id
      AND status = 'registered';
    
    RETURN v_count > 0;
END //

-- ============================================================================
-- FONCTION 5 : fn_get_event_status_label
-- Description : Retourne un libellé lisible pour le statut d'un événement
-- Paramètre : p_status (VARCHAR) - Le code du statut
-- Retour : VARCHAR - Le libellé en français
-- ============================================================================
CREATE FUNCTION fn_get_event_status_label(p_status VARCHAR(20))
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    CASE p_status
        WHEN 'open' THEN RETURN 'Ouvert aux inscriptions';
        WHEN 'full' THEN RETURN 'Complet';
        WHEN 'cancelled' THEN RETURN 'Annulé';
        WHEN 'completed' THEN RETURN 'Terminé';
        ELSE RETURN 'Statut inconnu';
    END CASE;
END //

DELIMITER ;

-- ============================================================================
-- TESTS DES FONCTIONS
-- ============================================================================
-- Décommentez les lignes suivantes pour tester les fonctions

-- SELECT fn_calculate_average_rating(1) AS moyenne_evenement_1;
-- SELECT fn_is_event_full(1) AS est_complet;
-- SELECT fn_get_available_spots(1) AS places_dispo;
-- SELECT fn_user_has_participated(2, 1) AS est_inscrit;
-- SELECT fn_get_event_status_label('open') AS libelle_statut;
