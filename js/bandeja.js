// ─── BANDEJA DE CASOS — Inspector ────────────────────────────
// Emmanuel Montoya | SC-502 Ambiente Web | Grupo 5

// Acceso a los datos compartidos — sin redeclarar variables globales
var _reportes    = window.DengueData.reportes;
var _brigadistas = window.DengueData.brigadistas;
var _zonas       = window.DengueData.zonas;

// ID del reporte actualmente seleccionado en el panel de detalle
var reporteSeleccionadoId = null;

// ─── FUNCIÓN: renderStats ─────────────────────────────────────
// Muestra las tarjetas de resumen rápido en la parte superior
function renderStats() {
  var total      = _reportes.length;
  var pendientes = _reportes.filter(function(r) { return r.estado === 'Pendiente'; }).length;
  var asignados  = _reportes.filter(function(r) { return r.estado === 'Asignado'; }).length;
  var resueltos  = _reportes.filter(function(r) { return r.estado === 'Resuelto'; }).length;

  document.getElementById('resumenBandeja').innerHTML =
    tarjetaStat('📋', 'Total de reportes', total) +
    tarjetaStat('⏳', 'Pendientes', pendientes) +
    tarjetaStat('📌', 'Asignados', asignados) +
    tarjetaStat('✅', 'Resueltos', resueltos);
}

// ─── FUNCIÓN: tarjetaStat ─────────────────────────────────────
// Genera el HTML de una tarjeta de estadística
function tarjetaStat(icono, etiqueta, valor) {
  return '<div class="stat-card">' +
    '<small>' + etiqueta + '</small>' +
    '<strong>' + valor + '</strong>' +
    '<span style="font-size:1.6rem;">' + icono + '</span>' +
  '</div>';
}

// ─── FUNCIÓN: poblarFiltroZonas ───────────────────────────────
// Llena el select de zonas con los datos del array
function poblarFiltroZonas() {
  var select = document.getElementById('filtroZona');
  _zonas.forEach(function(z) {
    var op = document.createElement('option');
    op.value = z.nombre;
    op.textContent = z.nombre;
    select.appendChild(op);
  });
}

// ─── FUNCIÓN: poblarBrigadistas ───────────────────────────────
// Llena el select de brigadistas del panel de detalle
function poblarBrigadistas() {
  var select = document.getElementById('selBrigadista');
  _brigadistas.forEach(function(b) {
    var op = document.createElement('option');
    op.value = b.id;
    op.textContent = b.nombre + (b.disponible ? ' (' + b.casosActivos + ' casos activos)' : ' — No disponible');
    if (!b.disponible) op.disabled = true;
    select.appendChild(op);
  });
}

// ─── FUNCIÓN: badgeEstado ─────────────────────────────────────
// Devuelve el HTML del badge según el estado del reporte
function badgeEstado(estado) {
  var clases = {
    'Pendiente':   'badge',
    'Asignado':    'badge asignado',
    'En atención': 'badge en-atencion',
    'Resuelto':    'badge resuelto',
    'Rechazado':   'badge rechazado'
  };
  return '<span class="' + (clases[estado] || 'badge') + '">' + estado + '</span>';
}

// ─── FUNCIÓN: badgePrioridad ──────────────────────────────────
// Devuelve el HTML del badge según la prioridad
function badgePrioridad(prioridad) {
  var clases = { 'Alta': 'badge alta', 'Media': 'badge media', 'Baja': 'badge baja' };
  return '<span class="' + (clases[prioridad] || 'badge') + '">' + prioridad + '</span>';
}

// ─── FUNCIÓN: renderTabla ─────────────────────────────────────
// Renderiza la tabla de casos aplicando los filtros activos
function renderTabla() {
  var estado    = document.getElementById('filtroEstado').value;
  var prioridad = document.getElementById('filtroPrioridad').value;
  var zona      = document.getElementById('filtroZona').value;
  var busqueda  = document.getElementById('buscadorGlobal').value.toLowerCase().trim();

  var filtrados = _reportes.filter(function(r) {
    var coincideEstado    = estado    === 'todos' || r.estado    === estado;
    var coincidePrioridad = prioridad === 'todas' || r.prioridad === prioridad;
    var coincideZona      = zona      === 'todas' || r.zona      === zona;
    var coincideBusqueda  = !busqueda ||
      r.id.toLowerCase().includes(busqueda) ||
      r.ciudadano.toLowerCase().includes(busqueda);
    return coincideEstado && coincidePrioridad && coincideZona && coincideBusqueda;
  });

  var tbody = document.querySelector('#tablaCasos tbody');
  tbody.innerHTML = '';

  if (filtrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:28px; color:var(--muted);">No hay reportes que coincidan con los filtros seleccionados.</td></tr>';
    return;
  }

  filtrados.forEach(function(r) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><strong>' + r.id + '</strong></td>' +
      '<td>' + r.ciudadano + '</td>' +
      '<td>' + r.zona + '</td>' +
      '<td>' + r.tipo + '</td>' +
      '<td>' + badgePrioridad(r.prioridad) + '</td>' +
      '<td>' + badgeEstado(r.estado) + '</td>' +
      '<td>' + r.fechaCreacion + '</td>' +
      '<td><button class="btn" style="font-size:.78rem; min-height:34px; padding:6px 12px;" onclick="abrirDetalle(\'' + r.id + '\')">Ver detalle</button></td>';
    tbody.appendChild(tr);
  });

  actualizarResumen(filtrados);
}

// ─── FUNCIÓN: abrirDetalle ────────────────────────────────────
// Muestra el panel con los datos del reporte seleccionado
function abrirDetalle(reporteId) {
  var reporte = _reportes.find(function(r) { return r.id === reporteId; });
  if (!reporte) return;

  reporteSeleccionadoId = reporteId;

  document.getElementById('detalleTitulo').textContent  = reporte.id + ' — ' + reporte.tipo;
  document.getElementById('dCiudadano').textContent     = reporte.ciudadano;
  document.getElementById('dTipo').textContent          = reporte.tipo;
  document.getElementById('dZona').textContent          = reporte.zona;
  document.getElementById('dFecha').textContent         = reporte.fechaCreacion;
  document.getElementById('dDescripcion').value         = reporte.descripcion;
  document.getElementById('selPrioridad').value         = reporte.prioridad;
  document.getElementById('errorBrigadista').textContent = '';
  document.getElementById('alertaDetalle').className    = 'alert';
  document.getElementById('alertaDetalle').textContent  = '';

  document.getElementById('panelDetalle').style.display = 'block';
  document.getElementById('panelDetalle').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── FUNCIÓN: cerrarDetalle ───────────────────────────────────
// Oculta el panel de detalle
function cerrarDetalle() {
  document.getElementById('panelDetalle').style.display = 'none';
  reporteSeleccionadoId = null;
}

// ─── FUNCIÓN: asignarCaso ─────────────────────────────────────
// Valida la selección y marca el reporte como asignado
function asignarCaso() {
  var brigadistaId = document.getElementById('selBrigadista').value;

  if (!brigadistaId) {
    document.getElementById('errorBrigadista').textContent = 'Seleccioná un brigadista antes de asignar.';
    return;
  }
  document.getElementById('errorBrigadista').textContent = '';

  var reporte = _reportes.find(function(r) { return r.id === reporteSeleccionadoId; });
  if (!reporte) return;

  reporte.estado    = 'Asignado';
  reporte.prioridad = document.getElementById('selPrioridad').value;

  var alerta = document.getElementById('alertaDetalle');
  alerta.className   = 'alert ok show';
  alerta.textContent = 'Caso asignado correctamente.';

  renderStats();
  renderTabla();
  setTimeout(cerrarDetalle, 1800);
}

// ─── FUNCIÓN: rechazarCaso ────────────────────────────────────
// Marca el reporte como rechazado
function rechazarCaso() {
  var reporte = _reportes.find(function(r) { return r.id === reporteSeleccionadoId; });
  if (!reporte) return;

  reporte.estado = 'Rechazado';

  var alerta = document.getElementById('alertaDetalle');
  alerta.className   = 'alert error show';
  alerta.textContent = 'Caso rechazado.';

  renderStats();
  renderTabla();
  setTimeout(cerrarDetalle, 1800);
}

// ─── FUNCIÓN: actualizarResumen ───────────────────────────────
// Actualiza el bloque de resumen al pie con totales calculados
function actualizarResumen(lista) {
  var total     = lista.length;
  var alta      = lista.filter(function(r) { return r.prioridad === 'Alta'; }).length;
  var pendiente = lista.filter(function(r) { return r.estado === 'Pendiente'; }).length;

  document.getElementById('resumenInspector').innerHTML =
    '<h4>Resumen de la bandeja</h4>' +
    '<p>Casos mostrados: <strong>' + total + '</strong></p>' +
    '<p>Con prioridad alta: <strong>' + alta + '</strong></p>' +
    '<p>Pendientes de asignación: <strong>' + pendiente + '</strong></p>';
}

// ─── EVENTOS ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  renderStats();
  poblarFiltroZonas();
  poblarBrigadistas();
  renderTabla();

  document.getElementById('filtroEstado').addEventListener('change', renderTabla);
  document.getElementById('filtroPrioridad').addEventListener('change', renderTabla);
  document.getElementById('filtroZona').addEventListener('change', renderTabla);
  document.getElementById('buscadorGlobal').addEventListener('input', renderTabla);
});