<section class="page-hero mvc-hero">
  <div>
    <span class="tag">Inspector · Casos</span>
    <h1>Gestión de casos</h1>
    <p>Validación, priorización y asignación de los reportes recibidos.</p>
  </div>
</section>

<section class="card panel-card mvc-section-space">
  <form method="get" class="tool-strip">
    <input type="hidden" name="controller" value="inspector">
    <input type="hidden" name="action" value="casos">
    <div class="filters filters-inline" style="width:100%; justify-content:flex-start;">
      <div class="field compact-field" style="min-width:260px;">
        <label for="search">Buscar</label>
        <input id="search" name="search" value="<?= e($filters['search']) ?>" placeholder="Código, ciudadano o descripción">
      </div>
      <div class="field compact-field">
        <label for="estado_id">Estado</label>
        <select id="estado_id" name="estado_id">
          <option value="0">Todos</option>
          <?php foreach ([1 => 'Pendiente', 2 => 'Asignado', 3 => 'En atención', 4 => 'Resuelto', 5 => 'Rechazado'] as $id => $nombre): ?>
            <option value="<?= $id ?>" <?= $filters['estado_id'] === $id ? 'selected' : '' ?>><?= e($nombre) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="field compact-field">
        <label for="prioridad">Prioridad</label>
        <select id="prioridad" name="prioridad">
          <option value="">Todas</option>
          <?php foreach (['Alta', 'Media', 'Baja'] as $p): ?>
            <option value="<?= e($p) ?>" <?= $filters['prioridad'] === $p ? 'selected' : '' ?>><?= e($p) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <button class="btn" type="submit">Filtrar</button>
      <a class="btn secondary" href="<?= url('inspector', 'casos') ?>">Limpiar</a>
    </div>
  </form>
</section>

<section class="card panel-card mvc-section-space">
  <div class="section-title compact-title">
    <div>
      <span class="eyebrow">Reportes recibidos</span>
      <h2>Casos</h2>
    </div>
    <span class="badge asignado"><?= count($casos) ?> encontrados</span>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Caso</th>
          <th>Ciudadano</th>
          <th>Zona</th>
          <th>Tipo</th>
          <th>Prioridad</th>
          <th>Estado</th>
          <th>Brigadista</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
      <?php if (!$casos): ?>
        <tr><td colspan="8">No hay casos que coincidan con los filtros.</td></tr>
      <?php endif; ?>
      <?php foreach ($casos as $c): ?>
        <tr>
          <td><strong><?= e($c['codigo']) ?></strong><br><small><?= e($c['fecha_creacion']) ?></small></td>
          <td><?= e($c['ciudadano']) ?></td>
          <td><?= e($c['zona']) ?></td>
          <td><?= e($c['tipo']) ?></td>
          <td><span class="badge <?= e(normalizar_estado($c['prioridad'])) ?>"><?= e($c['prioridad']) ?></span></td>
          <td><span class="badge <?= e(normalizar_estado($c['estado'])) ?>"><?= e($c['estado']) ?></span></td>
          <td><?= e($c['brigadista'] ?? 'Sin asignar') ?></td>
          <td class="mvc-actions-cell">
            <a class="btn small-btn" href="<?= url('inspector', 'detalle', ['reporte_id' => (int)$c['id']]) ?>">Ver detalle</a>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</section>

<?php if ($caso): ?>
<section class="mvc-two-col mvc-section-space">
  <div class="card panel-card">
    <span class="eyebrow">Detalle del reporte</span>
    <h2><?= e($caso['codigo']) ?></h2>
    <p class="muted"><?= e($caso['descripcion']) ?></p>

    <div class="detail-list">
      <div><strong>Ciudadano</strong><span><?= e($caso['ciudadano']) ?></span></div>
      <div><strong>Correo</strong><span><?= e($caso['ciudadano_email']) ?></span></div>
      <div><strong>Zona</strong><span><?= e($caso['zona']) ?></span></div>
      <div><strong>Tipo</strong><span><?= e($caso['tipo']) ?></span></div>
      <div><strong>Estado</strong><span class="badge <?= e(normalizar_estado($caso['estado'])) ?>"><?= e($caso['estado']) ?></span></div>
      <div><strong>Brigadista actual</strong><span><?= e($caso['brigadista'] ?? 'Sin asignar') ?></span></div>
      <div><strong>Fecha</strong><span><?= e($caso['fecha_creacion']) ?></span></div>
    </div>

    <div style="margin-top:18px;">
      <h3>Actualizar prioridad</h3>
      <form method="post" action="<?= url('inspector', 'prioridad') ?>" class="filters" style="align-items:end;">
        <?= csrf_field() ?>
        <input type="hidden" name="reporte_id" value="<?= (int)$caso['id'] ?>">
        <div class="field compact-field">
          <label for="detalle_prioridad">Prioridad</label>
          <select id="detalle_prioridad" name="prioridad">
            <?php foreach (['Alta', 'Media', 'Baja'] as $p): ?>
              <option value="<?= e($p) ?>" <?= $caso['prioridad'] === $p ? 'selected' : '' ?>><?= e($p) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <button class="btn secondary" type="submit">Guardar prioridad</button>
      </form>
    </div>
  </div>

  <div class="card panel-card">
    <span class="eyebrow">Acciones del inspector</span>
    <h2>Validar y asignar</h2>
    <form method="post" action="<?= url('inspector', 'asignar') ?>">
      <?= csrf_field() ?>
      <input type="hidden" name="reporte_id" value="<?= (int)$caso['id'] ?>">
      <div class="field" style="margin-bottom:14px;">
        <label for="brigadista_id">Brigadista</label>
        <select id="brigadista_id" name="brigadista_id" required>
          <option value="">Seleccione...</option>
          <?php foreach ($brigadistas as $b): ?>
            <option value="<?= (int)$b['id'] ?>" <?= (int)$caso['brigadista_id'] === (int)$b['id'] ? 'selected' : '' ?>>
              <?= e($b['nombre']) ?> · <?= e($b['zona'] ?? 'Sin zona') ?> · <?= (int)$b['casos_activos'] ?> casos
            </option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="field" style="margin-bottom:14px;">
        <label for="asignar_prioridad">Prioridad</label>
        <select id="asignar_prioridad" name="prioridad">
          <?php foreach (['Alta', 'Media', 'Baja'] as $p): ?>
            <option value="<?= e($p) ?>" <?= $caso['prioridad'] === $p ? 'selected' : '' ?>><?= e($p) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <button class="btn" type="submit">Validar y asignar caso</button>
    </form>

    <?php if ($caso['estado'] !== 'Rechazado' && $caso['estado'] !== 'Resuelto'): ?>
      <hr style="margin:24px 0; border:0; border-top:1px solid var(--linea);">
      <h3>Rechazar caso</h3>
      <form method="post" action="<?= url('inspector', 'rechazar') ?>">
        <?= csrf_field() ?>
        <input type="hidden" name="reporte_id" value="<?= (int)$caso['id'] ?>">
        <div class="field" style="margin-bottom:14px;">
          <label for="motivo">Motivo</label>
          <textarea id="motivo" name="motivo" minlength="5" required placeholder="Explique por qué se rechaza el reporte."></textarea>
        </div>
        <button class="btn secondary" type="submit">Rechazar caso</button>
      </form>
    <?php endif; ?>
  </div>
</section>

<section class="card panel-card mvc-section-space">
  <span class="eyebrow">Ubicación</span>
  <h2>Mapa del caso</h2>
  <div id="mapaCaso" class="mvc-map" data-lat="<?= e($caso['latitud']) ?>" data-lng="<?= e($caso['longitud']) ?>"></div>
</section>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('mapaCaso');
  if (!el) return;
  const lat = Number(el.dataset.lat);
  const lng = Number(el.dataset.lng);
  const map = L.map(el).setView([lat, lng], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
  L.marker([lat, lng]).addTo(map).bindPopup('<strong><?= e($caso['codigo']) ?></strong><br><?= e($caso['zona']) ?>').openPopup();
});
</script>
<?php endif; ?>
