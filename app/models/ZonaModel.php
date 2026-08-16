<?php

class ZonaModel
{
    public function __construct(private PDO $db) {}

    private function filterClause(array $filters, array &$params): string
    {
        $where = [];

        if (!empty($filters['tipo_foco_id'])) {
            $where[] = 'r.tipo_foco_id = :tipo_foco_id';
            $params['tipo_foco_id'] = (int)$filters['tipo_foco_id'];
        }

        if (!empty($filters['estado_id'])) {
            $where[] = 'r.estado_id = :estado_id';
            $params['estado_id'] = (int)$filters['estado_id'];
        }

        if (!empty($filters['month'])) {
            $where[] = "DATE_FORMAT(r.fecha_creacion, '%Y-%m') = :month";
            $params['month'] = $filters['month'];
        }

        return $where ? ' WHERE ' . implode(' AND ', $where) : '';
    }

    /**
     * Reportes filtrados con su zona, tipo, estado y prioridad,
     * usados para los marcadores, el mapa de calor y el detalle lateral.
     */
    public function reportesFiltrados(array $filters = []): array
    {
        $params = [];
        $where = $this->filterClause($filters, $params);

        $sql = "
            SELECT
                r.id, r.codigo, r.latitud, r.longitud, r.descripcion,
                r.prioridad, r.fecha_creacion,
                z.id AS zona_id, z.nombre AS zona,
                t.nombre AS tipo_foco,
                e.nombre AS estado,
                u.nombre AS ciudadano
            FROM reportes r
            JOIN zonas z ON z.id = r.zona_id
            JOIN tipos_foco t ON t.id = r.tipo_foco_id
            JOIN estados_reporte e ON e.id = r.estado_id
            JOIN usuarios u ON u.id = r.usuario_id
            {$where}
            ORDER BY r.fecha_creacion DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Ranking de zonas por cantidad de reportes (para la lista de ranking
     * y para el resumen estadístico por zona).
     */
    public function rankingPorZona(array $filters = []): array
    {
        $params = [];
        $where = $this->filterClause($filters, $params);

        $sql = "
            SELECT
                z.id, z.nombre,
                COUNT(r.id) AS total,
                SUM(e.nombre = 'Pendiente') AS pendientes,
                SUM(e.nombre = 'En atención') AS en_atencion,
                SUM(e.nombre = 'Resuelto') AS resueltos,
                SUM(r.prioridad = 'Alta') AS alta_count,
                SUM(r.prioridad = 'Media') AS media_count,
                SUM(r.prioridad = 'Baja') AS baja_count
            FROM zonas z
            LEFT JOIN reportes r ON r.zona_id = z.id
            LEFT JOIN estados_reporte e ON e.id = r.estado_id
            {$where}
            GROUP BY z.id, z.nombre
            ORDER BY total DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Meses (YYYY-MM) con al menos un reporte, para poblar el filtro de mes.
     */
    public function mesesDisponibles(): array
    {
        return $this->db->query(
            "SELECT DISTINCT DATE_FORMAT(fecha_creacion, '%Y-%m') AS mes
             FROM reportes
             ORDER BY mes DESC"
        )->fetchAll(PDO::FETCH_COLUMN);
    }
}