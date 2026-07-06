document.addEventListener("DOMContentLoaded", () => {
  const data = window.DengueData;
  const usuarioActualId = 1;
  const tabla = document.querySelector("#tablaReportes tbody");
  const filtroEstado = document.querySelector("#filtroEstado");
  const resumen = document.querySelector("#resumenReportes");

  const normalizar = texto => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");

  // Reportes nuevos creados desde nuevo-reporte.html (se guardan aparte para no tocar datos.js)
  const reportesGuardados = () => JSON.parse(localStorage.getItem("reportesNuevosDemo") || "[]");

  // Estados actualizados por brigadistas/inspectores durante la demo (ver asignaciones.js / registrar-accion.js)
  const estadosGuardados = () => JSON.parse(localStorage.getItem("estadosReporteDemo") || "{}");

  const obtenerMisReportes = () => {
    const estados = estadosGuardados();
    const todos = [...data.reportes, ...reportesGuardados()];

    return todos
      .filter(reporte => reporte.usuarioId === usuarioActualId)
      .map(reporte => ({
        ...reporte,
        estado: estados[reporte.id] || reporte.estado
      }))
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
  };

  const filtrarReportes = () => {
    const estado = filtroEstado.value;
    return obtenerMisReportes().filter(reporte => estado === "todos" || reporte.estado === estado);
  };

  const renderResumen = () => {
    const todos = obtenerMisReportes();
    const pendientes = todos.filter(reporte => reporte.estado === "Pendiente").length;
    const enProceso = todos.filter(reporte => reporte.estado === "Asignado" || reporte.estado === "En atención").length;
    const resueltos = todos.filter(reporte => reporte.estado === "Resuelto").length;

    resumen.innerHTML = `
      <div class="stat-card"><span class="stat-icon">TOT</span><small>Total de reportes</small><strong>${todos.length}</strong></div>
      <div class="stat-card"><span class="stat-icon">PEN</span><small>Pendientes</small><strong>${pendientes}</strong></div>
      <div class="stat-card"><span class="stat-icon">PRO</span><small>En proceso</small><strong>${enProceso}</strong></div>
      <div class="stat-card"><span class="stat-icon">RES</span><small>Resueltos</small><strong>${resueltos}</strong></div>
    `;
  };

  const renderTabla = () => {
    const reportes = filtrarReportes();

    if (!reportes.length) {
      tabla.innerHTML = `<tr><td colspan="7"><div class="empty-state">No tiene reportes con ese estado todavía.</div></td></tr>`;
      return;
    }

    tabla.innerHTML = reportes.map(reporte => `
      <tr>
        <td><strong>${reporte.id}</strong></td>
        <td><span class="badge ${normalizar(reporte.tipo)}">${reporte.tipo}</span></td>
        <td>${reporte.zona}</td>
        <td><span class="badge ${normalizar(reporte.prioridad)}">${reporte.prioridad}</span></td>
        <td><span class="badge ${normalizar(reporte.estado)}">${reporte.estado}</span></td>
        <td>${reporte.fechaCreacion}</td>
        <td>${reporte.descripcion}</td>
      </tr>
    `).join("");
  };

  const actualizarVista = () => {
    renderResumen();
    renderTabla();
  };

  filtroEstado.addEventListener("change", actualizarVista);

  actualizarVista();
});