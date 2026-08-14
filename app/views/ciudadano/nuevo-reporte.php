<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">

<section class="page-hero mvc-hero">
  <div>
    <span class="tag">Ciudadano</span>
    <h1>Reportar foco de riesgo</h1>
    <p>Ubique el foco en el mapa, describa la situación y envíe el reporte para su revisión.</p>
  </div>
  <a class="btn secondary" href="<?= url('ciudadano', 'misReportes') ?>">Volver a mis reportes</a>
</section>

<section class="mvc-two-col">
  <form method="post" class="card panel-card stack" id="formReporte">
    <?= csrf_field() ?>
    <input type="hidden" name="latitud" id="latitud">
    <input type="hidden" name="longitud" id="longitud">

    <div class="field">
      <label>Tipo de foco</label>
      <select name="tipo_foco_id" required>
        <option value="">Seleccione</option>
        <?php foreach ($tiposFoco as $t): ?>
          <option value="<?= (int)$t['id'] ?>"><?= e($t['nombre']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>

    <div class="field">
      <label>Ubicación seleccionada</label>
      <input type="text" id="ubicacionTexto" placeholder="Marque un punto en el mapa" readonly>
    </div>

    <div class="field">
      <label>Descripción del foco de riesgo</label>
      <textarea name="descripcion" required minlength="10" placeholder="Ejemplo: recipiente con agua estancada en el patio trasero de la vivienda."></textarea>
    </div>

    <button class="btn btn-glow" type="submit">Enviar reporte</button>
  </form>

  <div class="card panel-card">
    <h2>Marque el punto exacto</h2>
    <div id="mapaNuevoReporte" class="mvc-map"></div>
    <p class="muted">Haga clic en el mapa para colocar el marcador sobre el foco de riesgo. Puede hacer clic nuevamente para ajustarlo.</p>
  </div>
</section>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
  const mapa = L.map('mapaNuevoReporte').setView([9.9350, -84.0500], 12);
  let marcador;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(mapa);

  mapa.on('click', evento => {
    const { lat, lng } = evento.latlng;
    document.getElementById('latitud').value = lat;
    document.getElementById('longitud').value = lng;
    document.getElementById('ubicacionTexto').value = `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;

    if (marcador) marcador.remove();
    marcador = L.marker([lat, lng]).addTo(mapa);
  });

  setTimeout(() => mapa.invalidateSize(), 150);

  document.getElementById('formReporte').addEventListener('submit', event => {
    if (!document.getElementById('latitud').value) {
      event.preventDefault();
      alert('Marque la ubicación del foco de riesgo en el mapa.');
    }
  });
});
</script>