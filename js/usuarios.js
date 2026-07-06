document.addEventListener("DOMContentLoaded", () => {
  const data = window.DengueData;
  const tabla = document.querySelector("#tablaUsuarios tbody");
  const filtroRol = document.querySelector("#filtroRol");
  const resumen = document.querySelector("#resumenUsuarios");
  const usuarioActivo = document.querySelector("#usuarioActivo");

  const normalizar = texto => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");

  const nombreRol = rolId => {
    const rol = data.roles.find(item => item.id === rolId);
    return rol ? rol.nombre : "sin rol";
  };

  const nombreZona = zonaId => {
    const zona = data.zonas.find(item => item.id === zonaId);
    return zona ? zona.nombre : "Sin zona";
  };

  const cargarUsuarioSesion = () => {
    const guardado = JSON.parse(localStorage.getItem("usuarioActualDemo") || "null");
    if (guardado) usuarioActivo.textContent = guardado.nombre;
  };

  const cargarFiltroRol = () => {
    filtroRol.innerHTML = `<option value="todos">Todos</option>` + data.roles.map(rol => `
      <option value="${rol.id}">${rol.nombre.charAt(0).toUpperCase() + rol.nombre.slice(1)}</option>
    `).join("");
  };

  const filtrarUsuarios = () => {
    const rol = filtroRol.value;
    return data.usuarios.filter(usuario => rol === "todos" || String(usuario.rolId) === rol);
  };

  const renderResumen = () => {
    const total = data.usuarios.length;
    const activos = data.usuarios.filter(u => u.activo).length;
    const inactivos = total - activos;
    const administradores = data.usuarios.filter(u => nombreRol(u.rolId) === "administrador").length;

    resumen.innerHTML = `
      <div class="stat-card"><span class="stat-icon">USR</span><small>Total usuarios</small><strong>${total}</strong></div>
      <div class="stat-card"><span class="stat-icon">ACT</span><small>Activos</small><strong>${activos}</strong></div>
      <div class="stat-card"><span class="stat-icon">INA</span><small>Inactivos</small><strong>${inactivos}</strong></div>
      <div class="stat-card"><span class="stat-icon">ADM</span><small>Administradores</small><strong>${administradores}</strong></div>
    `;
  };

  const renderTabla = () => {
    const usuarios = filtrarUsuarios();

    if (!usuarios.length) {
      tabla.innerHTML = `<tr><td colspan="5"><div class="empty-state">No hay usuarios con ese rol.</div></td></tr>`;
      return;
    }

    tabla.innerHTML = usuarios.map(usuario => `
      <tr>
        <td><strong>${usuario.nombre}</strong></td>
        <td>${usuario.email}</td>
        <td><span class="badge ${normalizar(nombreRol(usuario.rolId))}">${nombreRol(usuario.rolId)}</span></td>
        <td>${nombreZona(usuario.zonaId)}</td>
        <td><span class="badge ${usuario.activo ? "activo" : "inactivo"}">${usuario.activo ? "Activo" : "Inactivo"}</span></td>
      </tr>
    `).join("");
  };

  filtroRol.addEventListener("change", renderTabla);

  cargarUsuarioSesion();
  cargarFiltroRol();
  renderResumen();
  renderTabla();
});