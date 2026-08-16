<section class="page-hero mvc-hero mvc-login-hero">
  <div>
    <span class="tag">Acceso al sistema</span>
    <h1>Recuperar contraseña</h1>
    <p>Ingrese el correo asociado a su cuenta para generar un código temporal de recuperación.</p>
  </div>
</section>

<section class="mvc-login-wrap">
  <form action="<?= url('auth', 'forgotPassword') ?>" method="post" class="card panel-card stack mvc-login-card">
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

    <button class="btn btn-glow" type="submit">Generar código de recuperación</button>
    <a class="btn secondary" href="<?= url('auth', 'login') ?>">Volver al inicio de sesión</a>
  </form>
</section>
