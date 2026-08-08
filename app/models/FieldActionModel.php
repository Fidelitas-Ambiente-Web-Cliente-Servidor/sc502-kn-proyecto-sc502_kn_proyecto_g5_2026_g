<?php

class FieldActionModel
{
    public function __construct(private PDO $db) {}

    private function estadoId(string $nombre): int
    {
        $stmt = $this->db->prepare(
            "SELECT id FROM estados_reporte WHERE nombre = :nombre LIMIT 1"
        );
        $stmt->execute(['nombre' => $nombre]);
        $id = $stmt->fetchColumn();

        if (!$id) {
            throw new RuntimeException('Estado no configurado: ' . $nombre);
        }

        return (int)$id;
    }

    public function activeAssignments(int $brigadistaId): array
    {
        $sql = "
            SELECT
                a.id AS asignacion_id,
                a.fecha_asignacion,
                a.prioridad AS prioridad_asignacion,
                r.id,
                r.codigo,
                r.descripcion,
                r.prioridad,
                r.latitud,
                r.longitud,
                r.fecha_creacion,
                u.nombre AS ciudadano,
                z.nombre AS zona,
                t.nombre AS tipo,
                e.nombre AS estado
            FROM asignaciones a
            JOIN reportes r ON r.id = a.reporte_id
            JOIN usuarios u ON u.id = r.usuario_id
            JOIN zonas z ON z.id = r.zona_id
            JOIN tipos_foco t ON t.id = r.tipo_foco_id
            JOIN estados_reporte e ON e.id = r.estado_id
            WHERE a.brigadista_id = :brigadista
              AND a.activa = 1
            ORDER BY
                CASE r.prioridad
                    WHEN 'Alta' THEN 1
                    WHEN 'Media' THEN 2
                    ELSE 3
                END,
                a.fecha_asignacion DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['brigadista' => $brigadistaId]);
        return $stmt->fetchAll();
    }

    public function assignment(int $reporteId, int $brigadistaId): ?array
    {
        $sql = "
            SELECT
                a.*,
                r.codigo,
                r.descripcion,
                r.latitud,
                r.longitud,
                r.usuario_id,
                r.estado_id,
                r.prioridad,
                z.nombre AS zona,
                t.nombre AS tipo,
                e.nombre AS estado
            FROM asignaciones a
            JOIN reportes r ON r.id = a.reporte_id
            JOIN zonas z ON z.id = r.zona_id
            JOIN tipos_foco t ON t.id = r.tipo_foco_id
            JOIN estados_reporte e ON e.id = r.estado_id
            WHERE a.reporte_id = :reporte
              AND a.brigadista_id = :brigadista
              AND a.activa = 1
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'reporte' => $reporteId,
            'brigadista' => $brigadistaId,
        ]);

        return $stmt->fetch() ?: null;
    }

    public function addAction(
        int $reporteId,
        int $brigadistaId,
        string $tipoAccion,
        string $descripcion,
        string $estadoResultado,
        ?string $imagen
    ): array {
        $assignment = $this->assignment($reporteId, $brigadistaId);

        if (!$assignment) {
            throw new RuntimeException('El caso no está asignado al brigadista actual.');
        }

        if (!in_array($tipoAccion, ['Visita', 'Fumigación', 'Resolución'], true)) {
            throw new InvalidArgumentException('Tipo de acción inválido.');
        }

        if (!in_array($estadoResultado, ['En atención', 'Resuelto'], true)) {
            throw new InvalidArgumentException('Estado resultante inválido.');
        }

        $nuevoEstadoId = $this->estadoId($estadoResultado);
        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare(
                "INSERT INTO acciones_campo(
                    asignacion_id,
                    tipo_accion,
                    descripcion,
                    fecha,
                    imagen_evidencia,
                    estado_resultado_id
                 ) VALUES(
                    :asignacion,
                    :tipo,
                    :descripcion,
                    NOW(),
                    :imagen,
                    :estado
                 )"
            );

            $stmt->execute([
                'asignacion' => (int)$assignment['id'],
                'tipo' => $tipoAccion,
                'descripcion' => $descripcion,
                'imagen' => $imagen,
                'estado' => $nuevoEstadoId,
            ]);

            if ($estadoResultado === 'Resuelto') {
                $stmt = $this->db->prepare(
                    "UPDATE reportes
                     SET estado_id = :estado, fecha_resolucion = NOW()
                     WHERE id = :id"
                );
                $stmt->execute(['estado' => $nuevoEstadoId, 'id' => $reporteId]);

                $stmt = $this->db->prepare(
                    "UPDATE asignaciones SET activa = 0 WHERE id = :id"
                );
                $stmt->execute(['id' => (int)$assignment['id']]);
            } else {
                $stmt = $this->db->prepare(
                    "UPDATE reportes
                     SET estado_id = :estado, fecha_resolucion = NULL
                     WHERE id = :id"
                );
                $stmt->execute(['estado' => $nuevoEstadoId, 'id' => $reporteId]);
            }

            $this->addHistory(
                $reporteId,
                $brigadistaId,
                (int)$assignment['estado_id'],
                $nuevoEstadoId,
                $tipoAccion . ': ' . $descripcion
            );

            $this->db->commit();
            return $assignment;
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function actions(int $reporteId): array
    {
        $sql = "
            SELECT ac.*, u.nombre AS brigadista, e.nombre AS estado_resultado
            FROM acciones_campo ac
            JOIN asignaciones a ON a.id = ac.asignacion_id
            JOIN usuarios u ON u.id = a.brigadista_id
            LEFT JOIN estados_reporte e ON e.id = ac.estado_resultado_id
            WHERE a.reporte_id = :reporte
            ORDER BY ac.fecha DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['reporte' => $reporteId]);
        return $stmt->fetchAll();
    }

    public function history(int $reporteId): array
    {
        $sql = "
            SELECT h.*, u.nombre AS usuario,
                   ea.nombre AS estado_anterior,
                   en.nombre AS estado_nuevo
            FROM historial_reportes h
            LEFT JOIN usuarios u ON u.id = h.usuario_id
            LEFT JOIN estados_reporte ea ON ea.id = h.estado_anterior_id
            LEFT JOIN estados_reporte en ON en.id = h.estado_nuevo_id
            WHERE h.reporte_id = :reporte
            ORDER BY h.fecha DESC, h.id DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['reporte' => $reporteId]);
        return $stmt->fetchAll();
    }

    private function addHistory(
        int $reporteId,
        ?int $usuarioId,
        ?int $estadoAnteriorId,
        ?int $estadoNuevoId,
        string $detalle
    ): void {
        $stmt = $this->db->prepare(
            "INSERT INTO historial_reportes(
                reporte_id,
                usuario_id,
                estado_anterior_id,
                estado_nuevo_id,
                detalle,
                fecha
             ) VALUES(
                :reporte,
                :usuario,
                :anterior,
                :nuevo,
                :detalle,
                NOW()
             )"
        );

        $stmt->execute([
            'reporte' => $reporteId,
            'usuario' => $usuarioId,
            'anterior' => $estadoAnteriorId,
            'nuevo' => $estadoNuevoId,
            'detalle' => $detalle,
        ]);
    }
}
