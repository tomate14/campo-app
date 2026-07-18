# 39 - Mobile: Cambio obligatorio de contraseña en primer login

## Descripción
Implementar el flujo obligatorio para que los usuarios creados automáticamente desde el registro de operarios cambien su contraseña inicial al iniciar sesión por primera vez en la aplicación mobile.

## Contexto
En la feature 12, el alta de operarios genera automáticamente un usuario de acceso con esta regla:

- Username: primera letra del nombre en minúscula + primera palabra del apellido.
- Ejemplo: `Maximiliano Roselli Juarez` -> `mroselli`.
- Si el username ya existe, se agrega un número al final.
- Password inicial: igual al username generado.

## Objetivo
Evitar que la contraseña inicial quede vigente después del primer acceso mobile.

## Tareas
1. **Backend**
   - Agregar marca persistente para indicar si el usuario debe cambiar contraseña.
   - Marcar como pendiente de cambio a los usuarios generados desde operarios.
   - Exponer endpoint seguro para cambio de contraseña inicial.
   - Invalidar tokens previos luego del cambio.
   - Devolver en la respuesta de login si el usuario debe cambiar contraseña.

2. **Mobile**
   - Detectar `mustChangePassword` o flag equivalente en login.
   - Redirigir a pantalla obligatoria de cambio de contraseña.
   - Bloquear navegación al resto de la app hasta completar el cambio.
   - Validar confirmación de contraseña y criterios mínimos.
   - Persistir nueva sesión luego del cambio.

3. **Web**
   - Evaluar si el mismo flujo debe aplicarse también al login web para usuarios operarios.

4. **Seguridad**
   - No permitir reutilizar la contraseña inicial.
   - Registrar auditoría del cambio.
   - Mostrar mensajes claros sin exponer información sensible.

## Requisitos Técnicos
- Endpoint sugerido: `POST /api/v1/auth/first-login/change-password`.
- Campo sugerido en `users`: `must_change_password BOOLEAN NOT NULL DEFAULT FALSE`.
- Respuesta de login debe incluir el flag.
- La pantalla mobile debe seguir el estilo premium dark SaaS de Campo App.

## Dependencias
- Feature 12: Operarios: Gestión y Administración.
- Autenticación JWT existente.
- Mobile Expo Router.

## Estado
Realizada.

## Resumen de Implementación
- **Backend**: migración `V43__users_must_change_password.sql` (flag `must_change_password` en `users` + backfill de usuarios vinculados a operarios; el backfill afectó 0 filas en el entorno actual porque los operarios seed no tienen `user_id`), `.mustChangePassword(true)` en `createUserForOperario`, flag `mustChangePassword` en `AuthResponse.UserDto` (login, register y `/me`), y endpoint autenticado `POST /api/v1/auth/first-login/change-password` (`FirstLoginChangePasswordRequest` con la misma política de password que el registro). El servicio valida flag pendiente, contraseña actual, y rechaza reutilizar la inicial; revoca todos los refresh tokens ANTES de emitir tokens nuevos y audita `FIRST_LOGIN_PASSWORD_CHANGED` / `FIRST_LOGIN_PASSWORD_CHANGE_FAILED`.
- **Fix preexistente descubierto**: `LoginRequest` validaba `@Email`, por lo que los usuarios generados desde operarios (username sin formato email, feature 12) **nunca habían podido iniciar sesión**. Se quitó `@Email` del login (el registro sigue estricto) y el label mobile pasó a "Email o usuario".
- **Mobile**: `mustChangePassword` en `AuthUser`, `changeInitialPassword` en la API de auth, pantalla `(auth)/cambiar-password.tsx` (premium dark, 3 campos, validación client-side espejada con la política backend, sin opción de salteo; única salida "Volver al login" con `clearSession`), redirección desde el login cuando el flag está activo, y guard en el gate de navegación de `_layout.tsx` que bloquea el resto de la app también con sesión persistida (app matada y reabierta).
- **Web**: evaluación registrada — el riesgo aplica igual en el panel Angular; el backend ya deja el contrato listo. El consumo web se materializó como feature 52.
- **Verificación**: 5 tests JUnit (`AuthServiceFirstLoginPasswordTest`) + batería curl contra el stack Docker (flag en login inicial, 401 sin token / current incorrecta, 400 política / reutilización / sin pendiente, refresh token previo revocado, login viejo 401 y nuevo 200 con flag false, audit log presente) + flujo completo verificado en navegador (login inicial → pantalla obligatoria → validación client-side → cambio → dashboard; guard con sesión persistida verificado). `mvn compile` + tests y `tsc`/jest verdes.
