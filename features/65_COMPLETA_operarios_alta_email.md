# 65 - Operarios: email en el alta de operario

## Descripción
Permitir que el administrador ingrese el **email** del operario en el formulario
de alta (y edición) de operarios. Hoy el email/usuario de login se **autogenera**
a partir del nombre (`generateAvailableUsername` → p. ej. "jperez") y no hay forma
de indicarlo desde el panel. Con este cambio, si el admin completa el email, ese
pasa a ser el email de login del usuario asociado; si lo deja vacío, se mantiene
el comportamiento actual (autogenerado).

## Contexto
- El alta de operario (`OperarioServiceImpl.crear` → `createUserForOperario`) crea
  el `User` con `email = username` (generado) y `passwordHash = username`,
  `mustChangePassword = true` (feature 39/52).
- `OperarioResponse.username` expone `user.email`; la tabla lo muestra en la
  columna "Usuario".

## Alcance
### Backend
1. `OperarioRequest`: agregar campo `email` (opcional; `@Email` si viene informado).
2. `createUserForOperario`: si `request.email()` viene informado, usarlo como
   `user.email`; si no, fallback al `username` generado (comportamiento actual).
   Validar unicidad con `userRepository.existsByEmail(...)` → `BusinessException`
   si ya existe. La contraseña inicial se mantiene igual (= legajo generado,
   `mustChangePassword = true`); no se cambia el mecanismo de primer login.
3. `actualizar`: si `request.email()` viene informado y el operario tiene `user`,
   sincronizar `user.email` (validando unicidad contra OTROS usuarios). Si viene
   vacío, no tocar el email actual.
4. El legajo sigue autogenerándose (código interno del operario), independiente
   del email.

### Frontend web (`operarios-gestion-page`)
- Agregar un input **Email** al formulario del modal de operario (alta y edición).
- Sumar `email?` a `OperarioRequest` (modelo) y al `emptyOperario()`.
- En edición, precargar el email desde `operario.username` (que es el email del
  usuario).

## Fuera de alcance
- No se cambia el mecanismo de contraseña inicial ni el flujo de primer login
  (features 39/52). La contraseña inicial sigue siendo el legajo generado.
- No se migran emails de operarios existentes.

## Requisitos Técnicos
- Backend compila (`mvn compile`).
- Frontend `npm run type-check` verde.
- Alta con email → el usuario se crea con ese email de login (validado único).

## Verificación
- Crear un operario con email desde el panel → el `User` queda con ese email y se
  puede loguear con él (contraseña inicial = legajo, con cambio obligatorio).
- Crear un operario sin email → sigue autogenerando el usuario como antes.
- Email duplicado → error claro, sin crear el operario.

## Dependencias
- Feature 12 (alta de operarios), 39/52 (primer login), 63/64 (usuario/rol).

## Estado
Realizada.

## Resumen de implementación
- Backend: `OperarioRequest.email` (`@Email`, opcional). `createUserForOperario`
  usa el email informado o cae al username autogenerado (helper `resolveLoginEmail`
  que valida unicidad contra otros usuarios). `actualizar` sincroniza `user.email`
  cuando se informa uno nuevo. La contraseña inicial sigue siendo el legajo y el
  primer login no cambia.
- Frontend: campo Email opcional en el modal de alta/edición (`operarios-gestion-page`),
  `email?` en `OperarioRequest`, `emptyOperario()` con email vacío, precarga en
  edición desde `operario.username`, y `normalizeOperario` manda `undefined` si
  queda vacío.
- Verificado end-to-end contra Docker: alta con email → user con ese email de
  login (legajo autogenerado, rol RBAC asignado) y login OK con email + legajo
  (mustChangePassword=true); alta sin email → autogenera; email duplicado e
  inválido → error claro. Gates: `mvn compile` OK, `npm run type-check` verde.
