// _zonas DE RIESGO — Inspector 
// Emmanuel Montoya | SC-502 Ambiente Web | Grupo 5

// DATOS DE PRUEBA 
var _reportes = [
  { id: "REP-2026-001", ciudadano: "María Rojas",   zona: "San Pedro",  tipo: "Agua estancada", estado: "Asignado",    prioridad: "Alta",  fecha: "2026-06-04", latitud: 9.9341,  longitud: -84.0512, descripcion: "Canal frente a varias casas con agua acumulada y larvas visibles." },
  { id: "REP-2026-002", ciudadano: "Carlos Méndez", zona: "Guadalupe",  tipo: "Dengue",         estado: "En atención", prioridad: "Media", fecha: "2026-06-08", latitud: 9.9448,  longitud: -84.0545, descripcion: "Vecinos reportan varios casos sospechosos y criaderos en lote baldío." },
  { id: "REP-2026-003", ciudadano: "María Rojas",   zona: "San Pedro",  tipo: "Roedores",       estado: "Asignado",    prioridad: "Baja",  fecha: "2026-06-11", latitud: 9.9316,  longitud: -84.0499, descripcion: "Acumulación de basura cerca de una alcantarilla." },
  { id: "REP-2026-004", ciudadano: "Carlos Méndez", zona: "Curridabat", tipo: "Cucarachas",     estado: "Resuelto",    prioridad: "Media", fecha: "2026-05-20", latitud: 9.9128,  longitud: -84.0351, descripcion: "Foco detectado en zona de comercios, ya se aplicó control." },
  { id: "REP-2026-005", ciudadano: "María Rojas",   zona: "Coronado",   tipo: "Dengue",         estado: "Pendiente",   prioridad: "Alta",  fecha: "2026-07-01", latitud: 9.9769,  longitud: -84.0065, descripcion: "Recipientes abiertos en patio abandonado cerca de una escuela." },
  { id: "REP-2026-006", ciudadano: "Carlos Méndez", zona: "San Pedro",  tipo: "Otro",           estado: "Resuelto",    prioridad: "Baja",  fecha: "2026-04-16", latitud: 9.9362,  longitud: -84.0522, descripcion: "Revisión preventiva solicitada por vecinos del sector." },
  { id: "REP-2026-007", ciudadano: "María Rojas",   zona: "Curridabat", tipo: "Agua estancada", estado: "Rechazado",   prioridad: "Baja",  fecha: "2026-05-02", latitud: 9.9135,  longitud: -84.0339, descripcion: "Reporte duplicado, ya existía otro caso registrado para el mismo sitio." }
];

var _zonas = ["San Pedro", "Guadalupe", "Curridabat", "Coronado"];

// Instancia del mapa Leaflet y capa de marcadores
var mapa = null;
var capaMarcadores = null;

// FUNCIÓN: colorPrioridad 
// Devuelve el color del marcador según la prioridad
function colorPrioridad(prioridad) {
  if (prioridad === "Alta")  return "#d94848";
  if (prioridad === "Media") return "#f08c00";
  return "#2f9e44";
}

// FUNCIÓN: initMapa
// Inicializa el mapa Leaflet centrado en San José
function initMapa() {
  mapa = L.map("mapa_zonas").setView([9.9350, -84.0500], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(mapa);
}

// FUNCIÓN: renderMarcadores 
// Limpia y vuelve a poner los marcadores según los filtros activos
function renderMarcadores() {
  var tipo   = document.getElementById("filtroTipoZona").value;
  var estado = document.getElementById("filtroEstadoZona").value;

  if (capaMarcadores) {
    mapa.removeLayer(capaMarcadores);
  }
  capaMarcadores = L.layerGroup();

  for (var i = 0; i < _reportes.length; i++) {
    var r = _reportes[i];

    var coincideTipo   = (tipo   === "todos" || r.tipo   === tipo);
    var coincideEstado = (estado === "todos" || r.estado === estado);
    if (!coincideTipo || !coincideEstado) continue;

    var color = colorPrioridad(r.prioridad);

    var icono = L.divIcon({
      className: "",
      html: "<div style='width:16px; height:16px; border-radius:50%; background:" + color + "; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3);'></div>",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -10]
    });

    var marker = L.marker([r.latitud, r.longitud], { icon: icono });

    marker.bindPopup(
      "<strong>" + r.id + "</strong><br>" +
      r.tipo + " — " + r.zona + "<br>" +
      "<small>" + r.ciudadano + " · " + r.fecha + "</small>"
    );

    // Guardamos referencia al reporte para el click
    (function(reporte) {
      marker.on("click", function() {
        mostrarDetalleMarker(reporte);
      });
    })(r);

    capaMarcadores.addLayer(marker);
  }

  capaMarcadores.addTo(mapa);

  renderRanking();
  renderTabla_zonas();
  renderStats();
}

//  FUNCIÓN: mostrarDetalleMarker 
// Muestra el detalle del reporte en el panel lateral al hacer clic
function mostrarDetalleMarker(reporte) {
  var claseEst = "badge";
  if (reporte.estado === "Asignado")    claseEst = "badge asignado";
  if (reporte.estado === "En atención") claseEst = "badge en-atencion";
  if (reporte.estado === "Resuelto")    claseEst = "badge resuelto";
  if (reporte.estado === "Rechazado")   claseEst = "badge rechazado";

  var clasePrio = "badge";
  if (reporte.prioridad === "Alta")  clasePrio = "badge alta";
  if (reporte.prioridad === "Media") clasePrio = "badge media";
  if (reporte.prioridad === "Baja")  clasePrio = "badge baja";

  document.getElementById("detalleMarker").innerHTML =
    "<span class='eyebrow' style='display:block; margin-bottom:10px;'>Detalle del reporte</span>" +
    "<div class='detail-list' style='grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;'>" +
      "<div><strong>ID</strong><p style='margin:4px 0 0; color:var(--muted);'>" + reporte.id + "</p></div>" +
      "<div><strong>Zona</strong><p style='margin:4px 0 0; color:var(--muted);'>" + reporte.zona + "</p></div>" +
      "<div><strong>Estado</strong><p style='margin:4px 0 0;'><span class='" + claseEst  + "'>" + reporte.estado    + "</span></p></div>" +
      "<div><strong>Prioridad</strong><p style='margin:4px 0 0;'><span class='" + clasePrio + "'>" + reporte.prioridad + "</span></p></div>" +
    "</div>" +
    "<p style='font-size:.85rem; color:var(--muted); line-height:1.5;'>" + reporte.descripcion + "</p>" +
    "<p style='font-size:.8rem; color:var(--muted); margin-top:8px;'>Ciudadano: <strong>" + reporte.ciudadano + "</strong> · " + reporte.fecha + "</p>";
}

// FUNCIÓN: renderRanking 
// Genera el ranking visual de _zonas por cantidad de _reportes
function renderRanking() {
  var tipo   = document.getElementById("filtroTipoZona").value;
  var estado = document.getElementById("filtroEstadoZona").value;

  // Contar _reportes por zona
  var conteo = {};
  for (var i = 0; i < _zonas.length; i++) {
    conteo[_zonas[i]] = 0;
  }

  for (var i = 0; i < _reportes.length; i++) {
    var r = _reportes[i];
    var coincideTipo   = (tipo   === "todos" || r.tipo   === tipo);
    var coincideEstado = (estado === "todos" || r.estado === estado);
    if (!coincideTipo || !coincideEstado) continue;
    if (conteo[r.zona] !== undefined) conteo[r.zona]++;
  }

  // Ordenar _zonas por cantidad descendente
  var nombres_zonas = Object.keys(conteo);
  nombres_zonas.sort(function(a, b) { return conteo[b] - conteo[a]; });

  var max = conteo[nombres_zonas[0]];
  if (max === 0) max = 1;

  var html = "";
  for (var i = 0; i < nombres_zonas.length; i++) {
    var zona = nombres_zonas[i];
    var pct  = Math.round((conteo[zona] / max) * 100);
    html +=
      "<div class='ranking-item'>" +
        "<div><span>" + zona + "</span><span>" + conteo[zona] + " reporte(s)</span></div>" +
        "<div class='ranking-bar'><span style='width:" + pct + "%;'></span></div>" +
      "</div>";
  }

  document.getElementById("ranking_zonas").innerHTML = html;
}

// FUNCIÓN: renderTabla_zonas
// Genera la tabla inferior con el resumen estadístico por zona
function renderTabla_zonas() {
  var tipo   = document.getElementById("filtroTipoZona").value;
  var estado = document.getElementById("filtroEstadoZona").value;

  // Inicializar resumen por zona
  var resumen = {};
  for (var i = 0; i < _zonas.length; i++) {
    resumen[_zonas[i]] = { total: 0, pendientes: 0, atencion: 0, resueltos: 0, altaCount: 0, mediaCount: 0, bajaCount: 0 };
  }

  for (var i = 0; i < _reportes.length; i++) {
    var r = _reportes[i];
    var coincideTipo   = (tipo   === "todos" || r.tipo   === tipo);
    var coincideEstado = (estado === "todos" || r.estado === estado);
    if (!coincideTipo || !coincideEstado) continue;
    if (!resumen[r.zona]) continue;

    resumen[r.zona].total++;
    if (r.estado === "Pendiente")    resumen[r.zona].pendientes++;
    if (r.estado === "En atención")  resumen[r.zona].atencion++;
    if (r.estado === "Resuelto")     resumen[r.zona].resueltos++;
    if (r.prioridad === "Alta")      resumen[r.zona].altaCount++;
    if (r.prioridad === "Media")     resumen[r.zona].mediaCount++;
    if (r.prioridad === "Baja")      resumen[r.zona].bajaCount++;
  }

  var tbody = document.querySelector("#tabla_zonas tbody");
  tbody.innerHTML = "";

  for (var i = 0; i < _zonas.length; i++) {
    var zona = _zonas[i];
    var d    = resumen[zona];

    // Prioridad predominante
    var prioPred = "—";
    var badgePrio = "—";
    if (d.altaCount > 0 && d.altaCount >= d.mediaCount && d.altaCount >= d.bajaCount) {
      prioPred  = "Alta";
      badgePrio = "<span class='badge alta'>Alta</span>";
    } else if (d.mediaCount > 0 && d.mediaCount >= d.bajaCount) {
      prioPred  = "Media";
      badgePrio = "<span class='badge media'>Media</span>";
    } else if (d.bajaCount > 0) {
      prioPred  = "Baja";
      badgePrio = "<span class='badge baja'>Baja</span>";
    }

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td><strong>" + zona + "</strong></td>" +
      "<td style='text-align:center;'>" + d.total      + "</td>" +
      "<td style='text-align:center;'>" + d.pendientes + "</td>" +
      "<td style='text-align:center;'>" + d.atencion   + "</td>" +
      "<td style='text-align:center;'>" + d.resueltos  + "</td>" +
      "<td>" + badgePrio + "</td>";
    tbody.appendChild(tr);
  }
}

// FUNCIÓN: renderStats 
// Tarjetas de totales generales
function renderStats() {
  var tipo   = document.getElementById("filtroTipoZona").value;
  var estado = document.getElementById("filtroEstadoZona").value;

  var total   = 0;
  var alta    = 0;
  var activos = 0;
  var zonaMap = {};

  for (var i = 0; i < _reportes.length; i++) {
    var r = _reportes[i];
    var coincideTipo   = (tipo   === "todos" || r.tipo   === tipo);
    var coincideEstado = (estado === "todos" || r.estado === estado);
    if (!coincideTipo || !coincideEstado) continue;

    total++;
    if (r.prioridad === "Alta")  alta++;
    if (r.estado !== "Resuelto" && r.estado !== "Rechazado") activos++;
    if (zonaMap[r.zona]) zonaMap[r.zona]++;
    else zonaMap[r.zona] = 1;
  }

  // Zona con más _reportes
  var zonaTop  = "—";
  var zonaMax  = 0;
  var nombresZ = Object.keys(zonaMap);
  for (var i = 0; i < nombresZ.length; i++) {
    if (zonaMap[nombresZ[i]] > zonaMax) {
      zonaMax  = zonaMap[nombresZ[i]];
      zonaTop  = nombresZ[i];
    }
  }

  document.getElementById("stats_zonas").innerHTML =
    tarjetaStat("bi bi-geo-alt-fill",            "Total de _reportes",      total) +
    tarjetaStat("bi bi-exclamation-circle-fill",  "Prioridad alta",         alta) +
    tarjetaStat("bi bi-lightning-charge-fill",    "Casos activos",          activos) +
    tarjetaStat("bi bi-building-fill",            "Zona con más _reportes",  zonaTop);

  // Resumen al pie
  document.getElementById("resumen_zonas").innerHTML =
    "<h4>Resumen de _zonas de riesgo</h4>" +
    "<p>_reportes mostrados en el mapa: <strong>" + total + "</strong></p>" +
    "<p>Zona con mayor concentración: <strong>" + zonaTop + " (" + (zonaMap[zonaTop] || 0) + " _reportes)</strong></p>" +
    "<p>_zonas registradas: <strong>" + _zonas.length + "</strong></p>";
}

// FUNCIÓN: tarjetaStat 
function tarjetaStat(icono, etiqueta, valor) {
  return "<div class='stat-card'>" +
    "<small>" + etiqueta + "</small>" +
    "<strong>" + valor + "</strong>" +
    "<i class='" + icono + "' style='font-size:1.5rem; color:var(--azul);'></i>" +
  "</div>";
}

// EVENTOS 
document.addEventListener("DOMContentLoaded", function() {
  initMapa();
  renderMarcadores();

  document.getElementById("filtroTipoZona").addEventListener("change",   function() { renderMarcadores(); });
  document.getElementById("filtroEstadoZona").addEventListener("change", function() { renderMarcadores(); });
});
