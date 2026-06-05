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
Pendiente.
