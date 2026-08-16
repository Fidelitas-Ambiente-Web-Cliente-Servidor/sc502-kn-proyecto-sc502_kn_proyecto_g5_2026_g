<?php
$user = Auth::user();
$role = Auth::role();
$errorFlash = flash('error');
$okFlash = flash('ok');
$currentController = strtolower($_GET['controller'] ?? 'home');
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title><?= e($pageTitle) ?> | DengueReporte CR</title>
  <link rel="stylesheet" href="<?= legacy_url('css/style.css') ?>">
  <link rel="stylesheet" href="<?= asset('css/app.css') ?>">
</head>
<body>
<div class="gov-strip">
  <div class="container">
    <div class="gov-left">
      <span>DengueReporte CR</span>
    </div>
    <div class="gov-right">
      <?php if ($user): ?>
        <span><?= e($user['nombre']) ?> · <?= e(ucfirst($role)) ?></span>
        <a class="gov-link" href="<?= url('auth', 'logout') ?>">Cerrar sesión</a>
      <?php endif; ?>
    </div>
  </div>
</div>

<header class="site-header">
  <div class="container main-header">
    <a class="brand" href="<?= url('home', 'index') ?>">
      <span class="brand-mark">DR</span>
      <span class="brand-text">
        <strong>DengueReporte CR</strong>
        <small>Reporte y seguimiento de dengue y plagas urbanas</small>
      </span>
    </a>
  </div>

  <nav class="main-nav">
    <div class="container nav-inner">
      <div class="nav-links">
        <a href="<?= url('home', 'index') ?>">Inicio</a>

        <?php if (!$user && $currentController !== 'auth'): ?>
          <a href="<?= url('auth', 'login') ?>">Iniciar sesión</a>
        <?php elseif ($role === 'ciudadano'): ?>
          <a href="<?= url('ciudadano', 'misReportes') ?>">Mis reportes</a>
          <a href="<?= url('ciudadano', 'nuevoReporte') ?>">Nuevo reporte</a>
          <a href="<?= url('ciudadano', 'notificaciones') ?>">Notificaciones</a>
        <?php elseif ($role === 'brigadista'): ?>
          <a href="<?= url('brigadista', 'asignaciones') ?>">Mis asignaciones</a>
        <?php elseif ($role === 'inspector'): ?>
          <a href="<?= legacy_url('inspector/bandeja.html') ?>">Gestión de casos</a>
          <a href="<?= url('inspector', 'zonas') ?>">Zonas de riesgo</a>
        <?php elseif ($role === 'administrador'): ?>
          <a href="<?= legacy_url('admin/dashboard.html') ?>">Panel administrativo</a>
          <a href="<?= url('estadisticas', 'index') ?>">Estadísticas</a>
        <?php endif; ?>
      </div>
    </div>
  </nav>
</header>

<main class="page-shell">
  <div class="container">
    <?php if ($errorFlash): ?>
      <div class="alert error show flash"><?= e($errorFlash) ?></div>
    <?php endif; ?>
    <?php if ($okFlash): ?>
      <div class="alert ok show flash"><?= e($okFlash) ?></div>
    <?php endif; ?>