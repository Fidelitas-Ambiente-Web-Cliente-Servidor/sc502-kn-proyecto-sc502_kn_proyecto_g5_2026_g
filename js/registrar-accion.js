document.addEventListener("DOMContentLoaded", () => {
  const data = window.DengueData;
  const brigadistaActualId = 1;
  const form = document.querySelector("#formAccion");
  const casoSelect = document.querySelector("#casoId");
  const alerta = document.querySelector("#mensajeForm");
  const historial = document.querySelector("#historialAcciones");
  const fecha = document.querySelector("#fechaAccion");
  const detalleCaso = document.querySelector("#detalleCasoForm");
  const evidenciaInput = document.querySelector("#evidencia");
  const archivoNombre = document.querySelector("#archivoNombre");

  fecha.value = new Date().toISOString().slice(0, 10);

  const normalizar = texto => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  const estadosGuardados = () => JSON.parse(localStorage.getItem("estadosReporteDemo") || "{}");
  const accionesGuardadas = () => JSON.parse(localStorage.getItem("accionesCampoDemo") || "[]");

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

  const mostrarAlerta = (tipo, mensajes) => {
    alerta.className = `alert show ${tipo}`;
    alerta.innerHTML = Array.isArray(mensajes) ? mensajes.join("<br>") : mensajes;
  };

  const cargarSelect = () => {
    const casos = obtenerCasos();
    casoSelect.innerHTML = `<option value="">Seleccione un caso</option>` + casos.map(caso => `
      <option value="${caso.id}">${caso.id} · ${caso.tipo} · ${caso.zona}</option>
    `).join("");

    const params = new URLSearchParams(window.location.search);
    const casoUrl = params.get("caso");
    if (casoUrl && casos.some(caso => caso.id === casoUrl)) casoSelect.value = casoUrl;
  };

  const renderDetalle = () => {
    const caso = obtenerCasos().find(item => item.id === casoSelect.value);

    if (!caso) {
      detalleCaso.innerHTML = `<p class="empty-state">Seleccione un caso para ver el detalle antes de guardar.</p>`;
      return;
    }

    detalleCaso.innerHTML = `
      <h3>${caso.id}</h3>
      <p>${caso.descripcion}</p>
      <div class="detail-list">
        <div><strong>Zona:</strong><br>${caso.zona}</div>
        <div><strong>Tipo:</strong><br>${caso.tipo}</div>
        <div><strong>Estado actual:</strong><br><span class="badge ${normalizar(caso.estado)}">${caso.estado}</span></div>
        <div><strong>Prioridad:</strong><br><span class="badge ${normalizar(caso.prioridad)}">${caso.prioridad}</span></div>
      </div>
      <div class="case-route">
        <div class="route-item"><span>✓</span>El registro actualizará el estado de este caso</div>
      </div>
    `;
  };

  const renderHistorial = () => {
    const acciones = [...data.accionesCampo, ...accionesGuardadas()]
      .filter(accion => !casoSelect.value || accion.reporteId === casoSelect.value)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    if (!acciones.length) {
      historial.innerHTML = `<div class="empty-state">Todavía no hay acciones registradas para este caso.</div>`;
      return;
    }

    historial.innerHTML = acciones.map(accion => `
      <article class="timeline-card">
        <span>${accion.fecha}</span>
        <h3>${accion.tipoAccion}</h3>
        <p>${accion.descripcion}</p>
        <small>Estado dejado: ${accion.estadoResultado} · Evidencia: ${accion.imagenEvidencia}</small>
      </article>
    `).join("");
  };

  const validar = () => {
    const errores = [];
    const descripcion = document.querySelector("#descripcionAccion").value.trim();

    if (!casoSelect.value) errores.push("Seleccione el caso atendido.");
    if (!document.querySelector("#tipoAccion").value) errores.push("Seleccione el tipo de acción realizada.");
    if (!fecha.value) errores.push("Indique la fecha de la atención.");
    if (descripcion.length < 10) errores.push("La descripción debe tener al menos 10 caracteres.");
    if (!document.querySelector("#estadoResultado").value) errores.push("Seleccione el estado en el que queda el caso.");

    return errores;
  };

  form.addEventListener("submit", event => {
    event.preventDefault();
    const errores = validar();

    if (errores.length) {
      mostrarAlerta("error", errores);
      return;
    }

    const evidencia = evidenciaInput.files[0];
    const nuevasAcciones = accionesGuardadas();
    const tipoAccion = document.querySelector("#tipoAccion").value;
    const estadoResultado = document.querySelector("#estadoResultado").value;

    nuevasAcciones.push({
      id: Date.now(),
      asignacionId: Number(data.asignaciones.find(item => item.reporteId === casoSelect.value).id),
      reporteId: casoSelect.value,
      tipoAccion,
      descripcion: document.querySelector("#descripcionAccion").value.trim(),
      fecha: fecha.value,
      estadoResultado,
      imagenEvidencia: evidencia ? evidencia.name : "Sin adjunto"
    });

    const estados = estadosGuardados();
    estados[casoSelect.value] = estadoResultado;

    localStorage.setItem("accionesCampoDemo", JSON.stringify(nuevasAcciones));
    localStorage.setItem("estadosReporteDemo", JSON.stringify(estados));

    mostrarAlerta("ok", "Acción registrada correctamente. El cambio queda guardado en el navegador para la demo.");
    form.reset();
    archivoNombre.textContent = "Puede adjuntar una foto si la tiene disponible.";
    fecha.value = new Date().toISOString().slice(0, 10);
    cargarSelect();
    renderDetalle();
    renderHistorial();
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      alerta.className = "alert";
      archivoNombre.textContent = "Puede adjuntar una foto si la tiene disponible.";
      renderDetalle();
      renderHistorial();
    }, 0);
  });

  casoSelect.addEventListener("change", () => {
    renderDetalle();
    renderHistorial();
  });

  evidenciaInput.addEventListener("change", () => {
    const archivo = evidenciaInput.files[0];
    archivoNombre.textContent = archivo ? `Archivo seleccionado: ${archivo.name}` : "Puede adjuntar una foto si la tiene disponible.";
  });

  cargarSelect();
  renderDetalle();
  renderHistorial();
});
