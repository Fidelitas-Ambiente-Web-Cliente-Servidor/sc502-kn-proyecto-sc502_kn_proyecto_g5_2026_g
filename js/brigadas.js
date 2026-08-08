//  GESTIÓN DE BRIGADAS — Inspector
// Emmanuel Montoya | SC-502 Ambiente Web | Grupo 5

// DATOS DE PRUEBA 
var _brigadistas = [
  { id: 1, nombre: "Juan Solano",   zona: "San Pedro",  telefono: "8888-0101", disponible: true,  casosActivos: 3 },
  { id: 2, nombre: "Andrés Vargas", zona: "Guadalupe",  telefono: "8888-0202", disponible: true,  casosActivos: 2 },
  { id: 3, nombre: "Sofía Ruiz",    zona: "Curridabat", telefono: "8888-0303", disponible: false, casosActivos: 5 }
];

var _asignaciones = [
  { id: 1, reporteId: "REP-2026-001", brigadistaId: 1, prioridad: "Alta",  estado: "Asignado",    fechaAsignacion: "2026-06-05", tipo: "Agua estancada", zona: "San Pedro" },
  { id: 2, reporteId: "REP-2026-002", brigadistaId: 2, prioridad: "Media", estado: "En atención", fechaAsignacion: "2026-06-08", tipo: "Dengue",         zona: "Guadalupe" },
  { id: 3, reporteId: "REP-2026-003", brigadistaId: 1, prioridad: "Baja",  estado: "Asignado",    fechaAsignacion: "2026-06-12", tipo: "Roedores",       zona: "San Pedro" },
  { id: 4, reporteId: "REP-2026-004", brigadistaId: 1, prioridad: "Media", estado: "Resuelto",    fechaAsignacion: "2026-05-21", tipo: "Cucarachas",     zona: "Curridabat" }
];

var _zonas = ["San Pedro", "Guadalupe", "Curridabat", "Coronado"];

// ID del brigadista seleccionado actualmente
var _brigadistaseleccionadoId = null;
// ID del reporte que se está reasignando
var reporteReasignarId = null;

// FUNCIÓN: renderStats 
// Muestra las tarjetas de resumen rápido
function renderStats() {
  var total      = _brigadistas.length;
  var disponibles = 0;
  var ocupados   = 0;
  var totalCasos = 0;

  for (var i = 0; i < _brigadistas.length; i++) {
    if (_brigadistas[i].disponible) disponibles++;
    else ocupados++;
    totalCasos += _brigadistas[i].casosActivos;
  }

  document.getElementById("statsBrigadas").innerHTML =
    tarjetaStat("bi bi-people-fill",               "Total _brigadistas",    total) +
    tarjetaStat("bi bi-check-circle-fill",          "Disponibles",          disponibles) +
    tarjetaStat("bi bi-exclamation-triangle-fill",  "No disponibles",       ocupados) +
    tarjetaStat("bi bi-pin-map-fill",               "Casos activos totales",totalCasos);
}

// FUNCIÓN: tarjetaStat 
function tarjetaStat(icono, etiqueta, valor) {
  return "<div class='stat-card'>" +
    "<small>" + etiqueta + "</small>" +
    "<strong>" + valor + "</strong>" +
    "<i class='" + icono + "' style='font-size:1.5rem; color:var(--azul);'></i>" +
  "</div>";
}

// FUNCIÓN: barraCarga 
// Devuelve una barra visual de carga de trabajo (máx referencial: 5 casos)
function barraCarga(casosActivos) {
  var pct   = casosActivos * 20;
  if (pct > 100) pct = 100;
  var color = "#2f9e44";
  if (pct >= 40) color = "#f08c00";
  if (pct >= 75) color = "#d94848";

  return "<div class='ranking-bar' style='width:100px;'>" +
    "<span style='width:" + pct + "%; background:" + color + ";'></span>" +
  "</div>" +
  "<small style='color:var(--muted); font-size:.75rem;'>" + casosActivos + " caso(s)</small>";
}

// FUNCIÓN: poblarFiltro_zonas 
function poblarFiltroZonas() {
  var select = document.getElementById("filtroZonaBrigada");
  for (var i = 0; i < _zonas.length; i++) {
    var op = document.createElement("option");
    op.value = _zonas[i];
    op.textContent = _zonas[i];
    select.appendChild(op);
  }
}

// FUNCIÓN: renderTabla 
// Renderiza la tabla de _brigadistas con los filtros activos
function renderTabla() {
  var disponibilidad = document.getElementById("filtroDisponibilidad").value;
  var zona           = document.getElementById("filtroZonaBrigada").value;

  var tbody = document.querySelector("#tablaBrigadistas tbody");
  tbody.innerHTML = "";
  var encontrados = 0;

  for (var i = 0; i < _brigadistas.length; i++) {
    var b = _brigadistas[i];

    var coincideDisp = (disponibilidad === "todos") ||
      (disponibilidad === "disponible" && b.disponible) ||
      (disponibilidad === "ocupado"    && !b.disponible);
    var coincideZona = (zona === "todas" || b.zona === zona);

    if (!coincideDisp || !coincideZona) continue;

    encontrados++;

    var pillDisp = b.disponible
      ? "<span class='badge resuelto'>Disponible</span>"
      : "<span class='badge alta'>No disponible</span>";

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td><strong>" + b.nombre + "</strong></td>" +
      "<td>" + b.zona + "</td>" +
      "<td style='text-align:center;'>" + b.casosActivos + "</td>" +
      "<td>" + barraCarga(b.casosActivos) + "</td>" +
      "<td>" + pillDisp + "</td>" +
      "<td>" + b.telefono + "</td>" +
      "<td><button class='btn' style='font-size:.78rem; min-height:34px; padding:6px 12px;' onclick='verCasosBrigadista(" + b.id + ")'>Ver casos</button></td>";
    tbody.appendChild(tr);
  }

  if (encontrados === 0) {
    tbody.innerHTML = "<tr><td colspan='7' style='text-align:center; padding:28px; color:var(--muted);'>No hay _brigadistas que coincidan con los filtros.</td></tr>";
  }

  actualizarResumen();
}

// FUNCIÓN: verCasosBrigadista 
// Muestra el panel inferior con los casos del brigadista seleccionado
function verCasosBrigadista(brigadistaId) {
  var brigad = null;
  for (var i = 0; i < _brigadistas.length; i++) {
    if (_brigadistas[i].id === brigadistaId) {
      brigad = _brigadistas[i];
      break;
    }
  }
  if (!brigad) return;

  _brigadistaseleccionadoId = brigadistaId;
  cancelarReasignacion();

  document.getElementById("tituloBrigadista").textContent = "Casos de " + brigad.nombre;

  var tbody = document.querySelector("#tablaCasosBrigadista tbody");
  tbody.innerHTML = "";
  var encontrados = 0;

  for (var i = 0; i < _asignaciones.length; i++) {
    var a = _asignaciones[i];
    if (a.brigadistaId !== brigadistaId) continue;

    encontrados++;

    var clasePrio = "badge";
    if (a.prioridad === "Alta")  clasePrio = "badge alta";
    if (a.prioridad === "Media") clasePrio = "badge media";
    if (a.prioridad === "Baja")  clasePrio = "badge baja";

    var claseEst = "badge";
    if (a.estado === "Asignado")    claseEst = "badge asignado";
    if (a.estado === "En atención") claseEst = "badge en-atencion";
    if (a.estado === "Resuelto")    claseEst = "badge resuelto";
    if (a.estado === "Rechazado")   claseEst = "badge rechazado";

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td><strong>" + a.reporteId + "</strong></td>" +
      "<td>" + a.tipo + "</td>" +
      "<td>" + a.zona + "</td>" +
      "<td><span class='" + clasePrio + "'>" + a.prioridad + "</span></td>" +
      "<td><span class='" + claseEst  + "'>" + a.estado    + "</span></td>" +
      "<td>" + a.fechaAsignacion + "</td>" +
      "<td><button class='btn secondary' style='font-size:.78rem; min-height:34px; padding:6px 12px;' onclick='iniciarReasignacion(\"" + a.reporteId + "\")'>Reasignar</button></td>";
    tbody.appendChild(tr);
  }

  if (encontrados === 0) {
    tbody.innerHTML = "<tr><td colspan='7' style='text-align:center; padding:20px; color:var(--muted);'>Este brigadista no tiene casos asignados.</td></tr>";
  }

  document.getElementById("panelBrigadista").style.display = "block";
  document.getElementById("panelBrigadista").scrollIntoView({ behavior: "smooth", block: "start" });
}

// FUNCIÓN: cerrarPanelBrigadista
function cerrarPanelBrigadista() {
  document.getElementById("panelBrigadista").style.display = "none";
  _brigadistaseleccionadoId = null;
}

// FUNCIÓN: iniciarReasignacion 
// Muestra el formulario de reasignación
function iniciarReasignacion(reporteId) {
  reporteReasignarId = reporteId;
  document.getElementById("reasignarReporteId").textContent = reporteId;

  var select = document.getElementById("selNuevoBrigadista");
  select.innerHTML = "<option value=''>— Seleccioná —</option>";

  for (var i = 0; i < _brigadistas.length; i++) {
    var b = _brigadistas[i];
    if (b.id === _brigadistaseleccionadoId) continue;
    var op = document.createElement("option");
    op.value = b.id;
    op.textContent = b.disponible ? b.nombre : b.nombre + " — No disponible";
    if (!b.disponible) op.disabled = true;
    select.appendChild(op);
  }

  document.getElementById("motivoReasignacion").value = "";
  document.getElementById("alertaReasignacion").className = "alert";
  document.getElementById("panelReasignacion").style.display = "block";
}

// FUNCIÓN: confirmarReasignacion 
// Aplica la reasignación y actualiza los datos
function confirmarReasignacion() {
  var nuevoBrigadistaId = parseInt(document.getElementById("selNuevoBrigadista").value);
  var motivo            = document.getElementById("motivoReasignacion").value;
  var alerta            = document.getElementById("alertaReasignacion");

  if (!nuevoBrigadistaId) {
    alerta.className   = "alert error show";
    alerta.textContent = "Seleccioná un brigadista para reasignar.";
    return;
  }
  if (motivo === "") {
    alerta.className   = "alert error show";
    alerta.textContent = "Ingresá el motivo de la reasignación.";
    return;
  }

  // Actualizar la asignación en el array
  for (var i = 0; i < _asignaciones.length; i++) {
    if (_asignaciones[i].reporteId === reporteReasignarId && _asignaciones[i].brigadistaId === _brigadistaseleccionadoId) {
      _asignaciones[i].brigadistaId = nuevoBrigadistaId;
      break;
    }
  }

  // Ajustar contadores de casos activos
  for (var i = 0; i < _brigadistas.length; i++) {
    if (_brigadistas[i].id === _brigadistaseleccionadoId && _brigadistas[i].casosActivos > 0) {
      _brigadistas[i].casosActivos--;
    }
    if (_brigadistas[i].id === nuevoBrigadistaId) {
      _brigadistas[i].casosActivos++;
    }
  }

  alerta.className   = "alert ok show";
  alerta.textContent = "Caso reasignado correctamente.";

  renderStats();
  renderTabla();

  setTimeout(function() {
    cancelarReasignacion();
    verCasosBrigadista(nuevoBrigadistaId);
  }, 1500);
}

// FUNCIÓN: cancelarReasignacion 
function cancelarReasignacion() {
  document.getElementById("panelReasignacion").style.display = "none";
  reporteReasignarId = null;
}

// FUNCIÓN: actualizarResumen 
function actualizarResumen() {
  var disponibles = 0;
  var totalCasos  = 0;
  var masOcupadoNombre = "—";
  var masOcupadoCasos  = 0;

  for (var i = 0; i < _brigadistas.length; i++) {
    if (_brigadistas[i].disponible) disponibles++;
    totalCasos += _brigadistas[i].casosActivos;
    if (_brigadistas[i].casosActivos > masOcupadoCasos) {
      masOcupadoCasos  = _brigadistas[i].casosActivos;
      masOcupadoNombre = _brigadistas[i].nombre;
    }
  }

  document.getElementById("resumenBrigadas").innerHTML =
    "<h4>Resumen de brigadas</h4>" +
    "<p>Total de _brigadistas: <strong>" + _brigadistas.length + "</strong></p>" +
    "<p>Disponibles: <strong>" + disponibles + "</strong></p>" +
    "<p>Total de casos activos: <strong>" + totalCasos + "</strong></p>" +
    "<p>Brigadista con más carga: <strong>" + masOcupadoNombre + " (" + masOcupadoCasos + " casos)</strong></p>";
}

// EVENTOS 
document.addEventListener("DOMContentLoaded", function() {
  renderStats();
  poblarFiltroZonas();
  renderTabla();

  document.getElementById("filtroDisponibilidad").addEventListener("change", function() { renderTabla(); });
  document.getElementById("filtroZonaBrigada").addEventListener("change",    function() { renderTabla(); });
});
