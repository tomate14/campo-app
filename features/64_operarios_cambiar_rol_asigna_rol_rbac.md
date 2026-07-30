# 64 - Operarios: cambiar rol asigna el rol RBAC real

## Descripción
El rol de un operario debe ser **el rol RBAC de verdad** (`user_roles`), no un
texto descriptivo suelto. Al cambiar el rol de un operario (botón "Cambiar rol")
o al asignarlo en el alta, el sistema debe **reemplazar el rol del usuario en la
base** (`user_roles`) por el rol elegido, de modo que el usuario obtenga
inmediatamente el menú y los permisos correspondientes. El campo `rol_operativo`
pasa a ser una **referencia al nombre del rol** (mismo catálogo `roles`), no un
campo de texto libre.

## Problema (bug reportado)
- Un usuario auto-registrado al que se le "asignó el rol operario" desde el
  panel no veía ninguna opción de menú al loguearse en la web.
- Causa: había dos conceptos desconectados:
  - `operarios.rol_operativo`: texto descriptivo en la ficha. Es lo que
    modificaba el botón "Cambiar rol". No otorga permisos.
  - `user_roles` (rol RBAC): lo que realmente consume el menú
    (`GET /menu-options/me` → `role_menu_options`). Nunca se tocaba desde el
    panel de operarios → quedaba vacío → menú vacío.
- El rol RBAC "operario" ya tiene 19 opciones de menú configuradas; el problema
  era exclusivamente que el usuario no tenía ninguna fila en `user_roles`.

## Estado del frontend (ya correcto)
`operarios-gestion-page` ya carga el catálogo de roles RBAC
(`AdminMenuService.getRoles()` → `GET /menu-options/roles`) y tanto el select de
alta ("Rol") como el de "Cambiar rol" ("Nuevo rol") ya envían el `roleName`
RBAC. No hace falta cambiar la carga de datos; sí ajustar copys de "Rol
operativo" → "Rol" para reflejar que es el rol real.

## Alcance
### Backend (`OperarioServiceImpl`)
1. `cambiarRol(request)`: además de setear `operario.rolOperativo = rolNuevo` y
   registrar el historial, **reemplazar el rol RBAC del usuario asociado**:
   - Validar que `rolNuevo` exista en el catálogo `roles`
     (`RoleRepository.findByName`); si no, `BusinessException`.
   - Tomar `operario.getUser()`; si no es null, setear sus roles a exactamente
     `{ rol }` (reemplazo completo, no acumulación) y persistir el usuario.
   - Si el operario no tiene user asociado, documentar/loguear (con feature 63
     todo operario tiene user).
2. `crear(request)`: al crear el `User` (`createUserForOperario`), asignar el
   rol RBAC que corresponde a `request.rolOperativo()` (buscándolo por nombre),
   en vez del "operario" hardcodeado. Si el rol no existe, error claro.
3. `actualizar(request)`: si `rolOperativo` viene y cambia, sincronizar también
   el rol RBAC del usuario (mismo reemplazo completo), para no dejar el panel y
   el RBAC desincronizados.
4. Reutilizar `RoleRepository` (ya inyectado) y `UserRepository`.

### Frontend (menor)
- Renombrar los copys visibles "Rol operativo" → "Rol" y "Cambiar rol
  operativo" → "Cambiar rol" en `operarios-gestion-page` (el campo ahora ES el
  rol RBAC). Sin cambios de lógica ni de contrato.

## Fuera de alcance
- No se migra el `rol_operativo` histórico de los operarios seed (valores de
  texto libre como `ENCARGADO_AGRICOLA`) a nombres de rol RBAC: se corrige a
  medida que se les cambie el rol. Documentado.
- La provisión de feature 63 sigue dejando `rol_operativo = SIN_ASIGNAR` y sin
  rol RBAC hasta que el admin asigne uno (flujo esperado).

## Requisitos Técnicos
- Backend compila (`mvnw compile`).
- `npm run type-check` verde si se tocó el frontend.
- Al cambiar el rol de un operario, `user_roles` refleja exactamente el rol
  elegido y `GET /menu-options/me` del usuario devuelve el menú del rol.

## Verificación
- Cambiar el rol de un usuario recién registrado a "operario" desde el panel →
  el usuario ve las 19 opciones del rol al re-loguearse.
- Cambiar a otro rol (p. ej. "contador") → `user_roles` queda solo con ese rol
  y el menú cambia acorde.

## Dependencias
- Feature 41 (roles/menú por permisos), 63 (todo usuario es un operario).

## Estado
Pendiente.
