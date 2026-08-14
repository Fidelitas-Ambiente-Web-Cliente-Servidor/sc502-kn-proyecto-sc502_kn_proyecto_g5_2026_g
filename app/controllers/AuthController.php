<?php

class AuthController extends Controller
{
    private UserModel $users;

    public function __construct()
    {
        $this->users = new UserModel(Database::getConnection());
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

    public function logout(): void
    {
        Auth::logout();
        flash('ok', 'Sesión cerrada correctamente.');
        $this->redirect('home', 'index');
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
