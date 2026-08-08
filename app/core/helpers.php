<?php

function url(string $controller = 'home', string $action = 'index', array $params = []): string
{
    $query = array_merge(['controller' => $controller, 'action' => $action], $params);
    return 'index.php?' . http_build_query($query);
}

function asset(string $path): string
{
    return 'assets/' . ltrim($path, '/');
}

function legacy_url(string $path = 'index.html'): string
{
    return '../' . ltrim($path, '/');
}

function e(?string $value): string
{
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function flash(string $key, ?string $message = null): ?string
{
    if ($message !== null) {
        $_SESSION['_flash'][$key] = $message;
        return null;
    }

    $value = $_SESSION['_flash'][$key] ?? null;
    unset($_SESSION['_flash'][$key]);
    return $value;
}

function csrf_token(): string
{
    if (empty($_SESSION['_csrf'])) {
        $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

function verify_csrf(): void
{
    $token = $_POST['csrf'] ?? '';
    if (!$token || !hash_equals($_SESSION['_csrf'] ?? '', $token)) {
        http_response_code(419);
        exit('Solicitud inválida: token CSRF incorrecto.');
    }
}

function normalizar_estado(string $estado): string
{
    $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $estado) ?: $estado;
    $value = strtolower($value);
    return trim(preg_replace('/[^a-z0-9]+/', '-', $value), '-');
}
