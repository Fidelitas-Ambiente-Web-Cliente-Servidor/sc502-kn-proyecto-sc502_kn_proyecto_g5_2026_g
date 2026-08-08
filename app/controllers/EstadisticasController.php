<?php

class EstadisticasController extends Controller
{
    private StatisticsModel $stats;
    private CatalogModel $catalogs;

    public function __construct()
    {
        $db = Database::getConnection();
        $this->stats = new StatisticsModel($db);
        $this->catalogs = new CatalogModel($db);
    }

    public function index(): void
    {
        Auth::requireRole('administrador');

        $filters = [
            'zona_id' => (int)($_GET['zona_id'] ?? 0),
            'month' => trim($_GET['month'] ?? ''),
        ];

        $this->render('admin/estadisticas', [
            'pageTitle' => 'Estadísticas',
            'summary' => $this->stats->summary($filters),
            'byType' => $this->stats->byType($filters),
            'byStatus' => $this->stats->byStatus($filters),
            'byMonth' => $this->stats->byMonth($filters),
            'byZone' => $this->stats->byZone($filters),
            'zonas' => $this->catalogs->zonas(),
            'filters' => $filters,
        ]);
    }

    public function exportarCsv(): void
    {
        Auth::requireRole('administrador');

        $filters = [
            'zona_id' => (int)($_GET['zona_id'] ?? 0),
            'month' => trim($_GET['month'] ?? ''),
        ];

        $rows = $this->stats->rowsForExport($filters);

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="dengue_reporte_estadisticas.csv"');

        $out = fopen('php://output', 'w');
        fwrite($out, "\xEF\xBB\xBF");

        if ($rows) {
            fputcsv($out, array_keys($rows[0]));
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
        }

        fclose($out);
        exit;
    }
}
