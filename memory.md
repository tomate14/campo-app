# Campo App — Memory

Registro de features implementadas y estado del proyecto.

---

## Features Completadas

### ✅ Feature 26 — Autenticación, Seguridad y Gestión de Tokens
**Fecha**: 2026-05-18  
**Estado**: Completa  
**Módulo**: `backend/src/main/java/com/campoapp/auth/`

#### Qué se implementó
- **Spring Boot 3.2** inicializado con Maven, Flyway, JPA, Spring Security 6
- **Base de datos** (`V1__auth_tables.sql`): tablas `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `refresh_tokens`, `audit_logs`
- **5 roles** sembrados: `super_admin`, `admin`, `jefe_campo`, `operario`, `contador`  
- **33 permisos** por dominio (`read:lotes`, `create:ordenes`, `read:finanzas`, etc.)
- **JWT**: access token (15 min, HS256) + refresh token (7 días, rotable, hasheado en BD)
- **Rate limiting**: Bucket4j — 5 intentos fallidos → bloqueo 15 minutos por email
- **BCrypt**: factor 12 para passwords
- **Auditoría async**: `AuditLog` para login exitoso, fallido, logout, registro, cambios de rol
- **Soft delete**: `deletedAt` en todas las entidades, heredado de `AuditableEntity`
- **Headers de seguridad**: CSP, HSTS, X-Frame-Options, Referrer-Policy
- **CORS**: solo orígenes permitidos (no wildcard)
- **OpenAPI**: Swagger UI en `/api/v1/swagger-ui.html`, esquema BearerAuth
- **DataInitializer**: crea usuario `admin@campoapp.com` con rol `super_admin` al arrancar

#### Endpoints implementados
```
POST /api/v1/auth/register       — Registro de usuario
POST /api/v1/auth/login          — Login (rate limited)
POST /api/v1/auth/refresh        — Renovar access token
POST /api/v1/auth/logout         — Logout + revocar todos los tokens
GET  /api/v1/auth/me             — Datos del usuario autenticado

GET    /api/v1/admin/users                        — Listar usuarios
POST   /api/v1/admin/users/{id}/roles             — Asignar rol
DELETE /api/v1/admin/users/{id}/roles/{roleName}  — Remover rol
GET    /api/v1/admin/audit-logs                   — Ver auditoría
```

#### Tests
- `TokenServiceTest` — generación y validación de JWT (unit)
- `AuthServiceTest` — login, registro, logout con todos los casos de error (unit)
- `AuthControllerIntegrationTest` — flujos completos con Testcontainers + MySQL (integration)
- `RBACTest` — acceso por roles a endpoints protegidos (integration)

#### Credenciales iniciales
```
Email:    admin@campoapp.com
Password: Admin@Campo2024!
Rol:      super_admin
```
⚠️ Cambiar la contraseña en producción.

#### Variables de entorno requeridas
```env
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
JWT_SECRET                   # mínimo 256 bits
JWT_ACCESS_EXPIRATION_MS     # default 900000 (15 min)
JWT_REFRESH_EXPIRATION_MS    # default 604800000 (7 días)
```

---

## Features Pendientes

| # | Feature | Dominio | Depende de |
|---|---------|---------|------------|
| 12 | Operarios: Gestión y Administración | Operarios | 26 ✅ |
| 01 | Gestión de Lotes | Agricultura | 26 ✅ |
| 00 | Monitoreo de Siembra y Cosecha | Agricultura | 01 |
| 04 | Trazabilidad Animal | Ganadería | 26 ✅ |
| 13 | Órdenes de Trabajo | Operarios | 12 |
| 24 | Sincronización Offline-First | Infraestructura | 26 ✅ |
| 16 | Stock y Control | Inventario | 26 ✅ |
| 08 | Maquinaria: Inventario y Control | Maquinaria | 26 ✅ |
| 02 | Clima: Monitoreo e Integración | Clima | 01 |
| 10 | GPS y Telemetría | Maquinaria | 08 |
| 21 | Tracking de Operarios | Geo | 12, 13 |
| 22 | Reportes Operacionales | Reportes | todas |
| 03 | Rendimiento y Analytics | Agricultura | 00, 01, 02 |
| 23 | Reportes Agrícola y Ganadería | Reportes | 04, 00 |
| 17 | Facturación y Ventas (AFIP) | Finanzas | 16 |
| 18 | Compras y Proveedores | Finanzas | 16 |
| 19 | Reportes Financieros | Finanzas | 17, 18 |
| 05 | Sanidad y Vacunación | Ganadería | 04, 15 |
| 06 | Reproducción y Genealogía | Ganadería | 04 |
| 07 | Alimentación y Monitoreo | Ganadería | 04, 16 |
| 09 | Mantenimiento Preventivo | Maquinaria | 08 |
| 11 | Consumo de Combustible | Maquinaria | 08, 10 |
| 14 | Asignaciones y Disponibilidad | Operarios | 12, 13 |
| 15 | Insumos Agrícolas | Inventario | 26 ✅ |
| 20 | Mapas y Lotes | Geo | 01 |
| 25 | Control de Plagas y Enfermedades | Agricultura | 01, 20 |
