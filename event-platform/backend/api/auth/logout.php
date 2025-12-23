<?php
require_once __DIR__ . '/../../config/helpers.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Méthode non autorisée', 405);
}

if (!isLoggedIn()) {
    errorResponse('Vous n\'êtes pas connecté', 401);
}
$_SESSION = [];

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}
session_destroy();

successResponse(null, 'Déconnexion réussie');
