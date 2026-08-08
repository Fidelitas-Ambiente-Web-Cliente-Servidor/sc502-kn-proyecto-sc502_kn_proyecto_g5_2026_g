const roles = [
  { id: 1, nombre: "ciudadano" },
  { id: 2, nombre: "brigadista" },
  { id: 3, nombre: "inspector" },
  { id: 4, nombre: "administrador" }
];

const usuarios = [
  { id: 1, nombre: "María Rojas", email: "mrojas@demo.cr", rolId: 1, zonaId: 1, activo: true },
  { id: 2, nombre: "Carlos Méndez", email: "cmendez@demo.cr", rolId: 1, zonaId: 2, activo: true },
  { id: 3, nombre: "Juan Solano", email: "jsolano@demo.cr", rolId: 2, zonaId: 1, activo: true },
  { id: 4, nombre: "Natalia Mora", email: "nmora@demo.cr", rolId: 3, zonaId: 1, activo: true },
  { id: 5, nombre: "Admin Salud", email: "admin@demo.cr", rolId: 4, zonaId: 1, activo: true }
];

const tiposFoco = [
  { id: 1, nombre: "Dengue" },
  { id: 2, nombre: "Roedores" },
  { id: 3, nombre: "Cucarachas" },
  { id: 4, nombre: "Agua estancada" },
  { id: 5, nombre: "Otro" }
];

const estadosReporte = [
  { id: 1, nombre: "Pendiente" },
  { id: 2, nombre: "Asignado" },
  { id: 3, nombre: "En atención" },
  { id: 4, nombre: "Resuelto" },
  { id: 5, nombre: "Rechazado" }
];

const zonas = [
  { id: 1, nombre: "San Pedro", descripcion: "Zona urbana con alta circulación", latitud: 9.9333, longitud: -84.0500 },
  { id: 2, nombre: "Guadalupe", descripcion: "Sector residencial y comercial", latitud: 9.9450, longitud: -84.0530 },
  { id: 3, nombre: "Curridabat", descripcion: "Sector mixto con reportes frecuentes", latitud: 9.9117, longitud: -84.0346 },
  { id: 4, nombre: "Coronado", descripcion: "Sector con zonas verdes y quebradas", latitud: 9.9767, longitud: -84.0070 }
];

const brigadistas = [
  { id: 1, usuarioId: 3, nombre: "Juan Solano", zonaId: 1, telefono: "8888-0101", disponible: true, casosActivos: 3 },
  { id: 2, usuarioId: 6, nombre: "Andrés Vargas", zonaId: 2, telefono: "8888-0202", disponible: true, casosActivos: 2 },
  { id: 3, usuarioId: 7, nombre: "Sofía Ruiz", zonaId: 3, telefono: "8888-0303", disponible: false, casosActivos: 5 }
];

const reportes = [
  {
    id: "REP-2026-001",
    usuarioId: 1,
    ciudadano: "María Rojas",
    zonaId: 1,
    zona: "San Pedro",
    tipoFocoId: 4,
    tipo: "Agua estancada",
    estado: "Asignado",
    prioridad: "Alta",
    descripcion: "Canal frente a varias casas con agua acumulada y larvas visibles.",
    latitud: 9.9341,
    longitud: -84.0512,
    fechaCreacion: "2026-06-04",
    mes: "Junio",
    tiempoResolucionHoras: 0
  },
  {
    id: "REP-2026-002",
    usuarioId: 2,
    ciudadano: "Carlos Méndez",
    zonaId: 2,
    zona: "Guadalupe",
    tipoFocoId: 1,
    tipo: "Dengue",
    estado: "En atención",
    prioridad: "Media",
    descripcion: "Vecinos reportan varios casos sospechosos y criaderos en lote baldío.",
    latitud: 9.9448,
    longitud: -84.0545,
    fechaCreacion: "2026-06-08",
    mes: "Junio",
    tiempoResolucionHoras: 0
  },
  {
    id: "REP-2026-003",
    usuarioId: 1,
    ciudadano: "María Rojas",
    zonaId: 1,
    zona: "San Pedro",
    tipoFocoId: 2,
    tipo: "Roedores",
    estado: "Asignado",
    prioridad: "Baja",
    descripcion: "Acumulación de basura cerca de una alcantarilla.",
    latitud: 9.9316,
    longitud: -84.0499,
    fechaCreacion: "2026-06-11",
    mes: "Junio",
    tiempoResolucionHoras: 0
  },
  {
    id: "REP-2026-004",
    usuarioId: 2,
    ciudadano: "Carlos Méndez",
    zonaId: 3,
    zona: "Curridabat",
    tipoFocoId: 3,
    tipo: "Cucarachas",
    estado: "Resuelto",
    prioridad: "Media",
    descripcion: "Foco detectado en zona de comercios, ya se aplicó control.",
    latitud: 9.9128,
    longitud: -84.0351,
    fechaCreacion: "2026-05-20",
    mes: "Mayo",
    tiempoResolucionHoras: 36
  },
  {
    id: "REP-2026-005",
    usuarioId: 1,
    ciudadano: "María Rojas",
    zonaId: 4,
    zona: "Coronado",
    tipoFocoId: 1,
    tipo: "Dengue",
    estado: "Pendiente",
    prioridad: "Alta",
    descripcion: "Recipientes abiertos en patio abandonado cerca de una escuela.",
    latitud: 9.9769,
    longitud: -84.0065,
    fechaCreacion: "2026-07-01",
    mes: "Julio",
    tiempoResolucionHoras: 0
  },
  {
    id: "REP-2026-006",
    usuarioId: 2,
    ciudadano: "Carlos Méndez",
    zonaId: 1,
    zona: "San Pedro",
    tipoFocoId: 5,
    tipo: "Otro",
    estado: "Resuelto",
    prioridad: "Baja",
    descripcion: "Revisión preventiva solicitada por vecinos del sector.",
    latitud: 9.9362,
    longitud: -84.0522,
    fechaCreacion: "2026-04-16",
    mes: "Abril",
    tiempoResolucionHoras: 24
  },
  {
    id: "REP-2026-007",
    usuarioId: 1,
    ciudadano: "María Rojas",
    zonaId: 3,
    zona: "Curridabat",
    tipoFocoId: 4,
    tipo: "Agua estancada",
    estado: "Rechazado",
    prioridad: "Baja",
    descripcion: "Reporte duplicado, ya existía otro caso registrado para el mismo sitio.",
    latitud: 9.9135,
    longitud: -84.0339,
    fechaCreacion: "2026-05-02",
    mes: "Mayo",
    tiempoResolucionHoras: 0
  }
];

const asignaciones = [
  { id: 1, reporteId: "REP-2026-001", brigadistaId: 1, inspectorId: 4, fechaAsignacion: "2026-06-05", prioridad: "Alta" },
  { id: 2, reporteId: "REP-2026-002", brigadistaId: 2, inspectorId: 4, fechaAsignacion: "2026-06-08", prioridad: "Media" },
  { id: 3, reporteId: "REP-2026-003", brigadistaId: 1, inspectorId: 4, fechaAsignacion: "2026-06-12", prioridad: "Baja" },
  { id: 4, reporteId: "REP-2026-004", brigadistaId: 1, inspectorId: 4, fechaAsignacion: "2026-05-21", prioridad: "Media" }
];

const accionesCampo = [
  {
    id: 1,
    asignacionId: 4,
    reporteId: "REP-2026-004",
    tipoAccion: "Fumigación",
    descripcion: "Se aplicó control químico y se dejó recomendación al encargado del local.",
    fecha: "2026-05-22",
    estadoResultado: "Resuelto",
    imagenEvidencia: "evidencia-demo.jpg"
  }
];

const notificaciones = [
  { id: 1, usuarioId: 1, reporteId: "REP-2026-001", mensaje: "Su reporte fue asignado a una brigada.", leida: false, fecha: "2026-06-05" },
  { id: 2, usuarioId: 3, reporteId: "REP-2026-003", mensaje: "Tiene un nuevo caso asignado para revisión.", leida: true, fecha: "2026-06-12" },
  { id: 3, usuarioId: 5, reporteId: "REP-2026-004", mensaje: "Un caso fue marcado como resuelto.", leida: true, fecha: "2026-05-22" }
];

window.DengueData = {
  roles,
  usuarios,
  tiposFoco,
  estadosReporte,
  zonas,
  brigadistas,
  reportes,
  asignaciones,
  accionesCampo,
  notificaciones
};
