document.addEventListener("DOMContentLoaded", () => {
  const data = window.DengueData;
  const resumen = document.querySelector("#resumenEstadisticas");
  const filtroZona = document.querySelector("#filtroZona");
  const filtroMes = document.querySelector("#filtroMes");
  const btnExportar = document.querySelector("#btnExportar");
  const zonaCritica = document.querySelector("#zonaCritica");
  const rankingZonas = document.querySelector("#rankingZonas");
  const lecturaSistema = document.querySelector("#lecturaSistema");
  const detalleLectura = document.querySelector("#detalleLectura");

  let charts = [];

  const estadosGuardados = () => JSON.parse(localStorage.getItem("estadosReporteDemo") || "{}");

  const reportesBase = () => {
    const estados = estadosGuardados();
    return data.reportes.map(reporte => ({
      ...reporte,
      estado: estados[reporte.id] || reporte.estado
    }));
  };

  const cargarFiltros = () => {
    const zonas = [...new Set(data.reportes.map(reporte => reporte.zona))];
    const meses = [...new Set(data.reportes.map(reporte => reporte.mes))];

    filtroZona.innerHTML = `<option value="todas">Todas las zonas</option>` + zonas.map(zona => `<option value="${zona}">${zona}</option>`).join("");
    filtroMes.innerHTML = `<option value="todos">Todos los meses</option>` + meses.map(mes => `<option value="${mes}">${mes}</option>`).join("");
  };

  const obtenerFiltrados = () => {
    const zona = filtroZona.value;
    const mes = filtroMes.value;

    return reportesBase().filter(reporte => {
      const coincideZona = zona === "todas" || reporte.zona === zona;
      const coincideMes = mes === "todos" || reporte.mes === mes;
      return coincideZona && coincideMes;
    });
  };

  const contarPor = (lista, campo) => {
    return lista.reduce((acum, item) => {
      acum[item[campo]] = (acum[item[campo]] || 0) + 1;
      return acum;
    }, {});
  };

  const renderResumen = reportes => {
    const total = reportes.length;
    const pendientes = reportes.filter(item => item.estado === "Pendiente").length;
    const activos = reportes.filter(item => ["Asignado", "En atención"].includes(item.estado)).length;
    const resueltos = reportes.filter(item => item.estado === "Resuelto");
    const promedio = resueltos.length
      ? Math.round(resueltos.reduce((suma, item) => suma + item.tiempoResolucionHoras, 0) / resueltos.length)
      : 0;

    resumen.innerHTML = `
      <div class="stat-card"><span class="stat-icon">REP</span><small>Total de reportes</small><strong>${total}</strong></div>
      <div class="stat-card"><span class="stat-icon">⏳</span><small>Pendientes</small><strong>${pendientes}</strong></div>
      <div class="stat-card"><span class="stat-icon">🧭</span><small>En proceso</small><strong>${activos}</strong></div>
      <div class="stat-card"><span class="stat-icon">⚡</span><small>Prom. resolución</small><strong>${promedio}h</strong></div>
    `;
  };

  const renderInsights = reportes => {
    const zonas = contarPor(reportes, "zona");
    const ordenadas = Object.entries(zonas).sort((a, b) => b[1] - a[1]);
    const mayor = ordenadas[0];
    const max = mayor ? mayor[1] : 0;
    const pendientes = reportes.filter(item => item.estado === "Pendiente").length;
    const alta = reportes.filter(item => item.prioridad === "Alta").length;

    zonaCritica.textContent = mayor ? `${mayor[0]} (${mayor[1]} reportes)` : "Sin reportes";

    rankingZonas.innerHTML = ordenadas.length
      ? ordenadas.map(([zona, cantidad]) => `
          <div class="ranking-item">
            <div><span>${zona}</span><span>${cantidad}</span></div>
            <div class="ranking-bar"><span style="width:${max ? (cantidad / max) * 100 : 0}%"></span></div>
          </div>
        `).join("")
      : `<div class="empty-state">No hay datos para este filtro.</div>`;

    if (!reportes.length) {
      lecturaSistema.textContent = "Sin datos para mostrar";
      detalleLectura.textContent = "Cambie los filtros para revisar otro grupo de reportes.";
      return;
    }

    if (alta >= 2 || pendientes >= 2) {
      lecturaSistema.textContent = "Atención prioritaria";
      detalleLectura.textContent = "Hay varios reportes pendientes o de prioridad alta. Se recomienda reforzar el seguimiento de campo.";
      return;
    }

    lecturaSistema.textContent = "Carga controlada";
    detalleLectura.textContent = "La mayoría de casos están asignados, en atención o resueltos dentro de la muestra disponible.";
  };

  const crearChart = (idCanvas, tipo, titulo, datos) => {
    const ctx = document.getElementById(idCanvas);
    const labels = Object.keys(datos);
    const valores = Object.values(datos);

    return new Chart(ctx, {
      type: tipo,
      data: {
        labels,
        datasets: [{
          label: titulo,
          data: valores,
          borderWidth: 3,
          tension: 0.35,
          fill: tipo === "line",
          backgroundColor: ["#0b3f8a", "#00a6d6", "#f5c542", "#d94848", "#2f9e44", "#687487"],
          borderColor: tipo === "line" ? "#0b3f8a" : "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: tipo !== "bar",
            labels: { boxWidth: 14, usePointStyle: true }
          },
          title: {
            display: true,
            text: titulo,
            font: { size: 16, weight: "bold" },
            color: "#072b62"
          }
        },
        scales: tipo === "bar" || tipo === "line" ? {
          y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: "rgba(104, 116, 135, 0.18)" } },
          x: { grid: { display: false } }
        } : {}
      }
    });
  };

  const renderCharts = reportes => {
    charts.forEach(chart => chart.destroy());
    charts = [
      crearChart("chartTipo", "bar", "Casos por tipo de foco", contarPor(reportes, "tipo")),
      crearChart("chartEstado", "doughnut", "Casos por estado", contarPor(reportes, "estado")),
      crearChart("chartMes", "line", "Casos por mes", contarPor(reportes, "mes"))
    ];
  };

  const actualizar = () => {
    const reportes = obtenerFiltrados();
    renderResumen(reportes);
    renderInsights(reportes);
    renderCharts(reportes);
  };

  const exportarCSV = () => {
    const reportes = obtenerFiltrados();
    const encabezados = ["id", "zona", "tipo", "estado", "prioridad", "fecha_creacion"];
    const filas = reportes.map(reporte => [
      reporte.id,
      reporte.zona,
      reporte.tipo,
      reporte.estado,
      reporte.prioridad,
      reporte.fechaCreacion
    ]);

    const contenido = [encabezados, ...filas]
      .map(fila => fila.map(valor => `"${String(valor).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "estadisticas_dengue_reporte.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  filtroZona.addEventListener("change", actualizar);
  filtroMes.addEventListener("change", actualizar);
  btnExportar.addEventListener("click", exportarCSV);

  cargarFiltros();
  actualizar();
});
