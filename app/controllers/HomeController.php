<?php

class HomeController extends Controller
{
    public function index(): void
    {
        $moduleUrl = null;
        $moduleLabel = null;

        if (Auth::check()) {
            switch (Auth::role()) {
                case 'ciudadano':
                    $moduleUrl = legacy_url('ciudadano/mis-reportes.html');
                    $moduleLabel = 'Ir a mis reportes';
                    break;
                case 'brigadista':
                    $moduleUrl = url('brigadista', 'asignaciones');
                    $moduleLabel = 'Ir a mis asignaciones';
                    break;
                case 'inspector':
                    $moduleUrl = legacy_url('inspector/bandeja.html');
                    $moduleLabel = 'Ir a gestión de casos';
                    break;
                case 'administrador':
                    $moduleUrl = url('estadisticas', 'index');
                    $moduleLabel = 'Ir a estadísticas';
                    break;
            }
        }

        $this->render('home/index', [
            'pageTitle' => 'Inicio',
            'moduleUrl' => $moduleUrl,
            'moduleLabel' => $moduleLabel,
        ]);
    }
}
