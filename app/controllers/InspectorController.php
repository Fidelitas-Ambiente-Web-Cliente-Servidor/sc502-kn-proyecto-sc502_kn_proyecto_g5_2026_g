<?php

class InspectorController extends Controller
{
    private ZonaModel $zonas;
    private CatalogModel $catalogs;

    public function __construct()
    {
        $db = Database::getConnection();
        $this->zonas = new ZonaModel($db);
        $this->catalogs = new CatalogModel($db);
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