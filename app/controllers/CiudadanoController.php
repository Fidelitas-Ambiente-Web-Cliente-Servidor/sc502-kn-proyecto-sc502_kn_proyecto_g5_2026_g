<?php

class CiudadanoController extends Controller
{
    private ReportModel $reports;
    private NotificationModel $notifications;
    private CatalogModel $catalog;

    public function __construct()
    {
        $db = Database::getConnection();
        $this->reports = new ReportModel($db);
        $this->notifications = new NotificationModel($db);
        $this->catalog = new CatalogModel($db);
    }

    public function misReportes(): void
    {
        Auth::requireRole('ciudadano');

        $reportes = $this->reports->myReports(Auth::id());

        $this->render('ciudadano/mis-reportes', [
            'pageTitle' => 'Mis reportes',
            'reportes' => $reportes,
            'resumen' => $this->resumenReportes($reportes),
        ]);
    }

    public function nuevoReporte(): void
    {
        Auth::requireRole('ciudadano');

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            verify_csrf();

            try {
                $descripcion = trim($_POST['descripcion'] ?? '');
                $tipoFocoId = (int)($_POST['tipo_foco_id'] ?? 0);
                $latitud = (float)($_POST['latitud'] ?? 0);
                $longitud = (float)($_POST['longitud'] ?? 0);

                if (strlen($descripcion) < 10) {
                    throw new InvalidArgumentException('La descripción debe tener al menos 10 caracteres.');
                }

                if (!$tipoFocoId) {
                    throw new InvalidArgumentException('Seleccione el tipo de foco de riesgo.');
                }

                if (!$latitud || !$longitud) {
                    throw new InvalidArgumentException('Marque la ubicación del foco de riesgo en el mapa.');
                }

                $zonaId = $this->zonaMasCercana($latitud, $longitud);

                $reporte = $this->reports->create(
                    Auth::id(),
                    $zonaId,
                    $latitud,
                    $longitud,
                    $descripcion,
                    $tipoFocoId
                );

                $this->notifications->create(
                    Auth::id(),
                    $reporte['id'],
                    "Su reporte {$reporte['codigo']} fue recibido y está pendiente de revisión."
                );

                flash('ok', "Reporte {$reporte['codigo']} enviado correctamente.");
                $this->redirect('ciudadano', 'misReportes');
            } catch (Throwable $e) {
                flash('error', $e->getMessage());
            }
        }

        $this->render('ciudadano/nuevo-reporte', [
            'pageTitle' => 'Nuevo reporte',
            'tiposFoco' => $this->catalog->tiposFoco(),
        ]);
    }

    public function notificaciones(): void
    {
        Auth::requireRole('ciudadano');

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            verify_csrf();

            if (isset($_POST['marcar_todas'])) {
                $this->notifications->markAllRead(Auth::id());
            } elseif (isset($_POST['notificacion_id'])) {
                $this->notifications->markRead((int)$_POST['notificacion_id'], Auth::id());
            }

            $this->redirect('ciudadano', 'notificaciones');
        }

        $notificaciones = $this->notifications->forUser(Auth::id());

        $this->render('ciudadano/notificaciones', [
            'pageTitle' => 'Notificaciones',
            'notificaciones' => $notificaciones,
            'resumen' => $this->resumenNotificaciones($notificaciones),
        ]);
    }

    private function resumenReportes(array $reportes): array
    {
        $pendientes = 0;
        $enProceso = 0;
        $resueltos = 0;

        foreach ($reportes as $r) {
            if ($r['estado'] === 'Pendiente') $pendientes++;
            elseif (in_array($r['estado'], ['Asignado', 'En atención'], true)) $enProceso++;
            elseif ($r['estado'] === 'Resuelto') $resueltos++;
        }

        return [
            'total' => count($reportes),
            'pendientes' => $pendientes,
            'en_proceso' => $enProceso,
            'resueltos' => $resueltos,
        ];
    }

    private function resumenNotificaciones(array $notificaciones): array
    {
        $noLeidas = 0;

        foreach ($notificaciones as $n) {
            if (!$n['leida']) $noLeidas++;
        }

        return [
            'total' => count($notificaciones),
            'no_leidas' => $noLeidas,
            'leidas' => count($notificaciones) - $noLeidas,
        ];
    }

    // Determina la zona municipal más cercana al punto marcado en el mapa
    private function zonaMasCercana(float $latitud, float $longitud): int
    {
        $zonas = $this->catalog->zonas();
        $masCercana = $zonas[0];
        $menorDistancia = INF;

        foreach ($zonas as $zona) {
            $distancia = sqrt(
                ($zona['latitud_centro'] - $latitud) ** 2 +
                ($zona['longitud_centro'] - $longitud) ** 2
            );

            if ($distancia < $menorDistancia) {
                $menorDistancia = $distancia;
                $masCercana = $zona;
            }
        }

        return (int)$masCercana['id'];
    }
}