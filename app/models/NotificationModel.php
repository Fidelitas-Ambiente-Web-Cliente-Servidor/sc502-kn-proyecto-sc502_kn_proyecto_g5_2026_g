<?php

class NotificationModel
{
    public function __construct(private PDO $db) {}

    public function create(int $usuarioId, ?int $reporteId, string $mensaje): void
    {
        $stmt = $this->db->prepare(
            "INSERT INTO notificaciones(usuario_id,reporte_id,mensaje,leida,fecha)
             VALUES(:usuario,:reporte,:mensaje,0,NOW())"
        );

        $stmt->execute([
            'usuario' => $usuarioId,
            'reporte' => $reporteId,
            'mensaje' => $mensaje,
        ]);
    }

    public function forUser(int $usuarioId): array
    {
        $sql = "
            SELECT n.id, n.reporte_id, n.mensaje, n.leida, n.fecha, r.codigo
            FROM notificaciones n
            LEFT JOIN reportes r ON r.id = n.reporte_id
            WHERE n.usuario_id = :usuario
            ORDER BY n.fecha DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['usuario' => $usuarioId]);
        return $stmt->fetchAll();
    }

    public function markRead(int $id, int $usuarioId): void
    {
        $stmt = $this->db->prepare(
            "UPDATE notificaciones SET leida = 1 WHERE id = :id AND usuario_id = :usuario"
        );
        $stmt->execute(['id' => $id, 'usuario' => $usuarioId]);
    }

    public function markAllRead(int $usuarioId): void
    {
        $stmt = $this->db->prepare(
            "UPDATE notificaciones SET leida = 1 WHERE usuario_id = :usuario"
        );
        $stmt->execute(['usuario' => $usuarioId]);
    }
}