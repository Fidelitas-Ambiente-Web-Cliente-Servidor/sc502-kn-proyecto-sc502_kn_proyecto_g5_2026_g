<?php

session_start();

define('APP_PATH', dirname(__DIR__) . '/app');
define('PUBLIC_PATH', __DIR__);

require APP_PATH . '/config/Database.php';
require APP_PATH . '/core/helpers.php';
require APP_PATH . '/core/Auth.php';
require APP_PATH . '/core/Controller.php';

foreach (glob(APP_PATH . '/models/*.php') as $file) {
    require $file;
}

foreach (glob(APP_PATH . '/controllers/*.php') as $file) {
    require $file;
}

$controllerName = strtolower($_GET['controller'] ?? 'home');
$action = $_GET['action'] ?? 'index';

$map = [
    'home' => HomeController::class,
    'auth' => AuthController::class,
    'brigadista' => BrigadistaController::class,
    'estadisticas' => EstadisticasController::class,
    'ciudadano' => CiudadanoController::class,
];

if (!isset($map[$controllerName])) {
    http_response_code(404);
    exit('Controlador no encontrado.');
}

try {
    $controller = new $map[$controllerName]();

    if (!method_exists($controller, $action) || str_starts_with($action, '__')) {
        http_response_code(404);
        exit('Acción no encontrada.');
    }

    $controller->$action();
} catch (PDOException $e) {
    http_response_code(500);
    $message = (getenv('APP_ENV') ?: 'local') === 'local'
        ? $e->getMessage()
        : 'Error de base de datos.';

    echo '<h1>Error de conexión</h1><p>'
        . htmlspecialchars($message, ENT_QUOTES, 'UTF-8')
        . '</p>';
}
