<?php
// Home-page API dependency copied from api.php: the "me" action.
ini_set('display_errors', 0);
date_default_timezone_set('Asia/Manila');
header('Content-Type: application/json');

function out($data){
    echo json_encode($data);
    exit;
}

function fail($message, $code = 400){
    http_response_code($code);
    out(['error' => $message]);
}

session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Lax',
    'secure'   => !empty($_SERVER['HTTPS']),
]);
session_start();

try {
    $db = new PDO(
        'mysql:host=localhost;dbname=bellavista;charset=utf8mb4',
        'root',
        '',
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $x) {
    fail('Cannot connect to the database. Is MySQL running and schema.sql imported?', 500);
}

function q($sql, $params = []){
    global $db;
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    return $stmt;
}

function user(){
    return isset($_SESSION['u'])
        ? q('SELECT * FROM users WHERE id = ?', [$_SESSION['u']])->fetch()
        : null;
}

if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(16));
}

if (isset($_GET['a']) && $_GET['a'] === 'me') {
    $currentUser = user();
    out([
        'user' => $currentUser ? ['role' => $currentUser['role']] : null,
        'csrf' => $_SESSION['csrf'],
    ]);
}

fail('Unknown API action.', 404);
?>