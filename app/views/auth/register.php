<section class="page-hero mvc-hero mvc-login-hero">
  <div>
    <span class="tag">Crear cuenta</span>
    <h1>Registro de ciudadano</h1>
    <p>Regístrese con su correo electrónico para reportar focos de riesgo y dar seguimiento a sus casos.</p>
  </div>
</section>

<section class="mvc-login-wrap">
  <form action="<?= url('auth', 'register') ?>" method="post" class="card panel-card stack mvc-login-card">
    <?= csrf_field() ?>

    <div class="field">
      <label for="nombre">Nombre completo</label>
      <input
        id="nombre"
        type="text"
        name="nombre"
        value="<?= e($nombre ?? '') ?>"
        required
        minlength="3"
        autocomplete="name"
        placeholder="Nombre y apellidos"
      >
    </div>

    <div class="field">
      <label for="email">Correo electrónico</label>
      <input
        id="email"
        type="email"
        name="email"
        value="<?= e($email ?? '') ?>"
        required
        autocomplete="username"
        placeholder="usuario@correo.com"
      >
    </div>

    <div class="field">
      <label for="password">Contraseña</label>
      <input
        id="password"
        type="password"
        name="password"
        required
        minlength="6"
        autocomplete="new-password"
        placeholder="Mínimo 6 caracteres"
      >
    </div>

    <div class="field">
      <label for="confirmar_password">Confirmar contraseña</label>
      <input
        id="confirmar_password"
        type="password"
        name="confirmar_password"
        required
        minlength="6"
        autocomplete="new-password"
        placeholder="Repita la contraseña"
      >
    </div>

    <button class="btn btn-glow" type="submit">Crear cuenta</button>
    <a class="btn secondary" href="<?= url('auth', 'login') ?>">Ya tengo cuenta</a>
  </form>
</section>