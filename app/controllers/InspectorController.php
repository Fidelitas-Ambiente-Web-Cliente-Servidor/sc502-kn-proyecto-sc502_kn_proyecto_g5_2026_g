<?php

class InspectorController extends Controller
{
    private ZonaModel $zonas;
    private CatalogModel $catalogs;
    private InspectorModel $inspector;
    private NotificationModel $notifications;

    public function __construct()
    {
        $db = Database::getConnection();
        $this->zonas = new ZonaModel($db);
        $this->catalogs = new CatalogModel($db);
        $this->inspector = new InspectorModel($db);
        $this->notifications = new NotificationModel($db);
    }

    public function casos(): void
    {
        Auth::requireRole('inspector');

        $filters = [
            'search' => trim($_GET['search'] ?? ''),
            'estado_id' => (int)($_GET['estado_id'] ?? 0),
            'prioridad' => trim($_GET['prioridad'] ?? ''),
        ];

        $this->render('inspector/bandeja', [
            'pageTitle' => 'Gestión de casos',
            'casos' => $this->inspector->casos($filters),
            'brigadistas' => $this->inspector->brigadistas(),
            'caso' => null,
            'filters' => $filters,
        ]);
    }

    public function detalle(): void
    {
        Auth::requireRole('inspector');

        $reporteId = (int)($_GET['reporte_id'] ?? 0);
        $caso = $reporteId ? $this->inspector->caso($reporteId) : null;

        if (!$caso) {
            flash('error', 'El caso seleccionado no existe.');
            $this->redirect('inspector', 'casos');
        }

        $filters = [
            'search' => trim($_GET['search'] ?? ''),
            'estado_id' => (int)($_GET['estado_id'] ?? 0),
            'prioridad' => trim($_GET['prioridad'] ?? ''),
        ];

        $this->render('inspector/bandeja', [
            'pageTitle' => 'Gestión de casos',
            'casos' => $this->inspector->casos($filters),
            'brigadistas' => $this->inspector->brigadistas(),
            'caso' => $caso,
            'filters' => $filters,
        ]);
    }

    public function asignar(): void
    {
        Auth::requireRole('inspector');
        verify_csrf();

        try {
            $reporteId = (int)($_POST['reporte_id'] ?? 0);
            $brigadistaId = (int)($_POST['brigadista_id'] ?? 0);
            $prioridad = trim($_POST['prioridad'] ?? 'Media');

            if (!$reporteId || !$brigadistaId) {
                throw new InvalidArgumentException('Seleccione un caso y un brigadista.');
            }

            $this->inspector->asignar($reporteId, $brigadistaId, (int)Auth::id(), $prioridad);

            $caso = $this->inspector->caso($reporteId);
            if ($caso && !empty($caso['brigadista_id'])) {
                $this->notifications->create(
                    (int)$caso['brigadista_id'],
                    $reporteId,
                    "Se le asignó el caso {$caso['codigo']} con prioridad {$prioridad}."
                );
            }

            flash('ok', 'Caso validado y asignado correctamente.');
            $this->redirect('inspector', 'detalle', ['reporte_id' => $reporteId]);
        } catch (Throwable $e) {
            flash('error', $e->getMessage());
            $this->redirect('inspector', 'detalle', ['reporte_id' => (int)($_POST['reporte_id'] ?? 0)]);
        }
    }

    public function prioridad(): void
    {
        Auth::requireRole('inspector');
        verify_csrf();

        $reporteId = (int)($_POST['reporte_id'] ?? 0);
        try {
            $this->inspector->actualizarPrioridad(
                $reporteId,
                trim($_POST['prioridad'] ?? 'Media'),
                (int)Auth::id()
            );
            flash('ok', 'Prioridad actualizada correctamente.');
        } catch (Throwable $e) {
            flash('error', $e->getMessage());
        }

        $this->redirect('inspector', 'detalle', ['reporte_id' => $reporteId]);
    }

    public function rechazar(): void
    {
        Auth::requireRole('inspector');
        verify_csrf();

        $reporteId = (int)($_POST['reporte_id'] ?? 0);
        try {
            $this->inspector->rechazar(
                $reporteId,
                (int)Auth::id(),
                trim($_POST['motivo'] ?? '')
            );
            flash('ok', 'Caso rechazado correctamente.');
        } catch (Throwable $e) {
            flash('error', $e->getMessage());
        }

        $this->redirect('inspector', 'detalle', ['reporte_id' => $reporteId]);
    }

    public function brigadas(): void
    {
        Auth::requireRole('inspector');

        $brigadistaId = (int)($_GET['brigadista_id'] ?? 0);
        $brigadista = $brigadistaId ? $this->inspector->obtenerBrigadista($brigadistaId) : null;

        $this->render('inspector/brigadas', [
            'pageTitle' => 'Gestión de brigadas',
            'brigadistas' => $this->inspector->brigadistas(),
            'brigadista' => $brigadista,
            'casosAsignados' => $brigadista ? $this->inspector->casosDeBrigadista($brigadistaId) : [],
        ]);
    }

    public function reasignar(): void
    {
        Auth::requireRole('inspector');
        verify_csrf();

        $reporteId = (int)($_POST['reporte_id'] ?? 0);
        try {
            $brigadistaId = (int)($_POST['brigadista_id'] ?? 0);
            $prioridad = trim($_POST['prioridad'] ?? 'Media');
            $motivo = trim($_POST['motivo'] ?? '');

            if (strlen($motivo) < 5) {
                throw new InvalidArgumentException('Indique un motivo para la reasignación.');
            }

            $this->inspector->asignar($reporteId, $brigadistaId, (int)Auth::id(), $prioridad, 'Reasignación: ' . $motivo);

            $caso = $this->inspector->caso($reporteId);
            if ($caso && !empty($caso['brigadista_id'])) {
                $this->notifications->create(
                    (int)$caso['brigadista_id'],
                    $reporteId,
                    "El caso {$caso['codigo']} fue reasignado a su brigada. Motivo: {$motivo}"
                );
            }

            flash('ok', 'Caso reasignado correctamente.');
        } catch (Throwable $e) {
            flash('error', $e->getMessage());
        }

        $this->redirect('inspector', 'brigadas', ['brigadista_id' => (int)($_POST['brigadista_anterior'] ?? 0)]);
    }

    public function zonas(): void
    {
        Auth::requireRole('inspector');

        $filters = [
            'tipo_foco_id' => (int)($_GET['tipo_foco_id'] ?? 0),
            'estado_id' => (int)($_GET['estado_id'] ?? 0),
            'month' => trim($_GET['month'] ?? ''),
        ];

        $reportes = $this->zonas->reportesFiltrados($filters);
        $ranking = $this->zonas->rankingPorZona($filters);

        $this->render('inspector/zonas', [
            'pageTitle' => 'Zonas de riesgo',
            'reportes' => $reportes,
            'ranking' => $ranking,
            'tiposFoco' => $this->catalogs->tiposFoco(),
            'meses' => $this->zonas->mesesDisponibles(),
            'filters' => $filters,
            'totalReportes' => count($reportes),
        ]);
    }
}
