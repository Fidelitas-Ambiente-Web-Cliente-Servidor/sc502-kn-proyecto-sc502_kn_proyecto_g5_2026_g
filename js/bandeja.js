// BANDEJA DE CASOS — Inspector 
// Emmanuel Montoya | SC-502 Ambiente Web | Grupo 5

// DATOS DE PRUEBA 
// Mientras no haya backend, los datos van acá como arrays
var _reportes = [
  { id: "REP-2026-001", ciudadano: "María Rojas",   zona: "San Pedro",  tipo: "Agua estancada", estado: "Asignado",    prioridad: "Alta",  fecha: "2026-06-04", descripcion: "Canal frente a varias casas con agua acumulada y larvas visibles." },
  { id: "REP-2026-002", ciudadano: "Carlos Méndez", zona: "Guadalupe",  tipo: "Dengue",         estado: "En atención", prioridad: "Media", fecha: "2026-06-08", descripcion: "Vecinos reportan varios casos sospechosos y criaderos en lote baldío." },
  { id: "REP-2026-003", ciudadano: "María Rojas",   zona: "San Pedro",  tipo: "Roedores",       estado: "Asignado",    prioridad: "Baja",  fecha: "2026-06-11", descripcion: "Acumulación de basura cerca de una alcantarilla." },
  { id: "REP-2026-004", ciudadano: "Carlos Méndez", zona: "Curridabat", tipo: "Cucarachas",     estado: "Resuelto",    prioridad: "Media", fecha: "2026-05-20", descripcion: "Foco detectado en zona de comercios, ya se aplicó control." },
  { id: "REP-2026-005", ciudadano: "María Rojas",   zona: "Coronado",   tipo: "Dengue",         estado: "Pendiente",   prioridad: "Alta",  fecha: "2026-07-01", descripcion: "Recipientes abiertos en patio abandonado cerca de una escuela." },
  { id: "REP-2026-006", ciudadano: "Carlos Méndez", zona: "San Pedro",  tipo: "Otro",           estado: "Resuelto",    prioridad: "Baja",  fecha: "2026-04-16", descripcion: "Revisión preventiva solicitada por vecinos del sector." },
  { id: "REP-2026-007", ciudadano: "María Rojas",   zona: "Curridabat", tipo: "Agua estancada", estado: "Rechazado",   prioridad: "Baja",  fecha: "2026-05-02", descripcion: "Reporte duplicado, ya existía otro caso registrado para el mismo sitio." }
];

var _zonas = ["San Pedro", "Guadalupe", "Curridabat", "Coronado"];

var _brigadistas = [
  { id: 1, nombre: "Juan Solano",   disponible: true  },
  { id: 2, nombre: "Andrés Vargas", disponible: true  },
  { id: 3, nombre: "Sofía Ruiz",    disponible: false }
];

// ID del reporte actualmente seleccionado en el panel de detalle
var _reporteseleccionadoId = null;

// FUNCIÓN: renderStats 
// Muestra las tarjetas de resumen rápido en la parte superior
function renderStats() {
  var total      = _reportes.length;
  var pendientes = 0;
  var asignados  = 0;
  var resueltos  = 0;

  for (var i = 0; i < _reportes.length; i++) {
    if (_reportes[i].estado === "Pendiente")   pendientes++;
    if (_reportes[i].estado === "Asignado")    asignados++;
    if (_reportes[i].estado === "Resuelto")    resueltos++;
  }

  document.getElementById("resumenBandeja").innerHTML =
    tarjetaStat("bi bi-clipboard-data-fill", "Total de _reportes", total) +
    tarjetaStat("bi bi-hourglass-split",     "Pendientes",        pendientes) +
    tarjetaStat("bi bi-person-check-fill",   "Asignados",         asignados) +
    tarjetaStat("bi bi-check-circle-fill",   "Resueltos",         resueltos);
}

// FUNCIÓN: tarjetaStat 
// Genera el HTML de una tarjeta de estadística con Bootstrap Icons
function tarjetaStat(icono, etiqueta, valor) {
  return "<div class='stat-card'>" +
    "<small>" + etiqueta + "</small>" +
    "<strong>" + valor + "</strong>" +
    "<i class='" + icono + "' style='font-size:1.5rem; color:var(--azul);'></i>" +
  "</div>";
}

// FUNCIÓN: poblarFiltro_zonas 
// Llena el select de _zonas con los datos del array
function poblarFiltro_zonas() {
  var select = document.getElementById("filtroZona");
  for (var i = 0; i < _zonas.length; i++) {
    var op = document.createElement("option");
    op.value = _zonas[i];
    op.textContent = _zonas[i];
    select.appendChild(op);
  }
}

// FUNCIÓN: poblar_brigadistas 
// Llena el select de _brigadistas del panel de detalle
function poblar_brigadistas() {
  var select = document.getElementById("selBrigadista");
  for (var i = 0; i < _brigadistas.length; i++) {
    var b = _brigadistas[i];
    var op = document.createElement("option");
    op.value = b.id;
    op.textContent = b.disponible ? b.nombre : b.nombre + " — No disponible";
    if (!b.disponible) op.disabled = true;
    select.appendChild(op);
  }
}

// FUNCIÓN: badgeEstado 
// Devuelve el HTML del badge según el estado del reporte
function badgeEstado(estado) {
  var clase = "badge";
  if (estado === "Asignado")    clase = "badge asignado";
  if (estado === "En atención") clase = "badge en-atencion";
  if (estado === "Resuelto")    clase = "badge resuelto";
  if (estado === "Rechazado")   clase = "badge rechazado";
  return "<span class='" + clase + "'>" + estado + "</span>";
}

// FUNCIÓN: badgePrioridad 
// Devuelve el HTML del badge según la prioridad
function badgePrioridad(prioridad) {
  var clase = "badge";
  if (prioridad === "Alta")  clase = "badge alta";
  if (prioridad === "Media") clase = "badge media";
  if (prioridad === "Baja")  clase = "badge baja";
  return "<span class='" + clase + "'>" + prioridad + "</span>";
}

// FUNCIÓN: renderTabla 
// Renderiza la tabla de casos aplicando los filtros activos
function renderTabla() {
  var estado    = document.getElementById("filtroEstado").value;
  var prioridad = document.getElementById("filtroPrioridad").value;
  var zona      = document.getElementById("filtroZona").value;
  var busqueda  = document.getElementById("buscadorGlobal").value.toLowerCase();

  var tbody = document.querySelector("#tablaCasos tbody");
  tbody.innerHTML = "";

  var encontrados = 0;

  for (var i = 0; i < _reportes.length; i++) {
    var r = _reportes[i];

    var coincideEstado    = (estado    === "todos" || r.estado    === estado);
    var coincidePrioridad = (prioridad === "todas" || r.prioridad === prioridad);
    var coincideZona      = (zona      === "todas" || r.zona      === zona);
    var coincideBusqueda  = (busqueda  === "" || r.id.toLowerCase().indexOf(busqueda) !== -1 || r.ciudadano.toLowerCase().indexOf(busqueda) !== -1);

    if (!coincideEstado || !coincidePrioridad || !coincideZona || !coincideBusqueda) continue;

    encontrados++;

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td><strong>" + r.id + "</strong></td>" +
      "<td>" + r.ciudadano + "</td>" +
      "<td>" + r.zona + "</td>" +
      "<td>" + r.tipo + "</td>" +
      "<td>" + badgePrioridad(r.prioridad) + "</td>" +
      "<td>" + badgeEstado(r.estado) + "</td>" +
      "<td>" + r.fecha + "</td>" +
      "<td><button class='btn' style='font-size:.78rem; min-height:34px; padding:6px 12px;' onclick='abrirDetalle(\"" + r.id + "\")'>Ver detalle</button></td>";
    tbody.appendChild(tr);
  }

  if (encontrados === 0) {
    tbody.innerHTML = "<tr><td colspan='8' style='text-align:center; padding:28px; color:var(--muted);'>No hay _reportes que coincidan con los filtros seleccionados.</td></tr>";
  }

  actualizarResumen();
}

// FUNCIÓN: abrirDetalle 
// Muestra el panel con los datos del reporte seleccionado
function abrirDetalle(reporteId) {
  var reporte = null;
  for (var i = 0; i < _reportes.length; i++) {
    if (_reportes[i].id === reporteId) {
      reporte = _reportes[i];
      break;
    }
  }
  if (!reporte) return;

  _reporteseleccionadoId = reporteId;

  document.getElementById("detalleTitulo").textContent   = reporte.id + " — " + reporte.tipo;
  document.getElementById("dCiudadano").textContent      = reporte.ciudadano;
  document.getElementById("dTipo").textContent           = reporte.tipo;
  document.getElementById("dZona").textContent           = reporte.zona;
  document.getElementById("dFecha").textContent          = reporte.fecha;
  document.getElementById("dDescripcion").value          = reporte.descripcion;
  document.getElementById("selPrioridad").value          = reporte.prioridad;
  document.getElementById("errorBrigadista").textContent = "";
  document.getElementById("alertaDetalle").className     = "alert";
  document.getElementById("alertaDetalle").textContent   = "";

  document.getElementById("panelDetalle").style.display = "block";
  document.getElementById("panelDetalle").scrollIntoView({ behavior: "smooth", block: "start" });
}

// FUNCIÓN: cerrarDetalle 
// Oculta el panel de detalle
function cerrarDetalle() {
  document.getElementById("panelDetalle").style.display = "none";
  _reporteseleccionadoId = null;
}

// FUNCIÓN: asignarCaso 
// Valida la selección y marca el reporte como asignado
function asignarCaso() {
  var brigadistaId = document.getElementById("selBrigadista").value;

  if (brigadistaId === "") {
    document.getElementById("errorBrigadista").textContent = "Seleccioná un brigadista antes de asignar.";
    return;
  }
  document.getElementById("errorBrigadista").textContent = "";

  for (var i = 0; i < _reportes.length; i++) {
    if (_reportes[i].id === _reporteseleccionadoId) {
      _reportes[i].estado    = "Asignado";
      _reportes[i].prioridad = document.getElementById("selPrioridad").value;
      break;
    }
  }

  var alerta = document.getElementById("alertaDetalle");
  alerta.className   = "alert ok show";
  alerta.textContent = "Caso asignado correctamente.";

  renderStats();
  renderTabla();

  setTimeout(function() {
    cerrarDetalle();
  }, 1800);
}

// ─── FUNCIÓN: rechazarCaso ────────────────────────────────────
// Marca el reporte como rechazado
function rechazarCaso() {
  for (var i = 0; i < _reportes.length; i++) {
    if (_reportes[i].id === _reporteseleccionadoId) {
      _reportes[i].estado = "Rechazado";
      break;
    }
  }

  var alerta = document.getElementById("alertaDetalle");
  alerta.className   = "alert error show";
  alerta.textContent = "Caso rechazado.";

  renderStats();
  renderTabla();

  setTimeout(function() {
    cerrarDetalle();
  }, 1800);
}

// ─── FUNCIÓN: actualizarResumen ───────────────────────────────
// Actualiza el bloque de resumen al pie con totales calculados
function actualizarResumen() {
  var total     = 0;
  var alta      = 0;
  var pendiente = 0;

  for (var i = 0; i < _reportes.length; i++) {
    total++;
    if (_reportes[i].prioridad === "Alta")    alta++;
    if (_reportes[i].estado   === "Pendiente") pendiente++;
  }

  document.getElementById("resumenInspector").innerHTML =
    "<h4>Resumen de la bandeja</h4>" +
    "<p>Total de casos: <strong>" + total + "</strong></p>" +
    "<p>Con prioridad alta: <strong>" + alta + "</strong></p>" +
    "<p>Pendientes de asignación: <strong>" + pendiente + "</strong></p>";
}

// ─── EVENTOS ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function() {
  renderStats();
  poblarFiltro_zonas();
  poblar_brigadistas();
  renderTabla();

  document.getElementById("filtroEstado").addEventListener("change", function() { renderTabla(); });
  document.getElementById("filtroPrioridad").addEventListener("change", function() { renderTabla(); });
  document.getElementById("filtroZona").addEventListener("change", function() { renderTabla(); });
  document.getElementById("buscadorGlobal").addEventListener("input", function() { renderTabla(); });
});