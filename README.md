# DengueReporte CR

## Sistema Web de Reporte y Seguimiento de Dengue y Plagas Urbanas

Aplicación web multirol desarrollada para SC-502 Ambiente Web Cliente Servidor. El proyecto integra reportes ciudadanos, gestión de casos, brigadas, seguimiento de campo, zonas de riesgo, estadísticas y notificaciones.

## Tecnologías

- HTML5, CSS3 y JavaScript
- PHP 8.2
- MySQL 8.0
- PDO
- Arquitectura MVC
- Leaflet
- Chart.js
- Docker y Docker Compose

## Roles

- Ciudadano
- Brigadista
- Inspector
- Administrador

## Módulos

1. Autenticación y roles
2. Reportes ciudadanos
3. Gestión de casos
4. Gestión de brigadas
5. Seguimiento de campo
6. Zonas de riesgo
7. Panel de estadísticas
8. Notificaciones internas

## Estructura

```text
DengueReporteCR_Proyecto_Oficial/
├── app/
│   ├── config/
│   ├── controllers/
│   ├── core/
│   ├── models/
│   └── views/
├── public/
│   ├── assets/
│   ├── uploads/
│   └── index.php
├── admin/
├── brigadista/
├── ciudadano/
├── inspector/
├── css/
├── js/
├── sql/
│   └── schema.sql
├── Dockerfile
├── docker-compose.yml
├── index.php
├── index.html
└── README.md
```

## Flujo MVC

```text
Navegador
   ↓
public/index.php
   ↓
Controller
   ↓
Model ↔ MySQL
   ↓
View
```

La aplicación utiliza una sola entrada oficial. Al abrir la raíz del proyecto, Apache prioriza `index.php` y redirige automáticamente a `public/index.php`.

## Ejecución

Para reconstruir la base con los usuarios y datos de prueba actuales:

```powershell
docker compose down -v
docker compose up -d --build
docker compose ps
```

Aplicación:

```text
http://localhost:8082
```

## Base de datos

```text
Host interno: db
Puerto interno: 3306
Base: dengue_reporte
Usuario: appuser
Contraseña: apppass
```

El servicio MySQL no publica un puerto hacia Windows. Para consultar la base:

```powershell
docker compose exec db mysql -uappuser -papppass dengue_reporte
```

## Usuarios de prueba

Todos utilizan la contraseña:

```text
Demo1234*
```

| Rol | Correo |
| --- | --- |
| Ciudadano | mrojas@demo.cr |
| Brigadista | jsolano@demo.cr |
| Inspector | nmora@demo.cr |
| Administrador | admin@demo.cr |

## Seguimiento de campo

- Consulta de asignaciones activas por brigadista.
- Visualización de ubicación con Leaflet.
- Registro de visita, fumigación o resolución.
- Carga de evidencia fotográfica.
- Actualización del estado del reporte.
- Historial de acciones.
- Notificaciones asociadas al caso.

## Estadísticas

- Total de reportes.
- Pendientes, en proceso y resueltos.
- Tiempo promedio de resolución.
- Gráficos por tipo, estado y mes.
- Ranking y filtro por zona.
- Filtro por mes.
- Exportación CSV.

## Seguridad

- Sesiones PHP.
- Acceso por rol.
- `password_verify()` para contraseñas.
- Consultas preparadas con PDO.
- Protección CSRF en formularios.
- Validación MIME y tamaño de imágenes.
- Validación de pertenencia de asignaciones al brigadista autenticado.
