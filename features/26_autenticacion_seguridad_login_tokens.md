# 26 - Autenticación, Seguridad y Gestión de Tokens

## Descripción
Sistema integral de autenticación y autorización, incluyendo inicialización del backend, login de usuarios, generación de JWT tokens con refresh, OAuth 2.0 y RBAC (Role-Based Access Control).

## Funcionalidades Principales
- Inicialización del Backend con estructura base
- Registro de usuarios (sign-up)
- Login con credenciales (email/password)
- Generación de JWT access tokens
- Refresh tokens para renovación automática
- Integración OAuth 2.0 (Google, Azure, etc.)
- Role-Based Access Control (RBAC)
- Auditoría de acciones críticas
- Validación de permisos en endpoints
- Revocación de tokens

## Tareas

### Backend Initialization
1. **Configuración del Servidor Java con Springboot**
   - Setup de aplicación base
   - Middleware de seguridad (CORS, helmet, rate-limiting)
   - Configuración de variables de entorno
   - Logging centralizado

2. **Estructura de Base de Datos de Seguridad**
   - Tabla `users` (id, email, password_hash, deleted_at)
   - Tabla `roles` (id, name, description, deleted_at)
   - Tabla `permissions` (id, name, description, deleted_at)
   - Tabla `user_roles` (user_id, role_id, deleted_at)
   - Tabla `role_permissions` (role_id, permission_id, deleted_at)
   - Tabla `audit_logs` (id, user_id, action, resource, changes, created_at)
   - Tabla `refresh_tokens` (id, user_id, token_hash, expires_at, revoked_at, deleted_at)

3. **Configuración de JWT**
   - Generación de secret keys (access y refresh)
   - Configuración de tiempos de expiración (access: 15min, refresh: 7 días)
   - Algoritmo HS256/RS256

### Sistema de Login
1. **API POST `/api/v1/auth/login`**
   - Input: email, password
   - Validación de credenciales
   - Verificación de estado de cuenta (activo/inactivo)
   - Output: access_token, refresh_token, user data

2. **API POST `/api/v1/auth/refresh`**
   - Input: refresh_token
   - Validación del token
   - Generación de nuevo access_token
   - Output: new access_token

3. **API POST `/api/v1/auth/logout`**
   - Revocación del refresh_token
   - Limpieza de sesión

4. **API POST `/api/v1/auth/register`**
   - Input: email, password, name, phone
   - Validación de campos
   - Hash de contraseña (bcrypt)
   - Envío de verificación de email
   - Output: user_id, email

5. **Validación de Contraseña**
   - Mínimo 8 caracteres
   - Debe incluir mayúsculas, minúsculas, números, símbolos
   - No reutilización de últimas 5 contraseñas

### Tokens y Seguridad
1. **JWT Access Token**
   - Payload: user_id, email, roles[], permissions[], iat, exp
   - Firmado con HS256
   - TTL: 15 minutos
   - Usado en Authorization header

2. **JWT Refresh Token**
   - Payload: user_id, iat, exp, jti (id único)
   - Guardado en base de datos
   - TTL: 7 días
   - Puede ser revocado

3. **Middleware de Autenticación**
   - Validación de token en Authorization header
   - Extracción de claims
   - Retorno de error 401 si inválido

4. **Middleware de Autorización**
   - Validación de permisos por role
   - Decorator `@RequirePermission('read:lotes')`
   - Retorno de error 403 si no autorizado

### OAuth 2.0 Integration
1. **Configuración de Proveedores**
   - Google OAuth (client_id, client_secret)
   - Azure AD (tenant, client_id)
   - GitHub OAuth

2. **API POST `/api/v1/auth/oauth/{provider}/callback`**
   - Intercambio de authorization_code por token
   - Búsqueda o creación de usuario
   - Generación de JWT internos
   - Redirección a frontend con tokens

### RBAC Base
1. **Roles Predefinidos**
   - `super_admin`: Acceso total
   - `admin`: Gestión de sistema y usuarios
   - `jefe_campo`: Gestión de operarios y lotes
   - `operario`: Ejecución de órdenes de trabajo
   - `contador`: Gestión de finanzas

2. **Permisos Base**
   - `create:usuarios`, `read:usuarios`, `update:usuarios`, `delete:usuarios`
   - `create:lotes`, `read:lotes`, `update:lotes`, `delete:lotes`
   - `create:ordenes`, `read:ordenes`, `update:ordenes`, `delete:ordenes`
   - Por cada dominio: agricultura, ganadería, maquinaria, finanzas, etc.

3. **Seeding de Datos Iniciales**
   - Script para crear roles base
   - Script para crear permisos
   - Script para crear usuario admin inicial

## Servicios

### AuthenticationService
- `login(email, password): Promise<{accessToken, refreshToken, user}>`
- `register(userData): Promise<user>`
- `validateToken(token): Promise<claims>`
- `refreshAccessToken(refreshToken): Promise<newAccessToken>`
- `logout(userId): Promise<void>`
- `validateOAuthCode(provider, code): Promise<user>`

### TokenService
- `generateAccessToken(user): string`
- `generateRefreshToken(user): Promise<token>`
- `revokeRefreshToken(tokenId): Promise<void>`
- `verifyAccessToken(token): Promise<claims>`
- `verifyRefreshToken(token): Promise<claims>`

### RBACService
- `getUserRoles(userId): Promise<Role[]>`
- `getUserPermissions(userId): Promise<Permission[]>`
- `hasPermission(userId, permission): Promise<boolean>`
- `assignRoleToUser(userId, roleId): Promise<void>`
- `removeRoleFromUser(userId, roleId): Promise<void>`

### AuditService
- `logAction(userId, action, resource, changes): Promise<void>`
- `getAuditLog(filters): Promise<AuditLog[]>`
- `getUserActions(userId): Promise<AuditLog[]>`

## Repositorios

- `UserRepository`: CRUD de usuarios, búsqueda por email
- `RoleRepository`: CRUD de roles
- `PermissionRepository`: CRUD de permisos
- `RefreshTokenRepository`: Almacenamiento y validación de refresh tokens
- `AuditLogRepository`: Registro de auditoría

## Requisitos Técnicos

- **Encriptación de Contraseñas**: bcrypt con salt 10+
- **UUID**: Todos los IDs de entidades
- **Soft Delete**: Obligatorio en todas las tablas
- **Auditoría**: Log automático de creación/actualización/eliminación
- **JWT**: HS256 para desarrollo, RS256 para producción
- **Rate Limiting**: 5 intentos de login fallidos = bloqueo 15 minutos
- **CORS**: Configurado por origen permitido
- **HTTPS**: Obligatorio en producción
- **HTTP Headers de Seguridad**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000`

## Endpoint REST

```
POST   /api/v1/auth/register         - Registro de usuario
POST   /api/v1/auth/login            - Login con email/password
POST   /api/v1/auth/refresh          - Renovación de access token
POST   /api/v1/auth/logout           - Logout (revocación de tokens)
POST   /api/v1/auth/oauth/{provider}/url  - URL de OAuth
POST   /api/v1/auth/oauth/{provider}/callback - Callback OAuth
GET    /api/v1/auth/me               - Datos del usuario autenticado
POST   /api/v1/auth/change-password  - Cambio de contraseña
POST   /api/v1/auth/forgot-password  - Inicio de reset de contraseña
POST   /api/v1/auth/reset-password   - Completar reset de contraseña

GET    /api/v1/admin/users           - Listar usuarios (admin)
POST   /api/v1/admin/users/{id}/roles - Asignar roles a usuario
DELETE /api/v1/admin/users/{id}/roles/{roleId} - Remover rol de usuario
GET    /api/v1/admin/audit-logs      - Listar auditoría

GET    /api/v1/admin/roles           - Listar roles
POST   /api/v1/admin/roles           - Crear rol
GET    /api/v1/admin/permissions     - Listar permisos
```

## OpenAPI Specification

```yaml
components:
  schemas:
    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
    
    AuthResponse:
      type: object
      properties:
        accessToken:
          type: string
        refreshToken:
          type: string
        user:
          type: object
          properties:
            id:
              type: string
              format: uuid
            email:
              type: string
            name:
              type: string
            roles:
              type: array
              items:
                type: string
    
    RefreshTokenRequest:
      type: object
      required: [refreshToken]
      properties:
        refreshToken:
          type: string
  
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

## Dependencias
- **Todas las features**: Esta es foundational, no depende de ninguna pero todas la necesitan

## Características de Resiliencia

- **Token Rotation**: Refresh tokens rotables
- **Revocación Inmediata**: Logout revoca todos los tokens del usuario
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Session Management**: Seguimiento de sesiones activas por usuario
- **Backup de Secrets**: Keys guardadas en vault seguro
- **Monitoreo**: Alertas de intentos fallidos de login

## Testing

- Unit tests para hashing de contraseñas
- Unit tests para generación y validación de tokens
- Integration tests para flujo login-refresh-logout
- Security tests: SQL injection, XSS en credentials
- Load tests: Rate limiting bajo concurrencia
- OAuth flow tests con mock providers

## Offline-First Considerations

- Tokens persistidos localmente en móvil (almacenamiento seguro)
- Validación de tokens antes de sincronización
- Queue de acciones pendientes requiere token válido
- Refresh automático antes de expiración
- Re-autenticación necesaria si refresh_token expiró
