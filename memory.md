# Campo App â€” Memory

Registro de features implementadas y estado del proyecto.

---

## Features Completadas

- Features finalizadas y renombradas con `_COMPLETA_`: 00_01, 00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10-reportes, 12, 13, 26, 37 y 38.

### âœ… Feature 26 â€” AutenticaciÃ³n, Seguridad y GestiÃ³n de Tokens
**Fecha**: 2026-05-18  
**Estado**: Completa  
**MÃ³dulo**: `backend/src/main/java/com/campoapp/auth/`

#### QuÃ© se implementÃ³
- **Spring Boot 3.2** inicializado con Maven, Flyway, JPA, Spring Security 6
- **Base de datos** (`V1__auth_tables.sql`): tablas `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `refresh_tokens`, `audit_logs`
- **5 roles** sembrados: `super_admin`, `admin`, `jefe_campo`, `operario`, `contador`  
- **33 permisos** por dominio (`read:lotes`, `create:ordenes`, `read:finanzas`, etc.)
- **JWT**: access token (15 min, HS256) + refresh token (7 dÃ­as, rotable, hasheado en BD)
- **Rate limiting**: Bucket4j â€” 5 intentos fallidos â†’ bloqueo 15 minutos por email
- **BCrypt**: factor 12 para passwords
- **AuditorÃ­a async**: `AuditLog` para login exitoso, fallido, logout, registro, cambios de rol
- **Soft delete**: `deletedAt` en todas las entidades, heredado de `AuditableEntity`
- **Headers de seguridad**: CSP, HSTS, X-Frame-Options, Referrer-Policy
- **CORS**: solo orÃ­genes permitidos (no wildcard)
- **OpenAPI**: Swagger UI en `/api/v1/swagger-ui.html`, esquema BearerAuth
- **DataInitializer**: crea usuario `admin@campoapp.com` con rol `super_admin` al arrancar

#### Endpoints implementados
```
POST /api/v1/auth/register       â€” Registro de usuario
POST /api/v1/auth/login          â€” Login (rate limited)
POST /api/v1/auth/refresh        â€” Renovar access token
POST /api/v1/auth/logout         â€” Logout + revocar todos los tokens
GET  /api/v1/auth/me             â€” Datos del usuario autenticado

GET    /api/v1/admin/users                        â€” Listar usuarios
POST   /api/v1/admin/users/{id}/roles             â€” Asignar rol
DELETE /api/v1/admin/users/{id}/roles/{roleName}  â€” Remover rol
GET    /api/v1/admin/audit-logs                   â€” Ver auditorÃ­a
```

#### Tests
- `TokenServiceTest` â€” generaciÃ³n y validaciÃ³n de JWT (unit)
- `AuthServiceTest` â€” login, registro, logout con todos los casos de error (unit)
- `AuthControllerIntegrationTest` â€” flujos completos con Testcontainers + MySQL (integration)
- `RBACTest` â€” acceso por roles a endpoints protegidos (integration)

#### Credenciales iniciales
```
Email:    admin@campoapp.com
Password: Admin@Campo2024!
Rol:      super_admin
```
âš ï¸ Cambiar la contraseÃ±a en producciÃ³n.

#### Variables de entorno requeridas
```env
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
JWT_SECRET                   # mÃ­nimo 256 bits
JWT_ACCESS_EXPIRATION_MS     # default 900000 (15 min)
JWT_REFRESH_EXPIRATION_MS    # default 604800000 (7 dÃ­as)
```
---

## Features Pendientes

| # | Feature | Dominio | Depende de |
|---|---------|---------|------------|
| 24 | SincronizaciÃ³n Offline-First | Infraestructura | 26 âœ… |
| 16 | Stock y Control | Inventario | 26 âœ… |
| 10 | GPS y TelemetrÃ­a | Maquinaria | 08 |
| 21 | Tracking de Operarios | Geo | 12, 13 |
| 22 | Reportes Operacionales | Reportes | todas |
| 23 | Reportes AgrÃ­cola y GanaderÃ­a | Reportes | 04, 00 |
| 17 | FacturaciÃ³n y Ventas (AFIP) | Finanzas | 16 |
| 18 | Compras y Proveedores | Finanzas | 16 |
| 19 | Reportes Financieros | Finanzas | 17, 18 |
| 11 | Consumo de Combustible | Maquinaria | 08, 10 |
| 14 | Asignaciones y Disponibilidad | Operarios | 12, 13 |
| 15 | Insumos AgrÃ­colas | Inventario | 26 âœ… |
| 20 | Mapas y Lotes | Geo | 01 |
| 25 | Control de Plagas y Enfermedades | Agricultura | 01, 20 |
| 39 | Cambio obligatorio de contraseña en primer login mobile | Seguridad/Mobile | 12, 26 |

---

## Reglas Visuales Vigentes

- Todos los headers de paginas del dashboard deben respetar el estilo premium dark SaaS usado en Trazabilidad, Alimentacion y Agricultura: eyebrow verde `Campo App Â· Dominio`, titulo grande, subtitulo gris azulado, acciones alineadas a la derecha con iconos SVG reales y botones modernos.
- Todas las metric cards/KPI cards deben mantener el mismo patron visual: icono SVG real en contenedor glow, fondo glassmorphism azul marino, borde suave, numero grande, label secundario y microtexto operativo.
- No usar siglas, letras o abreviaturas como iconos. Si no hay icono claro, preguntar antes de resolver con texto.

## Regla de Features Completas
- Cuando el usuario pida marcar una feature como completa, renombrar el archivo insertando `_COMPLETA_` entre el numero y la primera palabra. Ejemplo: `NN_nombre_feature.md` pasa a `NN_COMPLETA_nombre_feature.md`.
- Al hacer ese cambio, actualizar tambien `features/MANIFEST.md` y cualquier referencia directa al archivo.

## Regla de Alta de Operarios
- El registro de operarios no debe pedir legajo, email, tipo de contrato, jornada base, area ni ubicacion.
- El modulo de operarios no debe registrar jornadas ni evaluar desempeno de operarios.
- Feature 13 implementa ordenes de trabajo sin asignacion de maquinas por pedido explicito del usuario.
- Al crear un operario, backend debe generar automaticamente un usuario con username formado por la primera letra del nombre en minuscula + la primera palabra del apellido en minuscula. Ejemplo: `Maximiliano Roselli Juarez` -> `mroselli`.
- Si el username ya existe, agregar un numero al final.
- La password inicial del usuario creado debe ser igual al username.
- El cambio obligatorio de esa password inicial en primer login mobile queda pendiente en feature 39.

## Regla Visual de Tooltips
- Todos los tooltips nuevos de graficos y visualizaciones deben seguir el patron premium Campo App: card dark SaaS 380x430 aprox., fondo #081225/#0B1730, borde verde suave, border-radius 24px, glow sutil, banda superior con color de serie/cultivo, icono real, titulo grande, subtitulo gris, badge de estado, separador, metricas icono-label-valor y footer con leyenda. Evitar tooltips nativos simples en graficos.



