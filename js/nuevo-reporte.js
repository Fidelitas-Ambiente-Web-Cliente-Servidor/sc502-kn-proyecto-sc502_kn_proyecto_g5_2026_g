document.addEventListener("DOMContentLoaded", () => {
  const data = window.DengueData;
  const usuarioActualId = 1;
  const nombreCiudadano = "María Rojas";

  const form = document.querySelector("#formReporte");
  const tipoFoco = document.querySelector("#tipoFoco");
  const ubicacionTexto = document.querySelector("#ubicacionTexto");
  const descripcion = document.querySelector("#descripcionReporte");
  const fotoInput = document.querySelector("#fotoReporte");
  const archivoNombre = document.querySelector("#archivoNombreReporte");
  const alerta = document.querySelector("#mensajeForm");

  let mapa = null;
  let marcador = null;
  let puntoSeleccionado = null;

  const reportesGuardados = () => JSON.parse(localStorage.getItem("reportesNuevosDemo") || "[]");
  const notificacionesGuardadas = () => JSON.parse(localStorage.getItem("notificacionesNuevasDemo") || "[]");

  const mostrarAlerta = (tipo, mensajes) => {
    alerta.className = `alert show ${tipo}`;
    alerta.innerHTML = Array.isArray(mensajes) ? mensajes.join("<br>") : mensajes;
  };

  const cargarTiposFoco = () => {
    tipoFoco.innerHTML = `<option value="">Seleccione</option>` + data.tiposFoco.map(tipo => `
      <option value="${tipo.id}">${tipo.nombre}</option>
    `).join("");
  };

  // Determina la zona municipal más cercana al punto marcado, comparando distancia recta simple
  const zonaMasCercana = (lat, lng) => {
    let masCercana = data.zonas[0];
    let menorDistancia = Infinity;

    data.zonas.forEach(zona => {
      const distancia = Math.hypot(zona.latitud - lat, zona.longitud - lng);
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        masCercana = zona;
      }
    });

    return masCercana;
  };

  const inicializarMapa = () => {
    if (!window.L) {
      document.querySelector("#mapaNuevoReporte").innerHTML = "No se pudo cargar el mapa.";
      return;
    }

    mapa = L.map("mapaNuevoReporte").setView([9.9350, -84.0500], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(mapa);

    mapa.on("click", evento => {
      puntoSeleccionado = evento.latlng;

      if (marcador) marcador.remove();
      marcador = L.marker(puntoSeleccionado).addTo(mapa);
      marcador.bindPopup("Foco de riesgo aquí").openPopup();

      ubicacionTexto.value = `Lat ${puntoSeleccionado.lat.toFixed(4)}, Lng ${puntoSeleccionado.lng.toFixed(4)}`;
    });

    setTimeout(() => mapa.invalidateSize(), 150);
  };

  const generarIdReporte = () => {
    const totalExistentes = data.reportes.length + reportesGuardados().length;
    const consecutivo = String(totalExistentes + 1).padStart(3, "0");
    return `REP-2026-${consecutivo}`;
  };

  const nombreMes = fecha => fecha.toLocaleDateString("es-CR", { month: "long" }).replace(/^\w/, letra => letra.toUpperCase());

  const validar = () => {
    const errores = [];

    if (!tipoFoco.value) errores.push("Seleccione el tipo de foco de riesgo.");
    if (descripcion.value.trim().length < 10) errores.push("La descripción debe tener al menos 10 caracteres.");
    if (!puntoSeleccionado) errores.push("Marque la ubicación del foco de riesgo en el mapa.");

    return errores;
  };

  form.addEventListener("submit", event => {
    event.preventDefault();
    const errores = validar();

    if (errores.length) {
      mostrarAlerta("error", errores);
      return;
    }

    const tipo = data.tiposFoco.find(item => item.id === Number(tipoFoco.value));
    const zona = zonaMasCercana(puntoSeleccionado.lat, puntoSeleccionado.lng);
    const foto = fotoInput.files[0];
    const hoy = new Date();
    const idReporte = generarIdReporte();

    const nuevoReporte = {
      id: idReporte,
      usuarioId: usuarioActualId,
      ciudadano: nombreCiudadano,
      zonaId: zona.id,
      zona: zona.nombre,
      tipoFocoId: tipo.id,
      tipo: tipo.nombre,
      estado: "Pendiente",
      prioridad: "Media",
      descripcion: descripcion.value.trim(),
      latitud: puntoSeleccionado.lat,
      longitud: puntoSeleccionado.lng,
      fechaCreacion: hoy.toISOString().slice(0, 10),
      mes: nombreMes(hoy),
      tiempoResolucionHoras: 0,
      imagenReporte: foto ? foto.name : "Sin adjunto"
    };

    const reportes = reportesGuardados();
    reportes.push(nuevoReporte);
    localStorage.setItem("reportesNuevosDemo", JSON.stringify(reportes));

    const notificaciones = notificacionesGuardadas();
    notificaciones.push({
      id: Date.now(),
      usuarioId: usuarioActualId,
      reporteId: idReporte,
      mensaje: `Su reporte ${idReporte} fue recibido y está pendiente de revisión.`,
      leida: false,
      fecha: hoy.toISOString().slice(0, 10)
    });
    localStorage.setItem("notificacionesNuevasDemo", JSON.stringify(notificaciones));

    mostrarAlerta("ok", `Reporte ${idReporte} enviado correctamente. Puede darle seguimiento desde "Mis Reportes".`);
    form.reset();
    archivoNombre.textContent = "Puede adjuntar una foto del foco de riesgo.";
    ubicacionTexto.value = "";
    puntoSeleccionado = null;
    if (marcador) { marcador.remove(); marcador = null; }

    setTimeout(() => { window.location.href = "mis-reportes.html"; }, 1600);
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      alerta.className = "alert";
      archivoNombre.textContent = "Puede adjuntar una foto del foco de riesgo.";
      ubicacionTexto.value = "";
      puntoSeleccionado = null;
      if (marcador) { marcador.remove(); marcador = null; }
    }, 0);
  });

  fotoInput.addEventListener("change", () => {
    const archivo = fotoInput.files[0];
    archivoNombre.textContent = archivo ? `Archivo seleccionado: ${archivo.name}` : "Puede adjuntar una foto del foco de riesgo.";
  });

  cargarTiposFoco();
  inicializarMapa();
});