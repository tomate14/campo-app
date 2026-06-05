# 26 - AutenticaciÃ³n, Seguridad y GestiÃ³n de Tokens

## DescripciÃ³n
Sistema integral de autenticaciÃ³n y autorizaciÃ³n, incluyendo inicializaciÃ³n del backend, login de usuarios, generaciÃ³n de JWT tokens con refresh, OAuth 2.0 y RBAC (Role-Based Access Control).

## Funcionalidades Principales
- InicializaciÃ³n del Backend con estructura base
- Registro de usuarios (sign-up)
- Login con credenciales (email/password)
- GeneraciÃ³n de JWT access tokens
- Refresh tokens para renovaciÃ³n automÃ¡tica
- IntegraciÃ³n OAuth 2.0 (Google, Azure, etc.)
- Role-Based Access Control (RBAC)
- AuditorÃ­a de acciones crÃ­ticas
- ValidaciÃ³n de permisos en endpoints
- RevocaciÃ³n de tokens

## Tareas

### Backend Initialization
1. **ConfiguraciÃ³n del Servidor Java con Springboot**
   - Setup de aplicaciÃ³n base
   - Middleware de seguridad (CORS, helmet, rate-limiting)
   - ConfiguraciÃ³n de variables de entorno
   - Logging centralizado

2. **Estructura de Base de Datos de Seguridad**
   - Tabla `users` (id, email, password_hash, deleted_at)
   - Tabla `roles` (id, name, description, deleted_at)
   - Tabla `permissions` (id, name, description, deleted_at)
   - Tabla `user_roles` (user_id, role_id, deleted_at)
   - Tabla `role_permissions` (role_id, permission_id, deleted_at)
   - Tabla `audit_logs` (id, user_id, action, resource, changes, created_at)
   - Tabla `refresh_tokens` (id, user_id, token_hash, expires_at, revoked_at, deleted_at)

3. **ConfiguraciÃ³n de JWT**
   - GeneraciÃ³n de secret keys (access y refresh)
   - ConfiguraciÃ³n de tiempos de expiraciÃ³n (access: 15min, refresh: 7 dÃ­as)
   - Algoritmo HS256/RS256

### Sistema de Login
1. **API POST `/api/v1/auth/login`**
   - Input: email, password
   - ValidaciÃ³n de credenciales
   - VerificaciÃ³n de estado de cuenta (activo/inactivo)
   - Output: access_token, refresh_token, user data

2. **API POST `/api/v1/auth/refresh`**
   - Input: refresh_token
   - ValidaciÃ³n del token
   - GeneraciÃ³n de nuevo access_token
   - Output: new access_token

3. **API POST `/api/v1/auth/logout`**
   - RevocaciÃ³n del refresh_token
   - Limpieza de sesiÃ³n

4. **API POST `/api/v1/auth/register`**
   - Input: email, password, name, phone
   - ValidaciÃ³n de campos
   - Hash de contraseÃ±a (bcrypt)
   - EnvÃ­o de verificaciÃ³n de email
   - Output: user_id, email

5. **ValidaciÃ³n de ContraseÃ±a**
   - MÃ­nimo 8 caracteres
   - Debe incluir mayÃºsculas, minÃºsculas, nÃºmeros, sÃ­mbolos
   - No reutilizaciÃ³n de Ãºltimas 5 contraseÃ±as

### Tokens y Seguridad
1. **JWT Access Token**
   - Payload: user_id, email, roles[], permissions[], iat, exp
   - Firmado con HS256
   - TTL: 15 minutos
   - Usado en Authorization header

2. **JWT Refresh Token**
   - Payload: user_id, iat, exp, jti (id Ãºnico)
   - Guardado en base de datos
   - TTL: 7 dÃ­as
   - Puede ser revocado

3. **Middleware de AutenticaciÃ³n**
   - ValidaciÃ³n de token en Authorization header
   - ExtracciÃ³n de claims
   - Retorno de error 401 si invÃ¡lido

4. **Middleware de AutorizaciÃ³n**
   - ValidaciÃ³n de permisos por role
   - Decorator `@RequirePermission('read:lotes')`
   - Retorno de error 403 si no autorizado

### OAuth 2.0 Integration
1. **ConfiguraciÃ³n de Proveedores**
   - Google OAuth (client_id, client_secret)
   - Azure AD (tenant, client_id)
   - GitHub OAuth

2. **API POST `/api/v1/auth/oauth/{provider}/callback`**
   - Intercambio de authorization_code por token
   - BÃºsqueda o creaciÃ³n de usuario
   - GeneraciÃ³n de JWT internos
   - RedirecciÃ³n a frontend con tokens

### RBAC Base
1. **Roles Predefinidos**
   - `super_admin`: Acceso total
   - `admin`: GestiÃ³n de sistema y usuarios
   - `jefe_campo`: GestiÃ³n de operarios y lotes
   - `operario`: EjecuciÃ³n de Ã³rdenes de trabajo
   - `contador`: GestiÃ³n de finanzas

2. **Permisos Base**
   - `create:usuarios`, `read:usuarios`, `update:usuarios`, `delete:usuarios`
   - `create:lotes`, `read:lotes`, `update:lotes`, `delete:lotes`
   - `create:ordenes`, `read:ordenes`, `update:ordenes`, `delete:ordenes`
   - Por cada dominio: agricultura, ganaderÃ­a, maquinaria, finanzas, etc.

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

- `UserRepository`: CRUD de usuarios, bÃºsqueda por email
- `RoleRepository`: CRUD de roles
- `PermissionRepository`: CRUD de permisos
- `RefreshTokenRepository`: Almacenamiento y validaciÃ³n de refresh tokens
- `AuditLogRepository`: Registro de auditorÃ­a

## Requisitos TÃ©cnicos

- **EncriptaciÃ³n de ContraseÃ±as**: bcrypt con salt 10+
- **UUID**: Todos los IDs de entidades
- **Soft Delete**: Obligatorio en todas las tablas
- **AuditorÃ­a**: Log automÃ¡tico de creaciÃ³n/actualizaciÃ³n/eliminaciÃ³n
- **JWT**: HS256 para desarrollo, RS256 para producciÃ³n
- **Rate Limiting**: 5 intentos de login fallidos = bloqueo 15 minutos
- **CORS**: Configurado por origen permitido
- **HTTPS**: Obligatorio en producciÃ³n
- **HTTP Headers de Seguridad**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000`

## Endpoint REST

```
POST   /api/v1/auth/register         - Registro de usuario
POST   /api/v1/auth/login            - Login con email/password
POST   /api/v1/auth/refresh          - RenovaciÃ³n de access token
POST   /api/v1/auth/logout           - Logout (revocaciÃ³n de tokens)
POST   /api/v1/auth/oauth/{provider}/url  - URL de OAuth
POST   /api/v1/auth/oauth/{provider}/callback - Callback OAuth
GET    /api/v1/auth/me               - Datos del usuario autenticado
POST   /api/v1/auth/change-password  - Cambio de contraseÃ±a
POST   /api/v1/auth/forgot-password  - Inicio de reset de contraseÃ±a
POST   /api/v1/auth/reset-password   - Completar reset de contraseÃ±a

GET    /api/v1/admin/users           - Listar usuarios (admin)
POST   /api/v1/admin/users/{id}/roles - Asignar roles a usuario
DELETE /api/v1/admin/users/{id}/roles/{roleId} - Remover rol de usuario
GET    /api/v1/admin/audit-logs      - Listar auditorÃ­a

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

## CaracterÃ­sticas de Resiliencia

- **Token Rotation**: Refresh tokens rotables
- **RevocaciÃ³n Inmediata**: Logout revoca todos los tokens del usuario
- **Rate Limiting**: ProtecciÃ³n contra ataques de fuerza bruta
- **Session Management**: Seguimiento de sesiones activas por usuario
- **Backup de Secrets**: Keys guardadas en vault seguro
- **Monitoreo**: Alertas de intentos fallidos de login

## Testing

- Unit tests para hashing de contraseÃ±as
- Unit tests para generaciÃ³n y validaciÃ³n de tokens
- Integration tests para flujo login-refresh-logout
- Security tests: SQL injection, XSS en credentials
- Load tests: Rate limiting bajo concurrencia
- OAuth flow tests con mock providers

## Offline-First Considerations

- Tokens persistidos localmente en mÃ³vil (almacenamiento seguro)
- ValidaciÃ³n de tokens antes de sincronizaciÃ³n
- Queue de acciones pendientes requiere token vÃ¡lido
- Refresh automÃ¡tico antes de expiraciÃ³n
- Re-autenticaciÃ³n necesaria si refresh_token expirÃ³

