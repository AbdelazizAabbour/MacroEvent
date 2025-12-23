-- ============================================================================
-- PLATEFORME INTELLIGENTE DE GESTION D'ÉVÉNEMENTS
-- Fichier : schema.sql
-- Description : Création des tables de la base de données
-- ============================================================================

-- Suppression de la base si elle existe (pour réinitialisation)
DROP DATABASE IF EXISTS event_platform;

-- Création de la base de données
CREATE DATABASE event_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utilisation de la base
USE event_platform;

-- ============================================================================
-- TABLE : users (Utilisateurs)
-- Stocke les informations des utilisateurs (admin et utilisateurs normaux)
-- ============================================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,          -- Hash du mot de passe (password_hash)
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index pour optimiser les recherches
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE : events (Événements)
-- Stocke tous les événements créés sur la plateforme
-- ============================================================================
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    max_capacity INT NOT NULL DEFAULT 50,     -- Capacité maximale de participants
    current_participants INT DEFAULT 0,       -- Nombre actuel de participants
    status ENUM('open', 'full', 'cancelled', 'completed') DEFAULT 'open',
    average_rating DECIMAL(3,2) DEFAULT 0.00, -- Moyenne des évaluations
    total_ratings INT DEFAULT 0,              -- Nombre total d'évaluations
    created_by INT NOT NULL,                  -- ID de l'admin créateur
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Clé étrangère vers users
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Index pour optimiser les recherches
    INDEX idx_event_date (event_date),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE : participations (Inscriptions aux événements)
-- Gère les inscriptions des utilisateurs aux événements
-- ============================================================================
CREATE TABLE participations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('registered', 'cancelled', 'attended') DEFAULT 'registered',
    
    -- Clés étrangères
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    
    -- Un utilisateur ne peut s'inscrire qu'une seule fois à un événement
    UNIQUE KEY unique_participation (user_id, event_id),
    
    -- Index
    INDEX idx_user_id (user_id),
    INDEX idx_event_id (event_id)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE : evaluations (Évaluations des événements)
-- Permet aux participants de noter et commenter les événements
-- ============================================================================
CREATE TABLE evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Note de 1 à 5
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Clés étrangères
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    
    -- Un utilisateur ne peut évaluer qu'une seule fois un événement
    UNIQUE KEY unique_evaluation (user_id, event_id),
    
    -- Index
    INDEX idx_event_rating (event_id, rating)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLE : event_logs (Journal des actions sur les événements)
-- Enregistre toutes les modifications effectuées sur les événements
-- ============================================================================
CREATE TABLE event_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,         -- Type d'action (UPDATE, DELETE, etc.)
    old_value TEXT,                           -- Ancienne valeur (JSON)
    new_value TEXT,                           -- Nouvelle valeur (JSON)
    performed_by INT,                         -- ID de l'utilisateur qui a fait l'action
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Index
    INDEX idx_event_log (event_id),
    INDEX idx_action_type (action_type)
) ENGINE=InnoDB;

-- ============================================================================
-- INSERTION DE DONNÉES INITIALES
-- ============================================================================

-- Création d'un administrateur par défaut
-- Mot de passe : admin123 (hashé avec password_hash)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@eventplatform.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Création de quelques utilisateurs de test
-- Mot de passe : password123
INSERT INTO users (username, email, password, role) VALUES 
('john_doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('jane_smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('bob_wilson', 'bob@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Création d'événements de démonstration
INSERT INTO events (title, description, event_date, location, max_capacity, created_by) VALUES 
('Conférence Tech 2025', 'Grande conférence sur les nouvelles technologies', '2025-03-15 09:00:00', 'Paris Convention Center', 200, 1),
('Workshop React', 'Atelier pratique sur ReactJS et Redux', '2025-02-20 14:00:00', 'Lyon Digital Hub', 30, 1),
('Meetup Développeurs', 'Rencontre mensuelle des développeurs', '2025-01-25 18:30:00', 'Bordeaux Tech Space', 50, 1);

COMMIT;
