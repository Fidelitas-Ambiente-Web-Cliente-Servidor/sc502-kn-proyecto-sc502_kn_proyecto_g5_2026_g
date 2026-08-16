<section class="page-hero mvc-hero mvc-login-hero">
  <div>
    <span class="tag">Acceso al sistema</span>
    <h1>Restablecer contraseña</h1>
    <p>Ingrese el código de recuperación que se generó para su correo y elija una nueva contraseña.</p>
  </div>
</section>

<section class="mvc-login-wrap">
  <form action="<?= url('auth', 'resetPassword') ?>" method="post" class="card panel-card stack mvc-login-card">
    <?= csrf_field() ?>

    <div class="field">
      <label for="email">Correo electrónico</label>
      <input
        id="email"
        type="email"
        name="email"
        required
        autocomplete="username"
        placeholder="usuario@correo.com"
      >
    </div>

    <div class="field">
      <label for="token">Código de recuperación</label>
      <input
        id="token"
        type="text"
        name="token"
        required
        placeholder="Código recibido"
      >
    </div>

    <div class="field">
      <label for="password">Nueva contraseña</label>
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
      <label for="confirmar_password">Confirmar nueva contraseña</label>
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

    <button class="btn btn-glow" type="submit">Restablecer contraseña</button>
    <a class="btn secondary" href="<?= url('auth', 'forgotPassword') ?>">Solicitar un nuevo código</a>
  </form>
</section>