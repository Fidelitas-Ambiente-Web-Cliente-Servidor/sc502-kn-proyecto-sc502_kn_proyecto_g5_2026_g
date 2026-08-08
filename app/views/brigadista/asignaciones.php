<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">

<section class="page-hero mvc-hero">
  <div>
    <span class="tag">Brigadista</span>
    <h1>Mis asignaciones</h1>
    <p>Casos activos asignados al usuario autenticado, ordenados por prioridad.</p>
  </div>
</section>

<section class="mvc-two-col">
  <div class="card panel-card">
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Caso</th><th>Zona</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Acción</th></tr>
        </thead>
        <tbody>
          <?php if (!$casos): ?>
            <tr><td colspan="6">No tiene casos activos.</td></tr>
          <?php endif; ?>
          <?php foreach ($casos as $c): ?>
            <tr data-lat="<?= e($c['latitud']) ?>" data-lng="<?= e($c['longitud']) ?>" data-codigo="<?= e($c['codigo']) ?>" data-tipo="<?= e($c['tipo']) ?>">
              <td><strong><?= e($c['codigo']) ?></strong><br><small><?= e($c['ciudadano']) ?></small></td>
              <td><?= e($c['zona']) ?></td>
              <td><?= e($c['tipo']) ?></td>
              <td><span class="badge <?= e(normalizar_estado($c['prioridad'])) ?>"><?= e($c['prioridad']) ?></span></td>
              <td><span class="badge <?= e(normalizar_estado($c['estado'])) ?>"><?= e($c['estado']) ?></span></td>
              <td class="mvc-actions-cell">
                <a class="btn small-btn" href="<?= url('brigadista', 'accion', ['reporte_id' => (int)$c['id']]) ?>">Registrar acción</a>
                <button class="btn secondary small-btn js-map" type="button">Ver mapa</button>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>

  <div class="card panel-card">
    <h2>Ubicación del caso</h2>
    <div id="mapaAsignaciones" class="mvc-map"></div>
    <p id="mapInfo" class="muted">Seleccione “Ver mapa” en un caso.</p>
  </div>
</section>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('mapaAsignaciones').setView([9.935, -84.05], 12);
  let marker;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  document.querySelectorAll('.js-map').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      const lat = Number(row.dataset.lat);
      const lng = Number(row.dataset.lng);
      map.setView([lat, lng], 15);
      if (marker) marker.remove();
      marker = L.marker([lat, lng]).addTo(map)
        .bindPopup(`<strong>${row.dataset.codigo}</strong><br>${row.dataset.tipo}`)
        .openPopup();
      document.getElementById('mapInfo').textContent = row.dataset.codigo + ' · ' + row.dataset.tipo;
    });
  });
});
</script>
