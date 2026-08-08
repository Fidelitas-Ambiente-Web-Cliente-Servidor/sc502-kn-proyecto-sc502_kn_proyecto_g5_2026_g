<?php

class BrigadistaController extends Controller
{
    private FieldActionModel $field;
    private NotificationModel $notifications;

    public function __construct()
    {
        $db = Database::getConnection();
        $this->field = new FieldActionModel($db);
        $this->notifications = new NotificationModel($db);
    }

    public function asignaciones(): void
    {
        Auth::requireRole('brigadista');

        $this->render('brigadista/asignaciones', [
            'pageTitle' => 'Mis asignaciones',
            'casos' => $this->field->activeAssignments(Auth::id()),
        ]);
    }

    public function accion(): void
    {
        Auth::requireRole('brigadista');

        $reporteId = (int)($_GET['reporte_id'] ?? $_POST['reporte_id'] ?? 0);
        $caso = $reporteId ? $this->field->assignment($reporteId, Auth::id()) : null;

        if (!$caso) {
            flash('error', 'Seleccione uno de sus casos activos.');
            $this->redirect('brigadista', 'asignaciones');
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            verify_csrf();

            try {
                $tipo = trim($_POST['tipo_accion'] ?? '');
                $descripcion = trim($_POST['descripcion'] ?? '');
                $estado = trim($_POST['estado_resultado'] ?? '');

                if (strlen($descripcion) < 10) {
                    throw new InvalidArgumentException('La descripción debe tener al menos 10 caracteres.');
                }

                $imagen = $this->saveImage($_FILES['evidencia'] ?? [], 'acciones');

                $assignment = $this->field->addAction(
                    $reporteId,
                    Auth::id(),
                    $tipo,
                    $descripcion,
                    $estado,
                    $imagen
                );

                $this->notifications->create(
                    (int)$assignment['usuario_id'],
                    $reporteId,
                    "El caso {$assignment['codigo']} cambió a {$estado}."
                );

                if (!empty($assignment['inspector_id'])) {
                    $this->notifications->create(
                        (int)$assignment['inspector_id'],
                        $reporteId,
                        "El brigadista actualizó {$assignment['codigo']} a {$estado}."
                    );
                }

                flash('ok', 'Acción de campo registrada correctamente.');
                $this->redirect('brigadista', 'asignaciones');
            } catch (Throwable $e) {
                flash('error', $e->getMessage());
            }
        }

        $this->render('brigadista/accion', [
            'pageTitle' => 'Registrar acción de campo',
            'caso' => $caso,
            'acciones' => $this->field->actions($reporteId),
            'historial' => $this->field->history($reporteId),
        ]);
    }
}
