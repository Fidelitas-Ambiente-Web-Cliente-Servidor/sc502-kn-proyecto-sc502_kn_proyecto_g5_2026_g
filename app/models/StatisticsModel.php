<?php

class StatisticsModel
{
    public function __construct(private PDO $db) {}

    private function filterClause(array $filters, array &$params): string
    {
        $where = [];

        if (!empty($filters['zona_id'])) {
            $where[] = 'r.zona_id = :zona';
            $params['zona'] = (int)$filters['zona_id'];
        }

        if (!empty($filters['month'])) {
            $where[] = "DATE_FORMAT(r.fecha_creacion, '%Y-%m') = :month";
            $params['month'] = $filters['month'];
        }

        return $where ? ' WHERE ' . implode(' AND ', $where) : '';
    }

    public function summary(array $filters = []): array
    {
        $params = [];
        $where = $this->filterClause($filters, $params);

        $sql = "
            SELECT
                COUNT(*) total,
                SUM(e.nombre = 'Pendiente') pendientes,
                SUM(e.nombre IN('Asignado','En atención')) en_proceso,
                SUM(e.nombre = 'Resuelto') resueltos,
                ROUND(
                    AVG(
                        CASE
                            WHEN r.fecha_resolucion IS NOT NULL
                            THEN TIMESTAMPDIFF(HOUR, r.fecha_creacion, r.fecha_resolucion)
                        END
                    ),
                    1
                ) promedio_horas
            FROM reportes r
            JOIN estados_reporte e ON e.id = r.estado_id
            {$where}
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch() ?: [];
    }

    private function grouped(string $fieldSelect, string $join, array $filters = []): array
    {
        $params = [];
        $where = $this->filterClause($filters, $params);

        $sql = "
            SELECT {$fieldSelect} etiqueta, COUNT(*) total
            FROM reportes r
            {$join}
            {$where}
            GROUP BY etiqueta
            ORDER BY total DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function byType(array $filters = []): array
    {
        return $this->grouped(
            't.nombre',
            'JOIN tipos_foco t ON t.id = r.tipo_foco_id',
            $filters
        );
    }

    public function byStatus(array $filters = []): array
    {
        return $this->grouped(
            'e.nombre',
            'JOIN estados_reporte e ON e.id = r.estado_id',
            $filters
        );
    }

    public function byZone(array $filters = []): array
    {
        return $this->grouped(
            'z.nombre',
            'JOIN zonas z ON z.id = r.zona_id',
            $filters
        );
    }

    public function byMonth(array $filters = []): array
    {
        $params = [];
        $where = $this->filterClause($filters, $params);

        $sql = "
            SELECT DATE_FORMAT(r.fecha_creacion, '%Y-%m') etiqueta, COUNT(*) total
            FROM reportes r
            {$where}
            GROUP BY etiqueta
            ORDER BY etiqueta
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function rowsForExport(array $filters = []): array
    {
        $params = [];
        $where = $this->filterClause($filters, $params);

        $sql = "
            SELECT
                r.codigo,
                u.nombre ciudadano,
                z.nombre zona,
                t.nombre tipo,
                e.nombre estado,
                r.prioridad,
                r.validado,
                r.fecha_creacion,
                r.fecha_resolucion,
                r.descripcion
            FROM reportes r
            JOIN usuarios u ON u.id = r.usuario_id
            JOIN zonas z ON z.id = r.zona_id
            JOIN tipos_foco t ON t.id = r.tipo_foco_id
            JOIN estados_reporte e ON e.id = r.estado_id
            {$where}
            ORDER BY r.fecha_creacion DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
