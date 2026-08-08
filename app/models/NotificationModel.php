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
}
