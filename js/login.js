// Login del sistema: valida el formulario y redirige segun el rol del usuario

document.addEventListener("DOMContentLoaded", () => {
  const data = window.DengueData;
  const form = document.querySelector("#formLogin");
  const email = document.querySelector("#loginEmail");
  const password = document.querySelector("#loginPassword");
  const alerta = document.querySelector("#mensajeLogin");
  const tablaPrueba = document.querySelector("#tablaUsuariosPrueba tbody");

  const normalizar = texto => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");

  // A donde va cada rol despues de iniciar sesion (rolId de datos.js)
  const rutaPorRol = {
    1: "ciudadano/mis-reportes.html",
    2: "brigadista/asignaciones.html",
    3: "inspector/bandeja.html",
    4: "admin/dashboard.html"
  };

  const nombreRol = rolId => {
    const rol = data.roles.find(item => item.id === rolId);
    return rol ? rol.nombre : "sin rol";
  };

  const mostrarAlerta = (tipo, mensajes) => {
    alerta.className = `alert show ${tipo}`;
    alerta.innerHTML = Array.isArray(mensajes) ? mensajes.join("<br>") : mensajes;
  };

  const validar = () => {
    const errores = [];
    const correo = email.value.trim();
    const clave = password.value;
    const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correo) errores.push("Ingrese su correo electrónico.");
    else if (!patronCorreo.test(correo)) errores.push("El formato del correo electrónico no es válido.");

    if (!clave) errores.push("Ingrese su contraseña.");
    else if (clave.length < 4) errores.push("La contraseña debe tener al menos 4 caracteres.");

    return errores;
  };

  // Tabla de "usuarios de prueba" en el index, con boton para autocompletar el form
  const renderUsuariosPrueba = () => {
    tablaPrueba.innerHTML = data.usuarios.map(usuario => `
      <tr>
        <td><strong>${usuario.nombre}</strong></td>
        <td>${usuario.email}</td>
        <td><span class="badge ${normalizar(nombreRol(usuario.rolId))}">${nombreRol(usuario.rolId)}</span></td>
        <td><span class="badge ${usuario.activo ? "resuelto" : "rechazado"}">${usuario.activo ? "Activo" : "Inactivo"}</span></td>
        <td><button class="btn secondary" type="button" data-usar="${usuario.email}">Usar</button></td>
      </tr>
    `).join("");
  };

  form.addEventListener("submit", event => {
    event.preventDefault();
    const errores = validar();

    if (errores.length) {
      mostrarAlerta("error", errores);
      return;
    }

    const correo = email.value.trim().toLowerCase();
    const usuario = data.usuarios.find(item => item.email.toLowerCase() === correo);

    if (!usuario) {
      mostrarAlerta("error", "No existe una cuenta con ese correo electrónico.");
      return;
    }

    if (!usuario.activo) {
      mostrarAlerta("error", "Esta cuenta está inactiva. Contacte al administrador.");
      return;
    }

    const ruta = rutaPorRol[usuario.rolId];

    if (!ruta) {
      mostrarAlerta("error", "El usuario no tiene un rol válido asignado.");
      return;
    }

    // No hay backend todavia: la sesion se guarda local solo para la demo
    localStorage.setItem("usuarioActualDemo", JSON.stringify({ id: usuario.id, nombre: usuario.nombre, rolId: usuario.rolId }));
    mostrarAlerta("ok", `Bienvenido, ${usuario.nombre}. Redirigiendo a ${nombreRol(usuario.rolId)}...`);

    setTimeout(() => { window.location.href = ruta; }, 900);
  });

  form.addEventListener("reset", () => {
    setTimeout(() => { alerta.className = "alert"; }, 0);
  });

  tablaPrueba.addEventListener("click", event => {
    const boton = event.target.closest("[data-usar]");
    if (!boton) return;

    email.value = boton.dataset.usar;
    password.value = "demo1234";
    email.focus();
  });

  renderUsuariosPrueba();
});