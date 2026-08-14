<?php

class CatalogModel
{
    public function __construct(private PDO $db) {}

    public function zonas(): array
    {
        return $this->db->query(
            "SELECT z.id, z.nombre, z.descripcion, z.latitud_centro, z.longitud_centro,
                    m.nombre AS municipalidad
             FROM zonas z
             LEFT JOIN municipalidades m ON m.id = z.municipalidad_id
             ORDER BY z.nombre"
        )->fetchAll();
    }

    public function tiposFoco(): array
    {
        return $this->db->query(
            "SELECT id, nombre FROM tipos_foco ORDER BY nombre"
        )->fetchAll();
    }
}
