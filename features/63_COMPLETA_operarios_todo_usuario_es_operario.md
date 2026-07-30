# 63 - Operarios: todo usuario es un operario (provisionar ficha)

## Descripción
Garantizar la relación 1:1 entre `users` y `operarios`: **todo usuario de la
aplicación debe tener su ficha de operario**, aunque todavía no tenga roles ni
permisos asignados. Así el panel de Gestión de Operarios muestra a **todos** los
usuarios (incluidos los que se auto-registran desde el login) y el administrador
puede completarles la ficha y asignarles rol/permisos después.

## Problema (bug reportado)
- El auto-registro desde el login (`POST /api/v1/auth/register`) inserta el
  usuario **solo en la tabla `users`** (sin roles, sin `must_change_password`).
- El listado de operarios (`GET /api/v1/operarios/gestion/operarios`) consulta
  **solo la tabla `operarios`** (`OperarioRepository.search`).
- Como el registro nunca crea la fila en `operarios`, el usuario auto-registrado
  no aparece nunca en el panel. No es un filtro por rol/estado (ya son
  opcionales): directamente no existe el registro para listar.

## Modelo objetivo
Todo usuario es un operario. No se fusionan físicamente las tablas (rompería
auth, FKs, tokens): se mantiene `operarios.user_id -> users.id` y se asegura que
cada `user` tenga **siempre** su fila en `operarios`.

## Alcance
### Backend
1. **Esquema (Flyway V44)**: permitir ficha mínima para usuarios sin datos de
   RRHH. `operarios.documento_numero` pasa a **NULL permitido** (mantiene el
   índice UNIQUE, que en MySQL admite múltiples NULL). El alta manual de
   operario desde el panel sigue exigiendo documento (validación en servicio,
   sin cambio de contrato).
2. **Provisionar en el registro**: al ejecutarse `AuthService.register`, además
   de crear el `User`, crear el `Operario` asociado con:
   - `legajo`: autogenerado y único (misma normalización que el alta de
     operario, derivado del nombre; sufijo numérico ante colisión).
   - `nombre` / `apellido`: derivados de `user.name` (primer token = nombre,
     resto = apellido; si no hay apellido, placeholder mínimo).
   - `documento_numero`: `null` (lo completa el admin después).
   - `rol_operativo`: placeholder `SIN_ASIGNAR`.
   - `estado`: `PENDIENTE` (marca "requiere configuración").
   - `user`: el usuario recién creado.
3. **Backfill idempotente**: crear la ficha de operario para los usuarios
   existentes que hoy no la tengan (p. ej. el usuario ya auto-registrado). Se
   implementa en Java, reutilizando la misma lógica de provisión, disparado al
   arranque (`ApplicationReadyEvent`) y saltando usuarios que ya tengan ficha.
4. Reutilizar la generación de legajo/username y las validaciones existentes de
   `OperarioServiceImpl`; exponer un método de provisión que consuma un `User`.

### Frontend web
- El panel de operarios ya lista `operarios`; al existir la ficha, los usuarios
  aparecen sin cambios de UI. Verificar que la tabla tolere `documento` vacío y
  el estado `PENDIENTE` (badge sin romper). Si hace falta, sumar el estado
  `PENDIENTE` al set de estados conocidos y un estilo de badge.

## Requisitos Técnicos
- Backend compila (`mvnw compile`) y arranca con Flyway `validate`.
- Migración V44 idempotente y compatible con datos existentes.
- Sin romper el alta manual de operarios ni el login/first-login (feature 39).
- Frontend `npm run type-check` verde si hubo cambios.

## Verificación
- Auto-registrar un usuario desde el login y confirmar que aparece en el panel
  de Gestión de Operarios con estado `PENDIENTE` y sin documento.
- Confirmar que los usuarios preexistentes sin ficha quedan provisionados tras
  el arranque.
- Nota: la URL de Vercel (`campo-app-cyan.vercel.app`) sirve el estado
  productivo actual; el fix requiere desplegar backend + migración. La
  verificación funcional se hace en el entorno local (Docker) hasta el deploy.

## Dependencias
- Feature 15 (gestión de operarios), 39 (first-login / must_change_password).

## Estado
Realizada. Verificada end-to-end contra el stack Docker (V44 aplica, backfill
provisiona al admin, un usuario recién registrado aparece en el panel con estado
PENDIENTE y documento vacío). Mergeada a master.
