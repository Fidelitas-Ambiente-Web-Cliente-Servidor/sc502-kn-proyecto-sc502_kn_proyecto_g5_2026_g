<section class="page-hero mvc-hero">
  <div>
    <span class="tag">Seguimiento de campo</span>
    <h1><?= e($caso['codigo']) ?></h1>
    <p><?= e($caso['tipo']) ?> · <?= e($caso['zona']) ?> · <?= e($caso['prioridad']) ?></p>
  </div>
  <a class="btn btn-glow" href="<?= url('brigadista', 'asignaciones') ?>">Volver</a>
</section>

<section class="mvc-two-col">
  <form method="post" enctype="multipart/form-data" class="card panel-card stack">
    <?= csrf_field() ?>
    <input type="hidden" name="reporte_id" value="<?= (int)$caso['reporte_id'] ?>">

    <div class="field">
      <label>Tipo de acción</label>
      <select name="tipo_accion" required>
        <option value="Visita">Visita</option>
        <option value="Fumigación">Fumigación</option>
        <option value="Resolución">Resolución</option>
      </select>
    </div>

    <div class="field">
      <label>Estado resultante</label>
      <select name="estado_resultado" required>
        <option value="En atención">En atención</option>
        <option value="Resuelto">Resuelto</option>
      </select>
    </div>

    <div class="field">
      <label>Descripción</label>
      <textarea name="descripcion" required minlength="10" placeholder="Acciones realizadas, hallazgos y recomendaciones."></textarea>
    </div>

    <div class="field">
      <label>Evidencia fotográfica</label>
      <input type="file" name="evidencia" accept="image/jpeg,image/png,image/webp">
    </div>

    <button class="btn" type="submit">Guardar acción</button>
  </form>

  <div class="card panel-card">
    <h2>Detalle del caso</h2>
    <p><?= e($caso['descripcion']) ?></p>
    <div class="detail-list">
      <div><strong>Estado</strong><br><?= e($caso['estado']) ?></div>
      <div><strong>Prioridad</strong><br><?= e($caso['prioridad']) ?></div>
      <div><strong>Latitud</strong><br><?= e($caso['latitud']) ?></div>
      <div><strong>Longitud</strong><br><?= e($caso['longitud']) ?></div>
    </div>
  </div>
</section>

<section class="card panel-card mvc-section-space">
  <div class="section-title">
    <div><span class="eyebrow">Historial de campo</span><h2>Acciones registradas</h2></div>
  </div>

  <div class="timeline-grid">
    <?php if (!$acciones): ?><p>Aún no hay acciones previas.</p><?php endif; ?>
    <?php foreach ($acciones as $a): ?>
      <article class="timeline-card">
        <h3><?= e($a['tipo_accion']) ?></h3>
        <p><?= e($a['descripcion']) ?></p>
        <small><?= e($a['brigadista']) ?> · <?= e($a['fecha']) ?> · <?= e($a['estado_resultado'] ?? '') ?></small>
        <?php if ($a['imagen_evidencia']): ?>
          <p><a href="<?= e($a['imagen_evidencia']) ?>" target="_blank">Ver evidencia</a></p>
        <?php endif; ?>
      </article>
    <?php endforeach; ?>
  </div>
</section>
