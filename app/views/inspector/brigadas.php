<section class="page-hero mvc-hero">
  <div>
    <span class="tag">Inspector · Brigadas</span>
    <h1>Gestión de brigadas</h1>
    <p>Consulta de disponibilidad, carga de trabajo y casos activos de cada brigadista.</p>
  </div>
</section>

<section class="stats-grid mvc-section-space">
  <div class="stat-card"><small>Brigadistas activos</small><strong><?= count($brigadistas) ?></strong></div>
  <div class="stat-card"><small>Disponibles</small><strong><?= count(array_filter($brigadistas, fn($b) => (int)$b['disponible'] === 1)) ?></strong></div>
  <div class="stat-card"><small>Casos activos</small><strong><?= array_sum(array_map(fn($b) => (int)$b['casos_activos'], $brigadistas)) ?></strong></div>
</section>

<section class="card panel-card mvc-section-space">
  <div class="section-title compact-title">
    <div>
      <span class="eyebrow">Personal operativo</span>
      <h2>Brigadistas</h2>
    </div>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr><th>Brigadista</th><th>Zona</th><th>Disponibilidad</th><th>Casos activos</th><th>Acción</th></tr>
      </thead>
      <tbody>
      <?php foreach ($brigadistas as $b): ?>
        <tr>
          <td><strong><?= e($b['nombre']) ?></strong><br><small><?= e($b['email']) ?></small></td>
          <td><?= e($b['zona'] ?? 'Sin zona') ?></td>
          <td><span class="badge <?= (int)$b['disponible'] === 1 ? 'activo' : 'inactivo' ?>"><?= (int)$b['disponible'] === 1 ? 'Disponible' : 'No disponible' ?></span></td>
          <td><span class="badge asignado"><?= (int)$b['casos_activos'] ?></span></td>
          <td><a class="btn small-btn" href="<?= url('inspector', 'brigadas', ['brigadista_id' => (int)$b['id']]) ?>">Ver casos</a></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</section>

<?php if ($brigadista): ?>
<section class="card panel-card mvc-section-space">
  <div class="section-title compact-title">
    <div>
      <span class="eyebrow">Carga de trabajo</span>
      <h2><?= e($brigadista['nombre']) ?></h2>
      <p><?= e($brigadista['zona'] ?? 'Sin zona') ?> · <?= (int)$brigadista['disponible'] === 1 ? 'Disponible' : 'No disponible' ?></p>
    </div>
  </div>

  <div class="table-wrap">
    <table>
      <thead><tr><th>Caso</th><th>Zona</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Asignado</th><th>Acción</th></tr></thead>
      <tbody>
      <?php if (!$casosAsignados): ?>
        <tr><td colspan="7">Este brigadista no tiene casos activos.</td></tr>
      <?php endif; ?>
      <?php foreach ($casosAsignados as $c): ?>
        <tr>
          <td><strong><?= e($c['codigo']) ?></strong></td>
          <td><?= e($c['zona']) ?></td>
          <td><?= e($c['tipo']) ?></td>
          <td><span class="badge <?= e(normalizar_estado($c['prioridad'])) ?>"><?= e($c['prioridad']) ?></span></td>
          <td><span class="badge <?= e(normalizar_estado($c['estado'])) ?>"><?= e($c['estado']) ?></span></td>
          <td><?= e($c['fecha_asignacion']) ?></td>
          <td><a class="btn small-btn" href="<?= url('inspector', 'detalle', ['reporte_id' => (int)$c['id']]) ?>">Gestionar</a></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</section>

<section class="card panel-card mvc-section-space">
  <span class="eyebrow">Reasignación</span>
  <h2>Reasignar un caso</h2>
  <form method="post" action="<?= url('inspector', 'reasignar') ?>" class="dashboard-grid">
    <?= csrf_field() ?>
    <input type="hidden" name="brigadista_anterior" value="<?= (int)$brigadista['id'] ?>">
    <div>
      <div class="field" style="margin-bottom:14px;">
        <label for="reporte_id">Caso activo</label>
        <select id="reporte_id" name="reporte_id" required>
          <option value="">Seleccione...</option>
          <?php foreach ($casosAsignados as $c): ?>
            <option value="<?= (int)$c['id'] ?>"><?= e($c['codigo']) ?> · <?= e($c['prioridad']) ?> · <?= e($c['zona']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="field">
        <label for="nuevo_brigadista">Nuevo brigadista</label>
        <select id="nuevo_brigadista" name="brigadista_id" required>
          <option value="">Seleccione...</option>
          <?php foreach ($brigadistas as $b): ?>
            <?php if ((int)$b['id'] !== (int)$brigadista['id']): ?>
              <option value="<?= (int)$b['id'] ?>">
                <?= e($b['nombre']) ?> · <?= e($b['zona'] ?? 'Sin zona') ?> · <?= (int)$b['casos_activos'] ?> casos
              </option>
            <?php endif; ?>
          <?php endforeach; ?>
        </select>
      </div>
    </div>
    <div>
      <div class="field" style="margin-bottom:14px;">
        <label for="reasignar_prioridad">Prioridad</label>
        <select id="reasignar_prioridad" name="prioridad">
          <option value="Alta">Alta</option>
          <option value="Media" selected>Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>
      <div class="field" style="margin-bottom:14px;">
        <label for="motivo_reasignacion">Motivo</label>
        <textarea id="motivo_reasignacion" name="motivo" minlength="5" required placeholder="Explique el motivo de la reasignación."></textarea>
      </div>
      <button class="btn" type="submit">Reasignar caso</button>
    </div>
  </form>
</section>
<?php endif; ?>
