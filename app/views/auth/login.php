<section class="page-hero mvc-hero mvc-login-hero">
  <div>
    <span class="tag">Acceso al sistema</span>
    <h1>Iniciar sesión</h1>
    <p>Ingrese con las credenciales asignadas para acceder al módulo correspondiente a su rol.</p>
  </div>
</section>

<section class="mvc-login-wrap">
  <form action="<?= url('auth', 'login') ?>" method="post" class="card panel-card stack mvc-login-card">
    <?= csrf_field() ?>

    <div class="field">
      <label for="email">Correo electrónico</label>
      <input
        id="email"
        type="email"
        name="email"
        value="<?= e($email ?? '') ?>"
        required
        autocomplete="username"
        placeholder="usuario@demo.cr"
      >
    </div>

    <div class="field">
      <label for="password">Contraseña</label>
      <input
        id="password"
        type="password"
        name="password"
        required
        autocomplete="current-password"
        placeholder="Contraseña"
      >
    </div>

    <button class="btn btn-glow" type="submit">Ingresar</button>

    <div class="mvc-login-links" style="display:flex; justify-content:space-between; margin-top:10px;">
      <a href="<?= url('auth', 'register') ?>">Crear cuenta</a>
      <a href="<?= url('auth', 'forgotPassword') ?>">¿Olvidó su contraseña?</a>
    </div>
  </form>
</section>