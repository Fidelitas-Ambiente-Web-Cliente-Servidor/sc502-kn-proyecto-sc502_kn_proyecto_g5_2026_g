<section class="page-hero mvc-hero">
  <div>
    <span class="tag">Ciudadano</span>
    <h1>Mis reportes</h1>
    <p>Consulte el estado de los focos de riesgo que ha reportado y dé seguimiento a cada caso.</p>
  </div>
  <a class="btn btn-glow" href="<?= url('ciudadano', 'nuevoReporte') ?>">Nuevo reporte</a>
</section>

<section class="stats-grid mvc-section-space">
  <div class="stat-card"><small>Total de reportes</small><strong><?= (int)$resumen['total'] ?></strong></div>
  <div class="stat-card"><small>Pendientes</small><strong><?= (int)$resumen['pendientes'] ?></strong></div>
  <div class="stat-card"><small>En proceso</small><strong><?= (int)$resumen['en_proceso'] ?></strong></div>
  <div class="stat-card"><small>Resueltos</small><strong><?= (int)$resumen['resueltos'] ?></strong></div>
</section>

<section class="card panel-card">
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Caso</th>
          <th>Tipo</th>
          <th>Zona</th>
          <th>Prioridad</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
        <?php if (!$reportes): ?>
          <tr><td colspan="7">Aún no ha enviado reportes.</td></tr>
        <?php endif; ?>
        <?php foreach ($reportes as $r): ?>
          <tr>
            <td><strong><?= e($r['codigo']) ?></strong></td>
            <td><span class="badge <?= e(normalizar_estado($r['tipo'])) ?>"><?= e($r['tipo']) ?></span></td>
            <td><?= e($r['zona']) ?></td>
            <td><span class="badge <?= e(normalizar_estado($r['prioridad'])) ?>"><?= e($r['prioridad']) ?></span></td>
            <td><span class="badge <?= e(normalizar_estado($r['estado'])) ?>"><?= e($r['estado']) ?></span></td>
            <td><?= e($r['fecha_creacion']) ?></td>
            <td><?= e($r['descripcion']) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</section>