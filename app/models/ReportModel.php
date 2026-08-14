<?php

class ReportModel
{
    public function __construct(private PDO $db) {}

    public function myReports(int $usuarioId): array
    {
        $sql = "
            SELECT
                r.id,
                r.codigo,
                r.descripcion,
                r.prioridad,
                r.fecha_creacion,
                z.nombre AS zona,
                t.nombre AS tipo,
                e.nombre AS estado
            FROM reportes r
            JOIN zonas z ON z.id = r.zona_id
            JOIN tipos_foco t ON t.id = r.tipo_foco_id
            JOIN estados_reporte e ON e.id = r.estado_id
            WHERE r.usuario_id = :usuario
            ORDER BY r.fecha_creacion DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['usuario' => $usuarioId]);
        return $stmt->fetchAll();
    }

    public function create(
        int $usuarioId,
        int $zonaId,
        float $latitud,
        float $longitud,
        string $descripcion,
        int $tipoFocoId
    ): array {
        $estadoId = $this->estadoPendienteId();
        $codigo = $this->generarCodigo();

        $stmt = $this->db->prepare(
            "INSERT INTO reportes(
                codigo, usuario_id, zona_id, latitud, longitud,
                descripcion, tipo_foco_id, estado_id, prioridad, validado, fecha_creacion
             ) VALUES(
                :codigo, :usuario, :zona, :lat, :lng,
                :descripcion, :tipo, :estado, 'Media', 0, NOW()
             )"
        );

        $stmt->execute([
            'codigo' => $codigo,
            'usuario' => $usuarioId,
            'zona' => $zonaId,
            'lat' => $latitud,
            'lng' => $longitud,
            'descripcion' => $descripcion,
            'tipo' => $tipoFocoId,
            'estado' => $estadoId,
        ]);

        return [
            'id' => (int)$this->db->lastInsertId(),
            'codigo' => $codigo,
        ];
    }

    private function estadoPendienteId(): int
    {
        $stmt = $this->db->prepare("SELECT id FROM estados_reporte WHERE nombre = 'Pendiente' LIMIT 1");
        $stmt->execute();
        $id = $stmt->fetchColumn();

        if (!$id) {
            throw new RuntimeException('Estado "Pendiente" no configurado.');
        }

        return (int)$id;
    }

    private function generarCodigo(): string
    {
        $total = (int)$this->db->query("SELECT COUNT(*) FROM reportes")->fetchColumn();
        return 'REP-2026-' . str_pad((string)($total + 1), 5, '0', STR_PAD_LEFT);
    }
}