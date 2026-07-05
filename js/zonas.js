// ─── ZONAS DE RIESGO — Inspector ─────────────────────────────
// Emmanuel Montoya | SC-502 Ambiente Web | Grupo 5

var _reportes = window.DengueData.reportes;
var _zonas    = window.DengueData.zonas;

// Instancia del mapa Leaflet
var mapa = null;
// Capa de marcadores activa
var capaMarcadores = null;

// ─── FUNCIÓN: colorPrioridad ──────────────────────────────────
// Devuelve el color del marcador según la prioridad del reporte
function colorPrioridad(prioridad) {
  if (prioridad === 'Alta')  return '#d94848';
  if (prioridad === 'Media') return '#f08c00';
  return '#2f9e44';
}

// ─── FUNCIÓN: iconoMarker ─────────────────────────────────────
// Crea un icono circular personalizado para Leaflet
function iconoMarker(prioridad) {
  var color = colorPrioridad(prioridad);
  return L.divIcon({
    className: '',
    html: '<div style="width:16px; height:16px; border-radius:50%; background:' + color + '; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10]
  });
}

// ─── FUNCIÓN: initMapa ────────────────────────────────────────
// Inicializa el mapa Leaflet centrado en San José
function initMapa() {
  mapa = L.map('mapaZonas').setView([9.9350, -84.0500], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapa);
}

// ─── FUNCIÓN: renderMarcadores ────────────────────────────────
// Limpia y vuelve a poner los marcadores según los filtros activos
function renderMarcadores() {
  var tipo   = document.getElementById('filtroTipoZona').value;
  var estado = document.getElementById('filtroEstadoZona').value;

  var filtrados = _reportes.filter(function(r) {
    var coincideTipo   = tipo   === 'todos' || r.tipo   === tipo;
    var coincideEstado = estado === 'todos' || r.estado === estado;
    return coincideTipo && coincideEstado;
  });

  // Limpiar capa anterior
  if (capaMarcadores) {
    mapa.removeLayer(capaMarcadores);
  }
  capaMarcadores = L.layerGroup();

  filtrados.forEach(function(r) {
    var marker = L.marker([r.latitud, r.longitud], { icon: iconoMarker(r.prioridad) });

    marker.bindPopup(
      '<strong>' + r.id + '</strong><br>' +
      r.tipo + ' — ' + r.zona + '<br>' +
      '<small>' + r.ciudadano + ' · ' + r.fechaCreacion + '</small>'
    );

    marker.on('click', function() {
      mostrarDetalleMarker(r);
    });

    capaMarcadores.addLayer(marker);
  });

  capaMarcadores.addTo(mapa);

  renderRanking(filtrados);
  renderTablaZonas(filtrados);
  actualizarResumen(filtrados);
}

// ─── FUNCIÓN: mostrarDetalleMarker ────────────────────────────
// Muestra el detalle del reporte en el panel lateral al hacer clic
function mostrarDetalleMarker(reporte) {
  var badge = '<span class="badge ' + claseBadge(reporte.estado) + '">' + reporte.estado + '</span>';
  var prio  = '<span class="badge ' + reporte.prioridad.toLowerCase() + '">' + reporte.prioridad + '</span>';

  document.getElementById('detalleMarker').innerHTML =
    '<span class="eyebrow" style="display:block; margin-bottom:10px;">Detalle del reporte</span>' +
    '<div class="detail-list" style="grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">' +
      '<div><strong>ID</strong><p style="margin:4px 0 0; color:var(--muted);">' + reporte.id + '</p></div>' +
      '<div><strong>Zona</strong><p style="margin:4px 0 0; color:var(--muted);">' + reporte.zona + '</p></div>' +
      '<div><strong>Estado</strong><p style="margin:4px 0 0;">' + badge + '</p></div>' +
      '<div><strong>Prioridad</strong><p style="margin:4px 0 0;">' + prio + '</p></div>' +
    '</div>' +
    '<p style="font-size:.85rem; color:var(--muted); line-height:1.5;">' + reporte.descripcion + '</p>' +
    '<p style="font-size:.8rem; color:var(--muted); margin-top:8px;">Ciudadano: <strong>' + reporte.ciudadano + '</strong> · ' + reporte.fechaCreacion + '</p>';
}

// ─── FUNCIÓN: claseBadge ──────────────────────────────────────
function claseBadge(estado) {
  var mapa = {
    'Pendiente':   '',
    'Asignado':    'asignado',
    'En atención': 'en-atencion',
    'Resuelto':    'resuelto',
    'Rechazado':   'rechazado'
  };
  return mapa[estado] || '';
}

// ─── FUNCIÓN: renderRanking ───────────────────────────────────
// Genera el ranking visual de _zonas por cantidad de _reportes
function renderRanking(lista) {
  var conteo = {};
  _zonas.forEach(function(z) { conteo[z.nombre] = 0; });
  lista.forEach(function(r) {
    if (conteo[r.zona] !== undefined) conteo[r.zona]++;
    else conteo[r.zona] = 1;
  });

  var ordenadas = Object.keys(conteo).sort(function(a, b) { return conteo[b] - conteo[a]; });
  var max = conteo[ordenadas[0]] || 1;

  var html = ordenadas.map(function(zona) {
    var pct = Math.round((conteo[zona] / max) * 100);
    return '<div class="ranking-item">' +
      '<div><span>' + zona + '</span><span>' + conteo[zona] + ' reporte(s)</span></div>' +
      '<div class="ranking-bar"><span style="width:' + pct + '%;"></span></div>' +
    '</div>';
  }).join('');

  document.getElementById('rankingZonas').innerHTML = html;
}

// ─── FUNCIÓN: renderTablaZonas ────────────────────────────────
// Genera la tabla inferior con el resumen estadístico por zona
function renderTablaZonas(lista) {
  var resumen = {};
  _zonas.forEach(function(z) {
    resumen[z.nombre] = { total: 0, pendientes: 0, atencion: 0, resueltos: 0, prioridades: {} };
  });

  lista.forEach(function(r) {
    if (!resumen[r.zona]) resumen[r.zona] = { total: 0, pendientes: 0, atencion: 0, resueltos: 0, prioridades: {} };
    resumen[r.zona].total++;
    if (r.estado === 'Pendiente')    resumen[r.zona].pendientes++;
    if (r.estado === 'En atención')  resumen[r.zona].atencion++;
    if (r.estado === 'Resuelto')     resumen[r.zona].resueltos++;
    resumen[r.zona].prioridades[r.prioridad] = (resumen[r.zona].prioridades[r.prioridad] || 0) + 1;
  });

  var tbody = document.querySelector('#tablaZonas tbody');
  tbody.innerHTML = '';

  Object.keys(resumen).forEach(function(zona) {
    var d = resumen[zona];
    // Prioridad predominante
    var prioPred = Object.keys(d.prioridades).sort(function(a, b) {
      return d.prioridades[b] - d.prioridades[a];
    })[0] || '—';
    var badgePrio = prioPred !== '—'
      ? '<span class="badge ' + prioPred.toLowerCase() + '">' + prioPred + '</span>'
      : '—';

    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><strong>' + zona + '</strong></td>' +
      '<td style="text-align:center;">' + d.total + '</td>' +
      '<td style="text-align:center;">' + d.pendientes + '</td>' +
      '<td style="text-align:center;">' + d.atencion + '</td>' +
      '<td style="text-align:center;">' + d.resueltos + '</td>' +
      '<td>' + badgePrio + '</td>';
    tbody.appendChild(tr);
  });
}

// ─── FUNCIÓN: renderStats ─────────────────────────────────────
// Tarjetas de totales generales
function renderStats() {
  var total  = _reportes.length;
  var zonaMap = {};
  _reportes.forEach(function(r) {
    zonaMap[r.zona] = (zonaMap[r.zona] || 0) + 1;
  });
  var zonaTop = Object.keys(zonaMap).sort(function(a, b) { return zonaMap[b] - zonaMap[a]; })[0] || '—';
  var alta    = _reportes.filter(function(r) { return r.prioridad === 'Alta'; }).length;
  var activos = _reportes.filter(function(r) { return r.estado !== 'Resuelto' && r.estado !== 'Rechazado'; }).length;

  document.getElementById('statsZonas').innerHTML =
    tarjetaStat('📍', 'Total de _reportes', total) +
    tarjetaStat('🔴', 'Prioridad alta', alta) +
    tarjetaStat('⚡', 'Casos activos', activos) +
    tarjetaStat('🏘️', 'Zona con más _reportes', zonaTop);
}

// ─── FUNCIÓN: tarjetaStat ─────────────────────────────────────
function tarjetaStat(icono, etiqueta, valor) {
  return '<div class="stat-card">' +
    '<small>' + etiqueta + '</small>' +
    '<strong>' + valor + '</strong>' +
    '<span style="font-size:1.6rem;">' + icono + '</span>' +
  '</div>';
}

// ─── FUNCIÓN: actualizarResumen ──────────────────────────────
function actualizarResumen(lista) {
  var zonaMap = {};
  lista.forEach(function(r) { zonaMap[r.zona] = (zonaMap[r.zona] || 0) + 1; });
  var zonaTop = Object.keys(zonaMap).sort(function(a, b) { return zonaMap[b] - zonaMap[a]; })[0] || '—';

  document.getElementById('resumenZonas').innerHTML =
    '<h4>Resumen de _zonas de riesgo</h4>' +
    '<p>Reportes mostrados en el mapa: <strong>' + lista.length + '</strong></p>' +
    '<p>Zona con mayor concentración: <strong>' + zonaTop + ' (' + (zonaMap[zonaTop] || 0) + ' _reportes)</strong></p>' +
    '<p>Zonas registradas: <strong>' + _zonas.length + '</strong></p>';
}

// ─── EVENTOS ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  renderStats();
  initMapa();
  renderMarcadores();

  document.getElementById('filtroTipoZona').addEventListener('change', renderMarcadores);
  document.getElementById('filtroEstadoZona').addEventListener('change', renderMarcadores);
});

