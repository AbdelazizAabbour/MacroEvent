# 🎯 Plateforme Intelligente de Gestion d'Événements

Une application web moderne permettant la gestion complète d'événements avec inscription des participants et système d'évaluation.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [MySQL Avancé](#mysql-avancé)
- [API Reference](#api-reference)

## ✨ Fonctionnalités

### Authentification
- ✅ Inscription avec validation
- ✅ Connexion / Déconnexion
- ✅ Rôles : Admin et Utilisateur
- ✅ Sécurisation avec `password_hash()`

### Gestion des événements
- ✅ Création d'événements (admin)
- ✅ Date, lieu, description
- ✅ Capacité maximale
- ✅ État automatique : ouvert / complet / annulé / terminé

### Participations
- ✅ Inscription à un événement
- ✅ Annulation de participation
- ✅ Contrôle automatique de la capacité

### Évaluations
- ✅ Note de 1 à 5 étoiles
- ✅ Commentaire optionnel
- ✅ Calcul automatique de la moyenne

## 🛠 Stack technique

| Partie | Technologies |
|--------|--------------|
| **Frontend** | ReactJS 18, Redux (classique), React Router 6, Axios |
| **Backend** | PHP 8+, API REST |
| **Base de données** | MySQL 8+ avec fonctions, procédures, triggers, curseurs |
| **Outils** | Vite, npm |

## 📁 Structure du projet

```
event-platform/
├── frontend/                    # Application React
│   ├── public/
│   ├── src/
│   │   ├── api/                 # Appels API avec Axios
│   │   │   ├── axiosConfig.js
│   │   │   ├── authApi.js
│   │   │   ├── eventsApi.js
│   │   │   ├── participationsApi.js
│   │   │   └── evaluationsApi.js
│   │   ├── redux/               # State management
│   │   │   ├── store.js
│   │   │   ├── actions/
│   │   │   └── reducers/
│   │   ├── pages/               # Pages de l'application
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── CreateEvent.jsx
│   │   ├── components/          # Composants réutilisables
│   │   │   ├── Navbar.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StarRating.jsx
│   │   │   └── Alert.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # API PHP
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register.php
│   │   │   ├── login.php
│   │   │   ├── logout.php
│   │   │   └── me.php
│   │   ├── events/
│   │   │   ├── index.php        # GET (liste) / POST (créer)
│   │   │   └── show.php         # GET / PUT / DELETE
│   │   ├── participations/
│   │   │   └── index.php
│   │   └── evaluations/
│   │       └── index.php
│   ├── config/
│   │   ├── database.php         # Connexion PDO
│   │   └── helpers.php          # Fonctions utilitaires
│   └── sql/
│       ├── schema.sql           # Création des tables
│       ├── functions.sql        # Fonctions stockées
│       ├── procedures.sql       # Procédures stockées
│       └── triggers.sql         # Triggers
│
└── README.md
```

## 🚀 Installation

### Prérequis
- PHP 8.0+
- MySQL 8.0+
- Node.js 18+
- npm ou yarn

### 1. Base de données

```bash
# Connexion à MySQL
mysql -u root -p

# Exécuter les scripts SQL dans l'ordre :
source /chemin/vers/backend/sql/schema.sql
source /chemin/vers/backend/sql/functions.sql
source /chemin/vers/backend/sql/procedures.sql
source /chemin/vers/backend/sql/triggers.sql
```

### 2. Backend PHP

```bash
# Configurer la base de données dans backend/config/database.php
# Modifier les variables : host, dbname, username, password

# Démarrer le serveur PHP
cd backend
php -S localhost:8000
```

### 3. Frontend React

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## ⚙️ Configuration

### Backend (backend/config/database.php)
```php
private $host = 'localhost';
private $dbname = 'event_platform';
private $username = 'root';
private $password = '';
```

### Frontend (src/api/axiosConfig.js)
```javascript
baseURL: 'http://localhost:8000/backend/api',
```

## 👤 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@eventplatform.com | admin123 |
| Utilisateur | john@example.com | password123 |

## 🗄️ MySQL Avancé

### Fonctions stockées (5)
| Fonction | Description |
|----------|-------------|
| `fn_calculate_average_rating(event_id)` | Calcule la moyenne des notes |
| `fn_is_event_full(event_id)` | Vérifie si un événement est complet |
| `fn_get_available_spots(event_id)` | Retourne le nombre de places disponibles |
| `fn_user_has_participated(user_id, event_id)` | Vérifie si un utilisateur est inscrit |
| `fn_get_event_status_label(status)` | Retourne le libellé du statut |

### Procédures stockées (6)
| Procédure | Description |
|-----------|-------------|
| `sp_register_user_to_event(user_id, event_id, OUT success, OUT message)` | Inscription à un événement |
| `sp_cancel_participation(user_id, event_id, OUT success, OUT message)` | Annulation de participation |
| `sp_update_event_status(event_id)` | Met à jour le statut d'un événement |
| `sp_update_past_events_status()` | Met à jour les événements passés (CURSEUR) |
| `sp_calculate_event_statistics()` | Calcule les statistiques (CURSEUR) |
| `sp_cleanup_cancelled_participations(days_old)` | Nettoie les participations (CURSEUR) |

### Triggers (7)
| Trigger | Événement | Description |
|---------|-----------|-------------|
| `trg_before_insert_participation` | BEFORE INSERT | Vérifie la capacité avant inscription |
| `trg_after_insert_participation` | AFTER INSERT | Incrémente le compteur de participants |
| `trg_after_delete_participation` | AFTER DELETE | Décrémente le compteur de participants |
| `trg_after_insert_evaluation` | AFTER INSERT | Recalcule la moyenne des notes |
| `trg_after_update_evaluation` | AFTER UPDATE | Recalcule la moyenne après modification |
| `trg_after_update_event` | AFTER UPDATE | Log les modifications d'événements |
| `trg_before_delete_event` | BEFORE DELETE | Empêche la suppression si participants |

## 📡 API Reference

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register.php` | Inscription |
| POST | `/api/auth/login.php` | Connexion |
| POST | `/api/auth/logout.php` | Déconnexion |
| GET | `/api/auth/me.php` | Profil utilisateur |

### Événements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/events/index.php` | Liste des événements |
| POST | `/api/events/index.php` | Créer un événement (admin) |
| GET | `/api/events/show.php?id=X` | Détails d'un événement |
| PUT | `/api/events/show.php?id=X` | Modifier un événement (admin) |
| DELETE | `/api/events/show.php?id=X` | Supprimer un événement (admin) |

### Participations

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/participations/index.php` | Liste des participations |
| POST | `/api/participations/index.php` | S'inscrire à un événement |
| DELETE | `/api/participations/index.php?event_id=X` | Annuler une participation |

### Évaluations

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/evaluations/index.php` | Liste des évaluations |
| POST | `/api/evaluations/index.php` | Créer une évaluation |
| PUT | `/api/evaluations/index.php?id=X` | Modifier une évaluation |
| DELETE | `/api/evaluations/index.php?id=X` | Supprimer une évaluation |

## 📝 Notes importantes

1. **Sécurité** : Les mots de passe sont hashés avec `password_hash()` (bcrypt)
2. **CORS** : Configuré pour permettre les requêtes depuis le frontend
3. **Sessions** : Utilisées pour maintenir l'authentification côté serveur
4. **Validation** : Double validation côté client et serveur
5. **Transactions** : Utilisées dans les procédures stockées pour garantir l'intégrité

## 🎓 Pour les étudiants

Ce projet illustre :
- L'architecture MVC côté frontend avec React/Redux
- La création d'API RESTful en PHP
- L'utilisation avancée de MySQL (fonctions, procédures, triggers, curseurs)
- La gestion de l'authentification et des sessions
- Les bonnes pratiques de développement web

---

**Auteur** : Projet pédagogique  
**Licence** : MIT
