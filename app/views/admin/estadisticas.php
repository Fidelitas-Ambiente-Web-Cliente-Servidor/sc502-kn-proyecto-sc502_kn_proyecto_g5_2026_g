<section class="page-hero mvc-hero">
  <div>
    <span class="tag">Administrador</span>
    <h1>Panel de estadísticas</h1>
    <p>Indicadores por estado, zona, mes y tipo de foco consultados desde MySQL.</p>
  </div>
  <a class="btn btn-glow" href="<?= url('estadisticas', 'exportarCsv', ['zona_id' => $filters['zona_id'], 'month' => $filters['month']]) ?>">Exportar CSV</a>
</section>

<section class="card panel-card">
  <form method="get" class="tool-strip">
    <input type="hidden" name="controller" value="estadisticas">
    <input type="hidden" name="action" value="index">
    <div class="filters">
      <div class="field compact-field">
        <label>Zona</label>
        <select name="zona_id">
          <option value="0">Todas</option>
          <?php foreach ($zonas as $z): ?>
            <option value="<?= (int)$z['id'] ?>" <?= $filters['zona_id'] == $z['id'] ? 'selected' : '' ?>><?= e($z['nombre']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="field compact-field">
        <label>Mes</label>
        <input type="month" name="month" value="<?= e($filters['month']) ?>">
      </div>
    </div>
    <button class="btn">Aplicar</button>
  </form>
</section>

<section class="stats-grid mvc-section-space">
  <div class="stat-card"><small>Total</small><strong><?= (int)($summary['total'] ?? 0) ?></strong></div>
  <div class="stat-card"><small>Pendientes</small><strong><?= (int)($summary['pendientes'] ?? 0) ?></strong></div>
  <div class="stat-card"><small>En proceso</small><strong><?= (int)($summary['en_proceso'] ?? 0) ?></strong></div>
  <div class="stat-card"><small>Resueltos</small><strong><?= (int)($summary['resueltos'] ?? 0) ?></strong></div>
  <div class="stat-card"><small>Promedio resolución</small><strong><?= e((string)($summary['promedio_horas'] ?? 0)) ?> h</strong></div>
</section>

<section class="chart-grid mvc-section-space">
  <article class="chart-card"><canvas id="chartTipo"></canvas></article>
  <article class="chart-card"><canvas id="chartEstado"></canvas></article>
  <article class="chart-card"><canvas id="chartMes"></canvas></article>
</section>

<section class="card panel-card mvc-section-space">
  <h2>Ranking por zona</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Zona</th><th>Reportes</th></tr></thead>
      <tbody>
        <?php foreach ($byZone as $r): ?>
          <tr><td><?= e($r['etiqueta']) ?></td><td><?= (int)$r['total'] ?></td></tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</section>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
  const crearGrafico = (id, tipo, titulo, datos) => {
    new Chart(document.getElementById(id), {
      type: tipo,
      data: {
        labels: datos.map(item => item.etiqueta),
        datasets: [{ label: titulo, data: datos.map(item => Number(item.total)) }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  };

  crearGrafico('chartTipo', 'bar', 'Casos por tipo', <?= json_encode($byType, JSON_UNESCAPED_UNICODE) ?>);
  crearGrafico('chartEstado', 'doughnut', 'Casos por estado', <?= json_encode($byStatus, JSON_UNESCAPED_UNICODE) ?>);
  crearGrafico('chartMes', 'line', 'Casos por mes', <?= json_encode($byMonth, JSON_UNESCAPED_UNICODE) ?>);
});
</script>
