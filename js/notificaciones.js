document.addEventListener("DOMContentLoaded", () => {
  const data = window.DengueData;
  const usuarioActualId = 1;
  const lista = document.querySelector("#listaNotificaciones");
  const resumen = document.querySelector("#resumenNotificaciones");
  const btnMarcarTodas = document.querySelector("#btnMarcarTodas");

  // Notificaciones generadas al enviar un reporte nuevo (ver nuevo-reporte.js)
  const notificacionesNuevas = () => JSON.parse(localStorage.getItem("notificacionesNuevasDemo") || "[]");

  // Guarda qué notificaciones ya se marcaron como leídas, sin mutar los datos originales
  const leidasGuardadas = () => JSON.parse(localStorage.getItem("notificacionesLeidasDemo") || "{}");
  const guardarLeidas = leidas => localStorage.setItem("notificacionesLeidasDemo", JSON.stringify(leidas));

  const obtenerNotificaciones = () => {
    const leidas = leidasGuardadas();
    const todas = [...data.notificaciones, ...notificacionesNuevas()];

    return todas
      .filter(notificacion => notificacion.usuarioId === usuarioActualId)
      .map(notificacion => ({
        ...notificacion,
        leida: leidas[notificacion.id] !== undefined ? leidas[notificacion.id] : notificacion.leida
      }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  };

  const renderResumen = () => {
    const todas = obtenerNotificaciones();
    const noLeidas = todas.filter(notificacion => !notificacion.leida).length;

    resumen.innerHTML = `
      <div class="stat-card"><span class="stat-icon">TOT</span><small>Total de avisos</small><strong>${todas.length}</strong></div>
      <div class="stat-card"><span class="stat-icon">NUE</span><small>No leídas</small><strong>${noLeidas}</strong></div>
      <div class="stat-card"><span class="stat-icon">LEI</span><small>Leídas</small><strong>${todas.length - noLeidas}</strong></div>
    `;
  };

  const renderLista = () => {
    const notificaciones = obtenerNotificaciones();

    if (!notificaciones.length) {
      lista.innerHTML = `<div class="empty-state">No tiene notificaciones por el momento.</div>`;
      return;
    }

    lista.innerHTML = notificaciones.map(notificacion => `
      <article class="notif-card ${notificacion.leida ? "read" : "unread"}" data-notif="${notificacion.id}">
        <div class="notif-head">
          <span class="badge ${notificacion.leida ? "resuelto" : "pendiente"}">${notificacion.leida ? "Leída" : "No leída"}</span>
          <span class="notif-fecha">${notificacion.fecha}</span>
        </div>
        <p>${notificacion.mensaje}</p>
        <small>Reporte relacionado: <strong>${notificacion.reporteId}</strong></small>
      </article>
    `).join("");
  };

  const marcarTodasLeidas = () => {
    const leidas = leidasGuardadas();
    obtenerNotificaciones().forEach(notificacion => { leidas[notificacion.id] = true; });
    guardarLeidas(leidas);
    renderResumen();
    renderLista();
  };

  lista.addEventListener("click", event => {
    const tarjeta = event.target.closest("[data-notif]");
    if (!tarjeta) return;

    const leidas = leidasGuardadas();
    leidas[tarjeta.dataset.notif] = true;
    guardarLeidas(leidas);
    renderResumen();
    renderLista();
  });

  btnMarcarTodas.addEventListener("click", marcarTodasLeidas);

  renderResumen();
  renderLista();
});