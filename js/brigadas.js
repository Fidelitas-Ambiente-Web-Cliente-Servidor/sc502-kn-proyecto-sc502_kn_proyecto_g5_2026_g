// ─── GESTIÓN DE BRIGADAS — Inspector ─────────────────────────
// Emmanuel Montoya | SC-502 Ambiente Web | Grupo 5

var _brigadistas = window.DengueData.brigadistas;
var _reportes    = window.DengueData.reportes;
var _asignaciones = window.DengueData.asignaciones;
var _zonas       = window.DengueData.zonas;

// ID del brigadista seleccionado actualmente
var brigadistaSeleccionadoId = null;
// ID del reporte que se está reasignando
var reporteReasignarId = null;

// ─── FUNCIÓN: renderStats ─────────────────────────────────────
// Muestra las tarjetas de resumen rápido
function renderStats() {
  var total       = _brigadistas.length;
  var disponibles = _brigadistas.filter(function(b) { return b.disponible; }).length;
  var ocupados    = _brigadistas.filter(function(b) { return !b.disponible; }).length;
  var totalCasos  = _brigadistas.reduce(function(s, b) { return s + b.casosActivos; }, 0);

  document.getElementById('statsBrigadas').innerHTML =
    tarjetaStat('👷', 'Total _brigadistas', total) +
    tarjetaStat('✅', 'Disponibles', disponibles) +
    tarjetaStat('⚠️', 'No disponibles', ocupados) +
    tarjetaStat('📌', 'Casos activos totales', totalCasos);
}

// ─── FUNCIÓN: tarjetaStat ─────────────────────────────────────
function tarjetaStat(icono, etiqueta, valor) {
  return '<div class="stat-card">' +
    '<small>' + etiqueta + '</small>' +
    '<strong>' + valor + '</strong>' +
    '<span style="font-size:1.6rem;">' + icono + '</span>' +
  '</div>';
}

// ─── FUNCIÓN: barrasCarga ─────────────────────────────────────
// Devuelve una barra visual de carga de trabajo (máx referencial: 5 casos)
function barraCarga(casosActivos) {
  var pct = Math.min(100, (casosActivos / 5) * 100);
  var color = pct < 40 ? '#2f9e44' : pct < 75 ? '#f08c00' : '#d94848';
  return '<div class="ranking-bar" style="width:100px;">' +
    '<span style="width:' + pct + '%; background:' + color + ';"></span>' +
  '</div>' +
  '<small style="color:var(--muted); font-size:.75rem;">' + casosActivos + ' caso(s)</small>';
}

// ─── FUNCIÓN: poblarFiltroZonas ───────────────────────────────
function poblarFiltroZonas() {
  var select = document.getElementById('filtroZonaBrigada');
  _zonas.forEach(function(z) {
    var op = document.createElement('option');
    op.value = z.nombre;
    op.textContent = z.nombre;
    select.appendChild(op);
  });
}

// ─── FUNCIÓN: renderTabla ─────────────────────────────────────
// Renderiza la tabla de _brigadistas con los filtros activos
function renderTabla() {
  var disponibilidad = document.getElementById('filtroDisponibilidad').value;
  var zona           = document.getElementById('filtroZonaBrigada').value;

  var filtrados = _brigadistas.filter(function(b) {
    var zonaObj = _zonas.find(function(z) { return z.id === b.zonaId; });
    var nombreZona = zonaObj ? zonaObj.nombre : '';
    var coincideDisp = disponibilidad === 'todos' ||
      (disponibilidad === 'disponible' && b.disponible) ||
      (disponibilidad === 'ocupado' && !b.disponible);
    var coincideZona = zona === 'todas' || nombreZona === zona;
    return coincideDisp && coincideZona;
  });

  var tbody = document.querySelector('#tablaBrigadistas tbody');
  tbody.innerHTML = '';

  if (filtrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:28px; color:var(--muted);">No hay _brigadistas que coincidan con los filtros.</td></tr>';
    actualizarResumen(filtrados);
    return;
  }

  filtrados.forEach(function(b) {
    var zonaObj  = _zonas.find(function(z) { return z.id === b.zonaId; });
    var nombreZona = zonaObj ? zonaObj.nombre : '—';
    var pillDisp = b.disponible
      ? '<span class="badge resuelto">Disponible</span>'
      : '<span class="badge alta">No disponible</span>';

    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><strong>' + b.nombre + '</strong></td>' +
      '<td>' + nombreZona + '</td>' +
      '<td style="text-align:center;">' + b.casosActivos + '</td>' +
      '<td>' + barraCarga(b.casosActivos) + '</td>' +
      '<td>' + pillDisp + '</td>' +
      '<td>' + b.telefono + '</td>' +
      '<td><button class="btn" style="font-size:.78rem; min-height:34px; padding:6px 12px;" onclick="verCasosBrigadista(' + b.id + ')">Ver casos</button></td>';
    tbody.appendChild(tr);
  });

  actualizarResumen(filtrados);
}

// ─── FUNCIÓN: verCasosBrigadista ──────────────────────────────
// Muestra el panel inferior con los casos asignados al brigadista
function verCasosBrigadista(brigadistaId) {
  var brigad = _brigadistas.find(function(b) { return b.id === brigadistaId; });
  if (!brigad) return;

  brigadistaSeleccionadoId = brigadistaId;
  cancelarReasignacion();

  document.getElementById('tituloBrigadista').textContent = 'Casos de ' + brigad.nombre;

  // Buscar _asignaciones de este brigadista
  var misAsignaciones = _asignaciones.filter(function(a) { return a.brigadistaId === brigadistaId; });

  var tbody = document.querySelector('#tablaCasosBrigadista tbody');
  tbody.innerHTML = '';

  if (misAsignaciones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--muted);">Este brigadista no tiene casos asignados.</td></tr>';
  } else {
    misAsignaciones.forEach(function(a) {
      var reporte = _reportes.find(function(r) { return r.id === a.reporteId; });
      if (!reporte) return;

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><strong>' + reporte.id + '</strong></td>' +
        '<td>' + reporte.tipo + '</td>' +
        '<td>' + reporte.zona + '</td>' +
        '<td><span class="badge ' + a.prioridad.toLowerCase() + '">' + a.prioridad + '</span></td>' +
        '<td><span class="badge ' + claseBadge(reporte.estado) + '">' + reporte.estado + '</span></td>' +
        '<td>' + a.fechaAsignacion + '</td>' +
        '<td><button class="btn secondary" style="font-size:.78rem; min-height:34px; padding:6px 12px;" onclick="iniciarReasignacion(\'' + reporte.id + '\')">Reasignar</button></td>';
      tbody.appendChild(tr);
    });
  }

  document.getElementById('panelBrigadista').style.display = 'block';
  document.getElementById('panelBrigadista').scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// ─── FUNCIÓN: cerrarPanelBrigadista ──────────────────────────
function cerrarPanelBrigadista() {
  document.getElementById('panelBrigadista').style.display = 'none';
  brigadistaSeleccionadoId = null;
}

// ─── FUNCIÓN: iniciarReasignacion ────────────────────────────
// Muestra el formulario de reasignación para el reporte indicado
function iniciarReasignacion(reporteId) {
  reporteReasignarId = reporteId;
  document.getElementById('reasignarReporteId').textContent = reporteId;

  // Poblar select con los otros _brigadistas disponibles
  var select = document.getElementById('selNuevoBrigadista');
  select.innerHTML = '<option value="">— Seleccioná —</option>';
  _brigadistas.forEach(function(b) {
    if (b.id === brigadistaSeleccionadoId) return;
    var op = document.createElement('option');
    op.value = b.id;
    op.textContent = b.nombre + (b.disponible ? '' : ' — No disponible');
    if (!b.disponible) op.disabled = true;
    select.appendChild(op);
  });

  document.getElementById('motivoReasignacion').value = '';
  document.getElementById('alertaReasignacion').className = 'alert';
  document.getElementById('panelReasignacion').style.display = 'block';
}

// ─── FUNCIÓN: confirmarReasignacion ──────────────────────────
// Aplica la reasignación y actualiza los datos
function confirmarReasignacion() {
  var nuevoBrigadistaId = parseInt(document.getElementById('selNuevoBrigadista').value);
  var motivo = document.getElementById('motivoReasignacion').value.trim();
  var alerta = document.getElementById('alertaReasignacion');

  if (!nuevoBrigadistaId) {
    alerta.className = 'alert error show';
    alerta.textContent = 'Seleccioná un brigadista para reasignar.';
    return;
  }
  if (!motivo) {
    alerta.className = 'alert error show';
    alerta.textContent = 'Ingresá el motivo de la reasignación.';
    return;
  }

  // Actualizar la asignación en el array
  var asig = _asignaciones.find(function(a) {
    return a.reporteId === reporteReasignarId && a.brigadistaId === brigadistaSeleccionadoId;
  });
  if (asig) {
    // Ajustar contadores
    var brigAnterior = _brigadistas.find(function(b) { return b.id === brigadistaSeleccionadoId; });
    var brigNuevo    = _brigadistas.find(function(b) { return b.id === nuevoBrigadistaId; });
    if (brigAnterior && brigAnterior.casosActivos > 0) brigAnterior.casosActivos--;
    if (brigNuevo) brigNuevo.casosActivos++;
    asig.brigadistaId = nuevoBrigadistaId;
  }

  alerta.className = 'alert ok show';
  alerta.textContent = 'Caso reasignado correctamente.';

  renderStats();
  renderTabla();
  setTimeout(function() {
    cancelarReasignacion();
    verCasosBrigadista(nuevoBrigadistaId);
  }, 1500);
}

// ─── FUNCIÓN: cancelarReasignacion ───────────────────────────
function cancelarReasignacion() {
  document.getElementById('panelReasignacion').style.display = 'none';
  reporteReasignarId = null;
}

// ─── FUNCIÓN: actualizarResumen ──────────────────────────────
function actualizarResumen(lista) {
  var disponibles = lista.filter(function(b) { return b.disponible; }).length;
  var totalCasos  = lista.reduce(function(s, b) { return s + b.casosActivos; }, 0);
  var masOcupado  = lista.reduce(function(max, b) { return b.casosActivos > max.casosActivos ? b : max; }, lista[0] || { nombre: '—', casosActivos: 0 });

  document.getElementById('resumenBrigadas').innerHTML =
    '<h4>Resumen de brigadas</h4>' +
    '<p>Brigadistas mostrados: <strong>' + lista.length + '</strong></p>' +
    '<p>Disponibles: <strong>' + disponibles + '</strong></p>' +
    '<p>Total de casos activos: <strong>' + totalCasos + '</strong></p>' +
    '<p>Brigadista con más carga: <strong>' + masOcupado.nombre + ' (' + masOcupado.casosActivos + ' casos)</strong></p>';
}

// ─── EVENTOS ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  renderStats();
  poblarFiltroZonas();
  renderTabla();

  document.getElementById('filtroDisponibilidad').addEventListener('change', renderTabla);
  document.getElementById('filtroZonaBrigada').addEventListener('change', renderTabla);
});

