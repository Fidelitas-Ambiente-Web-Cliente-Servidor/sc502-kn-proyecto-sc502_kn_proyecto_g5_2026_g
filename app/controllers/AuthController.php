<?php

class AuthController extends Controller
{
    private UserModel $users;
    private PasswordResetModel $resets;

    public function __construct()
    {
        $db = Database::getConnection();
        $this->users = new UserModel($db);
        $this->resets = new PasswordResetModel($db);
    }

    public function login(): void
    {
        if (Auth::check()) {
            $this->sendToRole();
        }

        $email = '';

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            verify_csrf();

            $email = strtolower(trim($_POST['email'] ?? ''));
            $password = $_POST['password'] ?? '';

            if ($email === '' || $password === '') {
                flash('error', 'Ingrese el correo y la contraseña.');
            } else {
                $user = $this->users->findByEmail($email);

                if (!$user || !(int)$user['activo'] || !password_verify($password, $user['contrasena_hash'])) {
                    flash('error', 'Correo o contraseña incorrectos.');
                } else {
                    Auth::login($user);
                    $this->sendToRole();
                }
            }
        }

        $this->render('auth/login', [
            'pageTitle' => 'Iniciar sesión',
            'email' => $email,
        ]);
    }

    public function register(): void
    {
        if (Auth::check()) {
            $this->sendToRole();
        }

        $nombre = '';
        $email = '';

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            verify_csrf();

            $nombre = trim($_POST['nombre'] ?? '');
            $email = strtolower(trim($_POST['email'] ?? ''));
            $password = $_POST['password'] ?? '';
            $confirmar = $_POST['confirmar_password'] ?? '';

            $errores = [];

            if ($nombre === '' || strlen($nombre) < 3) {
                $errores[] = 'Ingrese su nombre completo.';
            }

            if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errores[] = 'Ingrese un correo electrónico válido.';
            }

            if (strlen($password) < 6) {
                $errores[] = 'La contraseña debe tener al menos 6 caracteres.';
            }

            if ($password !== $confirmar) {
                $errores[] = 'Las contraseñas no coinciden.';
            }

            if (!$errores && $this->users->emailExists($email)) {
                $errores[] = 'Ya existe una cuenta registrada con ese correo.';
            }

            if ($errores) {
                flash('error', implode(' ', $errores));
            } else {
                // Rol ciudadano automático (ver UserModel::create).
                $this->users->create($nombre, $email, $password);
                flash('ok', 'Cuenta creada correctamente. Ya puede iniciar sesión.');
                $this->redirect('auth', 'login');
            }
        }

        $this->render('auth/register', [
            'pageTitle' => 'Crear cuenta',
            'nombre' => $nombre,
            'email' => $email,
        ]);
    }

    public function logout(): void
    {
        Auth::logout();
        flash('ok', 'Sesión cerrada correctamente.');
        $this->redirect('home', 'index');
    }

    public function forgotPassword(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            verify_csrf();

            $email = strtolower(trim($_POST['email'] ?? ''));
            $user = $email !== '' ? $this->users->findByEmail($email) : null;

            if ($user) {
                $token = bin2hex(random_bytes(20));
                $this->resets->create((int)$user['id'], hash('sha256', $token));

                // No se cuenta con un proveedor SMTP configurado (ver documento,
                // sección de recomendaciones futuras), así que el código temporal
                // se muestra directamente en pantalla en vez de enviarse por correo.
                flash('ok', 'Código de recuperación generado: ' . $token
                    . '. Es válido por 30 minutos. Úselo en la pantalla de restablecimiento junto con su correo.');
            } else {
                // No se revela si el correo existe o no.
                flash('ok', 'Si el correo está registrado, se generó un código de recuperación.');
            }

            $this->redirect('auth', 'resetPassword');
        }

        $this->render('auth/forgot-password', [
            'pageTitle' => 'Recuperar contraseña',
        ]);
    }

    public function resetPassword(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            verify_csrf();

            $email = strtolower(trim($_POST['email'] ?? ''));
            $token = trim($_POST['token'] ?? '');
            $password = $_POST['password'] ?? '';
            $confirmar = $_POST['confirmar_password'] ?? '';

            $errores = [];

            if ($email === '' || $token === '') {
                $errores[] = 'Ingrese el correo y el código de recuperación.';
            }

            if (strlen($password) < 6) {
                $errores[] = 'La nueva contraseña debe tener al menos 6 caracteres.';
            }

            if ($password !== $confirmar) {
                $errores[] = 'Las contraseñas no coinciden.';
            }

            if (!$errores) {
                $user = $this->users->findByEmail($email);
                $reset = $user ? $this->resets->findValid((int)$user['id'], hash('sha256', $token)) : null;

                if (!$reset) {
                    $errores[] = 'El código de recuperación es inválido o expiró.';
                } else {
                    $this->users->updatePassword((int)$user['id'], $password);
                    $this->resets->markUsed((int)$reset['id']);
                    flash('ok', 'Contraseña actualizada correctamente. Ya puede iniciar sesión.');
                    $this->redirect('auth', 'login');
                }
            }

            if ($errores) {
                flash('error', implode(' ', $errores));
            }
        }

        $this->render('auth/reset-password', [
            'pageTitle' => 'Restablecer contraseña',
        ]);
    }

    private function sendToRole(): never
    {
        switch (Auth::role()) {
            case 'ciudadano':
                $this->redirect('ciudadano', 'misReportes');
            case 'brigadista':
                $this->redirect('brigadista', 'asignaciones');
            case 'inspector':
                header('Location: ' . legacy_url('inspector/bandeja.html'));
                exit;
            case 'administrador':
                $this->redirect('estadisticas', 'index');
            default:
                Auth::logout();
                flash('error', 'El usuario no tiene un rol válido asignado.');
                $this->redirect('auth', 'login');
        }
    }
}