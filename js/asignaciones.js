document.addEventListener("DOMContentLoaded", () => {
  const data = window.DengueData;
  const brigadistaActualId = 1;
  const tabla = document.querySelector("#tablaAsignaciones tbody");
  const filtroEstado = document.querySelector("#filtroEstado");
  const filtroPrioridad = document.querySelector("#filtroPrioridad");
  const detalle = document.querySelector("#detalleCaso");
  const resumen = document.querySelector("#resumenAsignaciones");

  let mapa = null;
  let marcador = null;
  let casoSeleccionado = null;

  const estadosGuardados = () => JSON.parse(localStorage.getItem("estadosReporteDemo") || "{}");
  const normalizar = texto => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");

  const obtenerCasos = () => {
    const estados = estadosGuardados();

    return data.asignaciones
      .filter(asignacion => asignacion.brigadistaId === brigadistaActualId)
      .map(asignacion => {
        const reporte = data.reportes.find(item => item.id === asignacion.reporteId);
        return {
          ...asignacion,
          ...reporte,
          estado: estados[asignacion.reporteId] || reporte.estado,
          prioridad: asignacion.prioridad || reporte.prioridad
        };
      });
  };

  const filtrarCasos = () => {
    const estado = filtroEstado.value;
    const prioridad = filtroPrioridad.value;

    return obtenerCasos().filter(caso => {
      const coincideEstado = estado === "todos" || caso.estado === estado;
      const coincidePrioridad = prioridad === "todas" || caso.prioridad === prioridad;
      return coincideEstado && coincidePrioridad;
    });
  };

  const renderResumen = () => {
    const todos = obtenerCasos();
    const alta = todos.filter(caso => caso.prioridad === "Alta").length;
    const enAtencion = todos.filter(caso => caso.estado === "En atención").length;
    const resueltos = todos.filter(caso => caso.estado === "Resuelto").length;

    resumen.innerHTML = `
      <div class="stat-card"><span class="stat-icon">ASG</span><small>Total asignado</small><strong>${todos.length}</strong></div>
      <div class="stat-card"><span class="stat-icon">ALT</span><small>Alta prioridad</small><strong>${alta}</strong></div>
      <div class="stat-card"><span class="stat-icon">ATE</span><small>En atención</small><strong>${enAtencion}</strong></div>
      <div class="stat-card"><span class="stat-icon">RES</span><small>Resueltos</small><strong>${resueltos}</strong></div>
    `;
  };

  const renderTabla = casos => {
    if (!casos.length) {
      tabla.innerHTML = `<tr><td colspan="7"><div class="empty-state">No hay casos con esos filtros.</div></td></tr>`;
      return;
    }

    tabla.innerHTML = casos.map(caso => `
      <tr class="${casoSeleccionado === caso.id ? "selected" : ""}" data-row="${caso.id}">
        <td><strong>${caso.id}</strong><br><small>Asignado: ${caso.fechaAsignacion}</small></td>
        <td>${caso.zona}</td>
        <td><span class="badge ${normalizar(caso.tipo)}">${caso.tipo}</span></td>
        <td><span class="badge ${normalizar(caso.prioridad)}">${caso.prioridad}</span></td>
        <td><span class="badge ${normalizar(caso.estado)}">${caso.estado}</span></td>
        <td>${caso.descripcion}</td>
        <td>
          <div class="actions-row">
            <button class="btn secondary" data-ver="${caso.id}" type="button">Ver mapa</button>
            <a class="btn" href="registrar-accion.html?caso=${caso.id}">Registrar</a>
          </div>
        </td>
      </tr>
    `).join("");
  };

  const cargarMapa = caso => {
    if (!window.L) {
      document.querySelector("#mapaCaso").innerHTML = "No se pudo cargar el mapa.";
      return;
    }

    if (!mapa) {
      mapa = L.map("mapaCaso").setView([caso.latitud, caso.longitud], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
      }).addTo(mapa);
    } else {
      mapa.setView([caso.latitud, caso.longitud], 15);
    }

    if (marcador) marcador.remove();

    marcador = L.marker([caso.latitud, caso.longitud]).addTo(mapa);
    marcador.bindPopup(`<strong>${caso.id}</strong><br>${caso.tipo}<br>${caso.zona}`).openPopup();

    setTimeout(() => mapa.invalidateSize(), 150);
  };

  const renderDetalle = caso => {
    detalle.innerHTML = `
      <h3>${caso.id}</h3>
      <p>${caso.descripcion}</p>
      <div class="detail-list">
        <div><strong>Ciudadano:</strong><br>${caso.ciudadano}</div>
        <div><strong>Zona:</strong><br>${caso.zona}</div>
        <div><strong>Tipo de foco:</strong><br>${caso.tipo}</div>
        <div><strong>Estado:</strong><br><span class="badge ${normalizar(caso.estado)}">${caso.estado}</span></div>
        <div><strong>Prioridad:</strong><br><span class="badge ${normalizar(caso.prioridad)}">${caso.prioridad}</span></div>
        <div><strong>Fecha:</strong><br>${caso.fechaCreacion}</div>
      </div>
      <div class="case-route">
        <div class="route-item"><span>1</span>Reporte recibido</div>
        <div class="route-item"><span>2</span>Asignado a brigada</div>
        <div class="route-item"><span>3</span>Atención en campo</div>
      </div>
    `;
  };

  const seleccionarCaso = id => {
    const caso = obtenerCasos().find(item => item.id === id) || obtenerCasos()[0];
    if (!caso) return;

    casoSeleccionado = caso.id;
    renderDetalle(caso);
    cargarMapa(caso);
    renderTabla(filtrarCasos());
  };

  const actualizarVista = () => {
    const casos = filtrarCasos();
    renderResumen();
    renderTabla(casos);

    if (!casos.some(caso => caso.id === casoSeleccionado)) {
      casoSeleccionado = casos[0]?.id || null;
    }

    if (casoSeleccionado) seleccionarCaso(casoSeleccionado);
    if (!casoSeleccionado) detalle.innerHTML = `<div class="empty-state">Seleccione un caso para ver el detalle.</div>`;
  };

  tabla.addEventListener("click", event => {
    const boton = event.target.closest("[data-ver]");
    const fila = event.target.closest("[data-row]");

    if (boton) seleccionarCaso(boton.dataset.ver);
    if (!boton && fila) seleccionarCaso(fila.dataset.row);
  });

  filtroEstado.addEventListener("change", actualizarVista);
  filtroPrioridad.addEventListener("change", actualizarVista);

  actualizarVista();
});
