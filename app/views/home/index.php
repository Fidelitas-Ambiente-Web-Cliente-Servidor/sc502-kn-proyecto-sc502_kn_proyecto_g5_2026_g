<section class="page-hero mvc-hero">
  <div>
    <span class="tag">Sistema web multirol</span>
    <h1>DengueReporte CR</h1>
    <p>Plataforma para registrar focos de riesgo, coordinar la atención de casos, documentar acciones de campo y consultar información para la toma de decisiones.</p>

    <div class="mvc-home-actions">
      <?php if (Auth::check() && $moduleUrl): ?>
        <a class="btn btn-glow" href="<?= e($moduleUrl) ?>"><?= e($moduleLabel) ?></a>
      <?php else: ?>
        <a class="btn btn-glow" href="<?= url('auth', 'login') ?>">Iniciar sesión</a>
      <?php endif; ?>
    </div>
  </div>
</section>

<section class="mvc-section-heading">
  <span class="eyebrow">Módulos del sistema</span>
  <h2>Un mismo flujo para reportar, atender y dar seguimiento</h2>
</section>

<section class="module-grid mvc-module-grid">
  <article class="module-card">
    <h3>Reportes ciudadanos</h3>
    <p>Registro de focos de riesgo con ubicación, descripción, fotografías y consulta del estado del caso.</p>
  </article>

  <article class="module-card">
    <h3>Gestión de casos</h3>
    <p>Revisión, validación, priorización y asignación de reportes para la atención institucional.</p>
  </article>

  <article class="module-card">
    <h3>Seguimiento de campo</h3>
    <p>Asignaciones del brigadista, ubicación del caso, acciones realizadas, evidencia e historial.</p>
  </article>

  <article class="module-card">
    <h3>Estadísticas</h3>
    <p>Indicadores por estado, zona, mes y tipo de foco, con filtros y exportación de datos.</p>
  </article>
</section>
