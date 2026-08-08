<?php

class Auth
{
    public static function check(): bool
    {
        return !empty($_SESSION['user']);
    }

    public static function user(): ?array
    {
        return $_SESSION['user'] ?? null;
    }

    public static function id(): ?int
    {
        return isset($_SESSION['user']['id']) ? (int)$_SESSION['user']['id'] : null;
    }

    public static function role(): ?string
    {
        return $_SESSION['user']['rol'] ?? null;
    }

    public static function login(array $user): void
    {
        session_regenerate_id(true);

        $_SESSION['user'] = [
            'id' => (int)$user['id'],
            'nombre' => $user['nombre'],
            'email' => $user['email'],
            'rol' => $user['rol'],
            'rol_id' => (int)$user['rol_id'],
            'zona_id' => $user['zona_id'] ? (int)$user['zona_id'] : null,
        ];
    }

    public static function logout(): void
    {
        unset($_SESSION['user']);
        session_regenerate_id(true);
    }

    public static function requireLogin(): void
    {
        if (!self::check()) {
            flash('error', 'Debe iniciar sesión para continuar.');
            header('Location: ' . url('auth', 'login'));
            exit;
        }
    }

    public static function requireRole(array|string $roles): void
    {
        self::requireLogin();
        $roles = (array)$roles;

        if (!in_array(self::role(), $roles, true)) {
            http_response_code(403);
            exit('Acceso denegado para este rol.');
        }
    }
}
