<section class="page-hero mvc-hero">
  <div>
    <span class="tag">Ciudadano</span>
    <h1>Notificaciones</h1>
    <p>Manténgase informado sobre los cambios de estado de sus reportes.</p>
  </div>
  <form method="post">
    <?= csrf_field() ?>
    <button class="btn btn-glow" type="submit" name="marcar_todas" value="1">Marcar todas como leídas</button>
  </form>
</section>

<section class="stats-grid mvc-section-space">
  <div class="stat-card"><small>Total de avisos</small><strong><?= (int)$resumen['total'] ?></strong></div>
  <div class="stat-card"><small>No leídas</small><strong><?= (int)$resumen['no_leidas'] ?></strong></div>
  <div class="stat-card"><small>Leídas</small><strong><?= (int)$resumen['leidas'] ?></strong></div>
</section>

<section class="card panel-card">
  <div class="notif-list">
    <?php if (!$notificaciones): ?>
      <div class="empty-state">No tiene notificaciones por el momento.</div>
    <?php endif; ?>
    <?php foreach ($notificaciones as $n): ?>
      <article class="notif-card <?= $n['leida'] ? 'read' : 'unread' ?>">
        <div class="notif-head">
          <span class="badge <?= $n['leida'] ? 'resuelto' : 'pendiente' ?>"><?= $n['leida'] ? 'Leída' : 'No leída' ?></span>
          <span class="notif-fecha"><?= e($n['fecha']) ?></span>
        </div>
        <p><?= e($n['mensaje']) ?></p>
        <?php if ($n['codigo']): ?>
          <small>Reporte relacionado: <strong><?= e($n['codigo']) ?></strong></small>
        <?php endif; ?>
        <?php if (!$n['leida']): ?>
          <form method="post">
            <?= csrf_field() ?>
            <input type="hidden" name="notificacion_id" value="<?= (int)$n['id'] ?>">
            <button class="btn small-btn secondary" type="submit">Marcar como leída</button>
          </form>
        <?php endif; ?>
      </article>
    <?php endforeach; ?>
  </div>
</section>