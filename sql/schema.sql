CREATE DATABASE IF NOT EXISTS dengue_reporte CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dengue_reporte;

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS historial_reportes;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS acciones_campo;
DROP TABLE IF EXISTS asignaciones;
DROP TABLE IF EXISTS reportes;
DROP TABLE IF EXISTS estados_reporte;
DROP TABLE IF EXISTS tipos_foco;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS zonas;
DROP TABLE IF EXISTS municipalidades;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE municipalidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE zonas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  latitud_centro DECIMAL(10,7) NOT NULL,
  longitud_centro DECIMAL(10,7) NOT NULL,
  municipalidad_id INT NULL,
  CONSTRAINT fk_zona_municipalidad FOREIGN KEY (municipalidad_id) REFERENCES municipalidades(id)
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL,
  zona_id INT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  disponible TINYINT(1) NOT NULL DEFAULT 0,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES roles(id),
  CONSTRAINT fk_usuario_zona FOREIGN KEY (zona_id) REFERENCES zonas(id)
) ENGINE=InnoDB;

CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion DATETIME NOT NULL,
  usado TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_reset_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_reset_usuario(usuario_id, usado)
) ENGINE=InnoDB;

CREATE TABLE tipos_foco (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE estados_reporte (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(40) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) UNIQUE NULL,
  usuario_id INT NOT NULL,
  zona_id INT NOT NULL,
  latitud DECIMAL(10,7) NOT NULL,
  longitud DECIMAL(10,7) NOT NULL,
  descripcion TEXT NOT NULL,
  tipo_foco_id INT NOT NULL,
  estado_id INT NOT NULL,
  prioridad ENUM('Alta','Media','Baja') NOT NULL DEFAULT 'Media',
  validado TINYINT(1) NOT NULL DEFAULT 0,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_resolucion DATETIME NULL,
  CONSTRAINT fk_reporte_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_reporte_zona FOREIGN KEY (zona_id) REFERENCES zonas(id),
  CONSTRAINT fk_reporte_tipo FOREIGN KEY (tipo_foco_id) REFERENCES tipos_foco(id),
  CONSTRAINT fk_reporte_estado FOREIGN KEY (estado_id) REFERENCES estados_reporte(id),
  INDEX idx_reporte_estado(estado_id),
  INDEX idx_reporte_zona(zona_id),
  INDEX idx_reporte_fecha(fecha_creacion)
) ENGINE=InnoDB;

CREATE TABLE asignaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporte_id INT NOT NULL,
  brigadista_id INT NOT NULL,
  inspector_id INT NOT NULL,
  fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  prioridad ENUM('Alta','Media','Baja') NOT NULL,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  motivo_reasignacion VARCHAR(255) NULL,
  CONSTRAINT fk_asignacion_reporte FOREIGN KEY (reporte_id) REFERENCES reportes(id),
  CONSTRAINT fk_asignacion_brigadista FOREIGN KEY (brigadista_id) REFERENCES usuarios(id),
  CONSTRAINT fk_asignacion_inspector FOREIGN KEY (inspector_id) REFERENCES usuarios(id),
  INDEX idx_asignacion_activa(brigadista_id,activa)
) ENGINE=InnoDB;

CREATE TABLE acciones_campo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asignacion_id INT NOT NULL,
  tipo_accion ENUM('Visita','Fumigación','Resolución') NOT NULL,
  descripcion TEXT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  imagen_evidencia VARCHAR(255) NULL,
  estado_resultado_id INT NULL,
  CONSTRAINT fk_accion_asignacion FOREIGN KEY (asignacion_id) REFERENCES asignaciones(id),
  CONSTRAINT fk_accion_estado FOREIGN KEY (estado_resultado_id) REFERENCES estados_reporte(id)
) ENGINE=InnoDB;

CREATE TABLE notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  reporte_id INT NULL,
  mensaje VARCHAR(500) NOT NULL,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notificacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_notificacion_reporte FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE,
  INDEX idx_notificacion_usuario(usuario_id,leida)
) ENGINE=InnoDB;

CREATE TABLE historial_reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporte_id INT NOT NULL,
  usuario_id INT NULL,
  estado_anterior_id INT NULL,
  estado_nuevo_id INT NULL,
  detalle VARCHAR(500) NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historial_reporte FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE,
  CONSTRAINT fk_historial_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_historial_anterior FOREIGN KEY (estado_anterior_id) REFERENCES estados_reporte(id),
  CONSTRAINT fk_historial_nuevo FOREIGN KEY (estado_nuevo_id) REFERENCES estados_reporte(id)
) ENGINE=InnoDB;

INSERT INTO roles(id,nombre) VALUES
(1,'ciudadano'),(2,'brigadista'),(3,'inspector'),(4,'administrador');

INSERT INTO municipalidades(id,nombre) VALUES
(1,'Montes de Oca'),(2,'Goicoechea'),(3,'Curridabat'),(4,'Vázquez de Coronado');

INSERT INTO zonas(id,nombre,descripcion,latitud_centro,longitud_centro,municipalidad_id) VALUES
(1,'San Pedro','Zona urbana con alta circulación',9.9333000,-84.0500000,1),
(2,'Guadalupe','Sector residencial y comercial',9.9450000,-84.0530000,2),
(3,'Curridabat','Sector mixto con reportes frecuentes',9.9117000,-84.0346000,3),
(4,'Coronado','Sector con zonas verdes y quebradas',9.9767000,-84.0070000,4);

INSERT INTO tipos_foco(id,nombre) VALUES
(1,'Dengue'),(2,'Roedores'),(3,'Cucarachas'),(4,'Agua estancada'),(5,'Otro');

INSERT INTO estados_reporte(id,nombre) VALUES
(1,'Pendiente'),(2,'Asignado'),(3,'En atención'),(4,'Resuelto'),(5,'Rechazado');

INSERT INTO usuarios(id,nombre,email,contrasena_hash,rol_id,zona_id,activo,disponible) VALUES
(1,'María Rojas','mrojas@demo.cr','$2y$12$yo2w86RrYgUPHf.u6g4MeO8vnYPaG1diG.tiYLEgdAd/JiZ9.m5Lu',1,1,1,0),
(2,'Carlos Méndez','cmendez@demo.cr','$2y$12$yo2w86RrYgUPHf.u6g4MeO8vnYPaG1diG.tiYLEgdAd/JiZ9.m5Lu',1,2,1,0),
(3,'Juan Solano','jsolano@demo.cr','$2y$12$yo2w86RrYgUPHf.u6g4MeO8vnYPaG1diG.tiYLEgdAd/JiZ9.m5Lu',2,1,1,1),
(4,'Natalia Mora','nmora@demo.cr','$2y$12$yo2w86RrYgUPHf.u6g4MeO8vnYPaG1diG.tiYLEgdAd/JiZ9.m5Lu',3,1,1,0),
(5,'Admin Salud','admin@demo.cr','$2y$12$yo2w86RrYgUPHf.u6g4MeO8vnYPaG1diG.tiYLEgdAd/JiZ9.m5Lu',4,1,1,0),
(6,'Andrés Vargas','avargas@demo.cr','$2y$12$yo2w86RrYgUPHf.u6g4MeO8vnYPaG1diG.tiYLEgdAd/JiZ9.m5Lu',2,2,1,1);

INSERT INTO reportes(id,codigo,usuario_id,zona_id,latitud,longitud,descripcion,tipo_foco_id,estado_id,prioridad,validado,fecha_creacion,fecha_resolucion) VALUES
(1,'REP-2026-00001',1,1,9.9341000,-84.0512000,'Canal frente a varias casas con agua acumulada y larvas visibles.',4,2,'Alta',1,'2026-06-04 09:00:00',NULL),
(2,'REP-2026-00002',2,2,9.9448000,-84.0545000,'Vecinos reportan varios casos sospechosos y criaderos en lote baldío.',1,3,'Media',1,'2026-06-08 10:20:00',NULL),
(3,'REP-2026-00003',1,1,9.9316000,-84.0499000,'Acumulación de basura cerca de una alcantarilla.',2,2,'Baja',1,'2026-06-11 14:15:00',NULL),
(4,'REP-2026-00004',2,3,9.9128000,-84.0351000,'Foco detectado en zona de comercios, ya se aplicó control.',3,4,'Media',1,'2026-05-20 08:00:00','2026-05-22 20:00:00'),
(5,'REP-2026-00005',1,4,9.9769000,-84.0065000,'Recipientes abiertos en patio abandonado cerca de una escuela.',1,1,'Alta',0,'2026-07-01 11:30:00',NULL),
(6,'REP-2026-00006',2,1,9.9362000,-84.0522000,'Revisión preventiva solicitada por vecinos del sector.',5,4,'Baja',1,'2026-04-16 07:00:00','2026-04-17 07:00:00');

INSERT INTO asignaciones(id,reporte_id,brigadista_id,inspector_id,fecha_asignacion,prioridad,activa,motivo_reasignacion) VALUES
(1,1,3,4,'2026-06-05 08:00:00','Alta',1,'Asignación inicial'),
(2,2,6,4,'2026-06-08 12:00:00','Media',1,'Asignación inicial'),
(3,3,3,4,'2026-06-12 09:00:00','Baja',1,'Asignación inicial'),
(4,4,3,4,'2026-05-21 09:00:00','Media',0,'Caso resuelto');

INSERT INTO acciones_campo(asignacion_id,tipo_accion,descripcion,fecha,estado_resultado_id) VALUES
(4,'Fumigación','Se aplicó control químico y se dejó recomendación al encargado del local.','2026-05-22 20:00:00',4);

INSERT INTO historial_reportes(reporte_id,usuario_id,estado_anterior_id,estado_nuevo_id,detalle,fecha) VALUES
(4,3,3,4,'Resolución: Caso atendido y cerrado en campo.','2026-05-22 20:00:00');