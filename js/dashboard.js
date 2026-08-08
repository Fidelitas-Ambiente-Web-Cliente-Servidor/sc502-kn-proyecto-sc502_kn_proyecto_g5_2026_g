document.addEventListener("DOMContentLoaded", () => {
  const data = window.DengueData;
  const resumen = document.querySelector("#resumenDashboard");
  const tabla = document.querySelector("#tablaUltimosReportes tbody");
  const lectura = document.querySelector("#lecturaDashboard");
  const detalleLectura = document.querySelector("#detalleLecturaDashboard");
  const usuarioActivo = document.querySelector("#usuarioActivo");

  const normalizar = texto => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  const estadosGuardados = () => JSON.parse(localStorage.getItem("estadosReporteDemo") || "{}");

  const obtenerReportes = () => {
    const estados = estadosGuardados();
    return data.reportes.map(reporte => ({
      ...reporte,
      estado: estados[reporte.id] || reporte.estado
    }));
  };

  const cargarUsuarioSesion = () => {
    const guardado = JSON.parse(localStorage.getItem("usuarioActualDemo") || "null");
    if (guardado) usuarioActivo.textContent = guardado.nombre;
  };

  const renderResumen = () => {
    const reportes = obtenerReportes();
    const total = reportes.length;
    const pendientes = reportes.filter(r => r.estado === "Pendiente").length;
    const resueltos = reportes.filter(r => r.estado === "Resuelto").length;
    const brigadistasActivos = data.brigadistas.filter(b => b.disponible).length;

    resumen.innerHTML = `
      <div class="stat-card"><span class="stat-icon">TOT</span><small>Total reportes</small><strong>${total}</strong></div>
      <div class="stat-card"><span class="stat-icon">PEN</span><small>Pendientes</small><strong>${pendientes}</strong></div>
      <div class="stat-card"><span class="stat-icon">RES</span><small>Resueltos</small><strong>${resueltos}</strong></div>
      <div class="stat-card"><span class="stat-icon">BRI</span><small>Brigadistas activos</small><strong>${brigadistasActivos}</strong></div>
    `;
  };

  const renderTabla = () => {
    const ultimos = [...obtenerReportes()]
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
      .slice(0, 5);

    if (!ultimos.length) {
      tabla.innerHTML = `<tr><td colspan="6"><div class="empty-state">Todavía no hay reportes registrados.</div></td></tr>`;
      return;
    }

    tabla.innerHTML = ultimos.map(reporte => `
      <tr>
        <td><strong>${reporte.id}</strong></td>
        <td>${reporte.ciudadano}</td>
        <td>${reporte.zona}</td>
        <td><span class="badge ${normalizar(reporte.tipo)}">${reporte.tipo}</span></td>
        <td><span class="badge ${normalizar(reporte.estado)}">${reporte.estado}</span></td>
        <td>${reporte.fechaCreacion}</td>
      </tr>
    `).join("");
  };

  const renderLectura = () => {
    const reportes = obtenerReportes();
    const pendientes = reportes.filter(r => r.estado === "Pendiente").length;
    const altaPrioridad = reportes.filter(r => r.prioridad === "Alta" && r.estado !== "Resuelto").length;

    if (altaPrioridad > 0) {
      lectura.textContent = `${altaPrioridad} caso(s) de alta prioridad sin resolver`;
      detalleLectura.textContent = "Se recomienda revisar la asignación de brigadas para estos casos cuanto antes.";
    } else if (pendientes > 0) {
      lectura.textContent = `${pendientes} reporte(s) esperando asignación`;
      detalleLectura.textContent = "No hay casos críticos activos, pero conviene asignar los reportes pendientes.";
    } else {
      lectura.textContent = "Sin reportes pendientes";
      detalleLectura.textContent = "Todos los reportes registrados ya fueron asignados o resueltos.";
    }
  };

  cargarUsuarioSesion();
  renderResumen();
  renderTabla();
  renderLectura();
});