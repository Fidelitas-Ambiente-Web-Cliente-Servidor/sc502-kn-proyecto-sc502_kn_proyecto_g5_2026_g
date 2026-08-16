<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

<section class="page-hero mvc-hero">
  <div>
    <span class="tag">Inspector · Zonas</span>
    <h1>Zonas de riesgo</h1>
    <p>Mapa de calor y ranking de zonas según los reportes registrados en el sistema.</p>
  </div>
</section>

<section class="card panel-card">
  <form method="get" class="tool-strip">
    <input type="hidden" name="controller" value="inspector">
    <input type="hidden" name="action" value="zonas">
    <div class="filters filters-inline">
      <div class="field compact-field">
        <label for="tipo_foco_id">Tipo de foco</label>
        <select id="tipo_foco_id" name="tipo_foco_id">
          <option value="0">Todos</option>
          <?php foreach ($tiposFoco as $t): ?>
            <option value="<?= (int)$t['id'] ?>" <?= $filters['tipo_foco_id'] == $t['id'] ? 'selected' : '' ?>><?= e($t['nombre']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="field compact-field">
        <label for="estado_id">Estado</label>
        <select id="estado_id" name="estado_id">
          <option value="0">Todos</option>
          <option value="1" <?= $filters['estado_id'] == 1 ? 'selected' : '' ?>>Pendiente</option>
          <option value="2" <?= $filters['estado_id'] == 2 ? 'selected' : '' ?>>Asignado</option>
          <option value="3" <?= $filters['estado_id'] == 3 ? 'selected' : '' ?>>En atención</option>
          <option value="4" <?= $filters['estado_id'] == 4 ? 'selected' : '' ?>>Resuelto</option>
          <option value="5" <?= $filters['estado_id'] == 5 ? 'selected' : '' ?>>Rechazado</option>
        </select>
      </div>
      <div class="field compact-field">
        <label for="month">Mes</label>
        <select id="month" name="month">
          <option value="">Todos</option>
          <?php foreach ($meses as $mes): ?>
            <option value="<?= e($mes) ?>" <?= $filters['month'] === $mes ? 'selected' : '' ?>><?= e($mes) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <button class="btn" type="submit">Aplicar</button>
    </div>
  </form>
</section>

<section id="statsZonas" class="stats-grid mvc-section-space">
  <div class="stat-card"><small>Total de reportes</small><strong><?= (int)$totalReportes ?></strong></div>
  <div class="stat-card"><small>Zonas registradas</small><strong><?= count($ranking) ?></strong></div>
  <div class="stat-card"><small>Zona con más reportes</small><strong><?= e($ranking[0]['nombre'] ?? '—') ?></strong></div>
</section>

<section class="card panel-card mvc-section-space">
  <div class="tool-strip">
    <div class="section-title compact-title">
      <div>
        <span class="eyebrow">Distribución geográfica</span>
        <h2>Mapa de calor</h2>
        <p>Concentración de reportes por zona según los filtros aplicados.</p>
      </div>
    </div>
  </div>

  <div class="dashboard-grid dashboard-grid-wide">
    <div>
      <div id="mapaZonas" style="min-height:440px; border-radius:6px; border:1px solid var(--linea); background:#e9f3ff;"></div>
      <p style="margin-top:10px; font-size:.82rem; color:var(--muted);">
        <i class="bi bi-circle-fill" style="color:#d94848;"></i> Alta prioridad &nbsp;
        <i class="bi bi-circle-fill" style="color:#f08c00;"></i> Media prioridad &nbsp;
        <i class="bi bi-circle-fill" style="color:#2f9e44;"></i> Baja prioridad
      </p>
    </div>

    <aside class="map-card sticky-card">
      <div class="map-head">
        <div>
          <span class="eyebrow">Concentración</span>
          <h2>Reportes por zona</h2>
        </div>
      </div>
      <div class="ranking-list" id="rankingZonas">
        <?php
          $max = max(array_column($ranking, 'total')) ?: 1;
          foreach ($ranking as $z):
            $pct = (int)round(((int)$z['total'] / $max) * 100);
        ?>
          <div class="ranking-item">
            <div><span><?= e($z['nombre']) ?></span><span><?= (int)$z['total'] ?> reporte(s)</span></div>
            <div class="ranking-bar"><span style="width:<?= $pct ?>%;"></span></div>
          </div>
        <?php endforeach; ?>
      </div>

      <div style="height:1px; background:var(--linea); margin:18px 0;"></div>

      <div id="detalleMarker">
        <span class="eyebrow" style="display:block; margin-bottom:10px;">Seleccioná un marcador</span>
        <p style="color:var(--muted); font-size:.88rem;">Hacé clic en cualquier marcador del mapa para ver el detalle del reporte.</p>
      </div>
    </aside>
  </div>
</section>

<section class="card panel-card mvc-section-space">
  <div class="section-title">
    <div>
      <span class="eyebrow">Resumen por zona</span>
      <h2>Incidencias registradas por sector</h2>
    </div>
  </div>
  <div class="table-wrap">
    <table id="tablaZonas">
      <thead>
        <tr>
          <th>Zona</th>
          <th>Total reportes</th>
          <th>Pendientes</th>
          <th>En atención</th>
          <th>Resueltos</th>
          <th>Prioridad predominante</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($ranking as $z):
          $alta = (int)$z['alta_count'];
          $media = (int)$z['media_count'];
          $baja = (int)$z['baja_count'];

          $prioClase = '—';
          $prioTexto = '—';
          if ($alta > 0 && $alta >= $media && $alta >= $baja) {
              $prioClase = 'badge alta';
              $prioTexto = 'Alta';
          } elseif ($media > 0 && $media >= $baja) {
              $prioClase = 'badge media';
              $prioTexto = 'Media';
          } elseif ($baja > 0) {
              $prioClase = 'badge baja';
              $prioTexto = 'Baja';
          }
        ?>
          <tr>
            <td><strong><?= e($z['nombre']) ?></strong></td>
            <td style="text-align:center;"><?= (int)$z['total'] ?></td>
            <td style="text-align:center;"><?= (int)$z['pendientes'] ?></td>
            <td style="text-align:center;"><?= (int)$z['en_atencion'] ?></td>
            <td style="text-align:center;"><?= (int)$z['resueltos'] ?></td>
            <td><?= $prioTexto === '—' ? '—' : '<span class="' . $prioClase . '">' . e($prioTexto) . '</span>' ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</section>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
  const reportes = <?= json_encode($reportes, JSON_UNESCAPED_UNICODE) ?>;

  const colorPrioridad = (prioridad) => {
    if (prioridad === 'Alta') return '#d94848';
    if (prioridad === 'Media') return '#f08c00';
    return '#2f9e44';
  };

  const mapa = L.map('mapaZonas').setView([9.9350, -84.0500], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa);

  const puntosCalor = reportes.map(r => [
    parseFloat(r.latitud),
    parseFloat(r.longitud),
    r.prioridad === 'Alta' ? 1 : (r.prioridad === 'Media' ? 0.6 : 0.3)
  ]);
  L.heatLayer(puntosCalor, { radius: 30, blur: 20, maxZoom: 15 }).addTo(mapa);

  const capaMarcadores = L.layerGroup().addTo(mapa);

  reportes.forEach(r => {
    const icono = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;border-radius:50%;background:${colorPrioridad(r.prioridad)};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -10]
    });

    const marker = L.marker([parseFloat(r.latitud), parseFloat(r.longitud)], { icon: icono });

    marker.bindPopup(`<strong>${r.codigo}</strong><br>${r.tipo_foco} — ${r.zona}<br><small>${r.ciudadano} · ${r.fecha_creacion}</small>`);

    marker.on('click', () => {
      const claseEst = {
        'Asignado': 'badge asignado',
        'En atención': 'badge en-atencion',
        'Resuelto': 'badge resuelto',
        'Rechazado': 'badge rechazado'
      }[r.estado] || 'badge';

      const clasePrio = {
        'Alta': 'badge alta',
        'Media': 'badge media',
        'Baja': 'badge baja'
      }[r.prioridad] || 'badge';

      document.getElementById('detalleMarker').innerHTML = `
        <span class="eyebrow" style="display:block; margin-bottom:10px;">Detalle del reporte</span>
        <div class="detail-list" style="grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
          <div><strong>Código</strong><p style="margin:4px 0 0; color:var(--muted);">${r.codigo}</p></div>
          <div><strong>Zona</strong><p style="margin:4px 0 0; color:var(--muted);">${r.zona}</p></div>
          <div><strong>Estado</strong><p style="margin:4px 0 0;"><span class="${claseEst}">${r.estado}</span></p></div>
          <div><strong>Prioridad</strong><p style="margin:4px 0 0;"><span class="${clasePrio}">${r.prioridad}</span></p></div>
        </div>
        <p style="font-size:.85rem; color:var(--muted); line-height:1.5;">${r.descripcion}</p>
        <p style="font-size:.8rem; color:var(--muted); margin-top:8px;">Ciudadano: <strong>${r.ciudadano}</strong> · ${r.fecha_creacion}</p>
      `;
    });

    capaMarcadores.addLayer(marker);
  });

  setTimeout(() => mapa.invalidateSize(), 150);
});
</script>