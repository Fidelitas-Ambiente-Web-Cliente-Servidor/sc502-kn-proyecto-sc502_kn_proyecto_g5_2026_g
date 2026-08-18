<?php

class InspectorModel
{
    public function __construct(private PDO $db) {}

    public function casos(array $filters = []): array
    {
        $where = [];
        $params = [];

        if (!empty($filters['search'])) {
            $where[] = '(r.codigo LIKE :search OR r.descripcion LIKE :search OR u.nombre LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }

        if (!empty($filters['estado_id'])) {
            $where[] = 'r.estado_id = :estado_id';
            $params['estado_id'] = (int)$filters['estado_id'];
        }

        if (!empty($filters['prioridad'])) {
            $where[] = 'r.prioridad = :prioridad';
            $params['prioridad'] = $filters['prioridad'];
        }

        $sql = "
            SELECT
                r.id,
                r.codigo,
                r.descripcion,
                r.latitud,
                r.longitud,
                r.prioridad,
                r.validado,
                r.fecha_creacion,
                z.nombre AS zona,
                t.nombre AS tipo,
                e.nombre AS estado,
                u.nombre AS ciudadano,
                u.email AS ciudadano_email,
                ab.brigadista_id,
                ub.nombre AS brigadista
            FROM reportes r
            JOIN usuarios u ON u.id = r.usuario_id
            JOIN zonas z ON z.id = r.zona_id
            JOIN tipos_foco t ON t.id = r.tipo_foco_id
            JOIN estados_reporte e ON e.id = r.estado_id
            LEFT JOIN asignaciones ab ON ab.reporte_id = r.id AND ab.activa = 1
            LEFT JOIN usuarios ub ON ub.id = ab.brigadista_id
        ";

        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= ' ORDER BY FIELD(r.prioridad, \'Alta\', \'Media\', \'Baja\'), r.fecha_creacion DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function caso(int $reporteId): ?array
    {
        $stmt = $this->db->prepare(" 
            SELECT
                r.id,
                r.codigo,
                r.descripcion,
                r.latitud,
                r.longitud,
                r.prioridad,
                r.validado,
                r.fecha_creacion,
                r.fecha_resolucion,
                z.nombre AS zona,
                z.descripcion AS zona_descripcion,
                t.nombre AS tipo,
                e.nombre AS estado,
                u.nombre AS ciudadano,
                u.email AS ciudadano_email,
                a.id AS asignacion_id,
                a.brigadista_id,
                b.nombre AS brigadista,
                a.fecha_asignacion,
                a.motivo_reasignacion
            FROM reportes r
            JOIN usuarios u ON u.id = r.usuario_id
            JOIN zonas z ON z.id = r.zona_id
            JOIN tipos_foco t ON t.id = r.tipo_foco_id
            JOIN estados_reporte e ON e.id = r.estado_id
            LEFT JOIN asignaciones a ON a.reporte_id = r.id AND a.activa = 1
            LEFT JOIN usuarios b ON b.id = a.brigadista_id
            WHERE r.id = :id
            LIMIT 1
        ");
        $stmt->execute(['id' => $reporteId]);
        return $stmt->fetch() ?: null;
    }

    public function brigadistas(): array
    {
        $sql = "
            SELECT
                u.id,
                u.nombre,
                u.email,
                u.zona_id,
                u.disponible,
                u.activo,
                z.nombre AS zona,
                COUNT(a.id) AS casos_activos
            FROM usuarios u
            JOIN roles r ON r.id = u.rol_id
            LEFT JOIN zonas z ON z.id = u.zona_id
            LEFT JOIN asignaciones a ON a.brigadista_id = u.id AND a.activa = 1
            WHERE r.nombre = 'brigadista'
              AND u.activo = 1
            GROUP BY u.id, u.nombre, u.email, u.zona_id, u.disponible, u.activo, z.nombre
            ORDER BY u.disponible DESC, casos_activos ASC, u.nombre ASC
        ";

        return $this->db->query($sql)->fetchAll();
    }

    public function casosDeBrigadista(int $brigadistaId): array
    {
        $stmt = $this->db->prepare(" 
            SELECT
                r.id,
                r.codigo,
                r.descripcion,
                r.prioridad,
                r.fecha_creacion,
                z.nombre AS zona,
                t.nombre AS tipo,
                e.nombre AS estado,
                a.fecha_asignacion,
                a.motivo_reasignacion
            FROM asignaciones a
            JOIN reportes r ON r.id = a.reporte_id
            JOIN zonas z ON z.id = r.zona_id
            JOIN tipos_foco t ON t.id = r.tipo_foco_id
            JOIN estados_reporte e ON e.id = r.estado_id
            WHERE a.brigadista_id = :brigadista
              AND a.activa = 1
            ORDER BY FIELD(r.prioridad, 'Alta', 'Media', 'Baja'), a.fecha_asignacion DESC
        ");
        $stmt->execute(['brigadista' => $brigadistaId]);
        return $stmt->fetchAll();
    }

    public function obtenerBrigadista(int $brigadistaId): ?array
    {
        $stmt = $this->db->prepare(" 
            SELECT u.id, u.nombre, u.email, u.disponible, u.activo, z.nombre AS zona
            FROM usuarios u
            JOIN roles r ON r.id = u.rol_id
            LEFT JOIN zonas z ON z.id = u.zona_id
            WHERE u.id = :id AND r.nombre = 'brigadista'
            LIMIT 1
        ");
        $stmt->execute(['id' => $brigadistaId]);
        return $stmt->fetch() ?: null;
    }

    public function actualizarPrioridad(int $reporteId, string $prioridad, int $inspectorId): void
    {
        $this->validarPrioridad($prioridad);

        $stmt = $this->db->prepare('SELECT prioridad FROM reportes WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $reporteId]);
        $anterior = $stmt->fetchColumn();

        $stmt = $this->db->prepare('UPDATE reportes SET prioridad = :prioridad WHERE id = :id');
        $stmt->execute(['prioridad' => $prioridad, 'id' => $reporteId]);

        $stmt = $this->db->prepare('UPDATE asignaciones SET prioridad = :prioridad WHERE reporte_id = :id AND activa = 1');
        $stmt->execute(['prioridad' => $prioridad, 'id' => $reporteId]);

        if ($anterior !== $prioridad) {
            $this->historial($reporteId, $inspectorId, null, null, "Prioridad cambiada de {$anterior} a {$prioridad}.");
        }
    }

    public function asignar(int $reporteId, int $brigadistaId, int $inspectorId, string $prioridad, string $motivo = ''): void
    {
        $this->validarPrioridad($prioridad);

        $brigadista = $this->obtenerBrigadista($brigadistaId);
        if (!$brigadista || !(int)$brigadista['activo']) {
            throw new InvalidArgumentException('El brigadista seleccionado no está disponible en el sistema.');
        }

        $caso = $this->caso($reporteId);
        if (!$caso) {
            throw new InvalidArgumentException('El caso seleccionado no existe.');
        }

        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare('SELECT id, brigadista_id FROM asignaciones WHERE reporte_id = :reporte AND activa = 1 LIMIT 1 FOR UPDATE');
            $stmt->execute(['reporte' => $reporteId]);
            $actual = $stmt->fetch();

            if ($actual) {
                if ((int)$actual['brigadista_id'] === $brigadistaId) {
                    $stmt = $this->db->prepare('UPDATE asignaciones SET prioridad = :prioridad WHERE id = :id');
                    $stmt->execute(['prioridad' => $prioridad, 'id' => (int)$actual['id']]);
                } else {
                    $stmt = $this->db->prepare('UPDATE asignaciones SET activa = 0, motivo_reasignacion = :motivo WHERE id = :id');
                    $stmt->execute([
                        'motivo' => 'Reasignación realizada por el inspector.',
                        'id' => (int)$actual['id'],
                    ]);

                    $this->insertarAsignacion($reporteId, $brigadistaId, $inspectorId, $prioridad, $motivo !== '' ? $motivo : 'Reasignación realizada por el inspector.');
                }
            } else {
                $this->insertarAsignacion($reporteId, $brigadistaId, $inspectorId, $prioridad, $motivo !== '' ? $motivo : 'Asignación realizada por el inspector.');
            }

            $estadoAsignado = $this->estadoId('Asignado');
            $stmt = $this->db->prepare('UPDATE reportes SET estado_id = :estado, prioridad = :prioridad, validado = 1 WHERE id = :id');
            $stmt->execute([
                'estado' => $estadoAsignado,
                'prioridad' => $prioridad,
                'id' => $reporteId,
            ]);

            $this->historial($reporteId, $inspectorId, $this->estadoId($caso['estado']), $estadoAsignado, "Caso validado y asignado a {$brigadista['nombre']} con prioridad {$prioridad}.");
            $this->db->commit();
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    public function rechazar(int $reporteId, int $inspectorId, string $motivo): void
    {
        $motivo = trim($motivo);
        if (strlen($motivo) < 5) {
            throw new InvalidArgumentException('Indique un motivo para rechazar el caso.');
        }

        $caso = $this->caso($reporteId);
        if (!$caso) {
            throw new InvalidArgumentException('El caso seleccionado no existe.');
        }

        $estadoRechazado = $this->estadoId('Rechazado');

        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare('UPDATE asignaciones SET activa = 0, motivo_reasignacion = :motivo WHERE reporte_id = :id AND activa = 1');
            $stmt->execute(['motivo' => 'Caso rechazado: ' . $motivo, 'id' => $reporteId]);

            $stmt = $this->db->prepare('UPDATE reportes SET estado_id = :estado, validado = 1 WHERE id = :id');
            $stmt->execute(['estado' => $estadoRechazado, 'id' => $reporteId]);

            $this->historial($reporteId, $inspectorId, $this->estadoId($caso['estado']), $estadoRechazado, 'Caso rechazado: ' . $motivo);
            $this->db->commit();
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    private function insertarAsignacion(int $reporteId, int $brigadistaId, int $inspectorId, string $prioridad, string $motivo): void
    {
        $stmt = $this->db->prepare(" 
            INSERT INTO asignaciones(reporte_id, brigadista_id, inspector_id, fecha_asignacion, prioridad, activa, motivo_reasignacion)
            VALUES(:reporte, :brigadista, :inspector, NOW(), :prioridad, 1, :motivo)
        ");
        $stmt->execute([
            'reporte' => $reporteId,
            'brigadista' => $brigadistaId,
            'inspector' => $inspectorId,
            'prioridad' => $prioridad,
            'motivo' => $motivo,
        ]);
    }

    private function estadoId(string $nombre): int
    {
        $stmt = $this->db->prepare('SELECT id FROM estados_reporte WHERE nombre = :nombre LIMIT 1');
        $stmt->execute(['nombre' => $nombre]);
        $id = $stmt->fetchColumn();
        if (!$id) {
            throw new RuntimeException("Estado '{$nombre}' no configurado.");
        }
        return (int)$id;
    }

    private function historial(int $reporteId, int $usuarioId, ?int $anterior, ?int $nuevo, string $detalle): void
    {
        $stmt = $this->db->prepare(" 
            INSERT INTO historial_reportes(reporte_id, usuario_id, estado_anterior_id, estado_nuevo_id, detalle, fecha)
            VALUES(:reporte, :usuario, :anterior, :nuevo, :detalle, NOW())
        ");
        $stmt->execute([
            'reporte' => $reporteId,
            'usuario' => $usuarioId,
            'anterior' => $anterior,
            'nuevo' => $nuevo,
            'detalle' => $detalle,
        ]);
    }

    private function validarPrioridad(string $prioridad): void
    {
        if (!in_array($prioridad, ['Alta', 'Media', 'Baja'], true)) {
            throw new InvalidArgumentException('Prioridad no válida.');
        }
    }
}
