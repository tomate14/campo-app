# 52 - Web: Cambio obligatorio de contraseña en primer login

## Descripción
Extender al frontend web Angular el flujo de cambio obligatorio de contraseña inicial implementado para mobile en la feature 39, para que los usuarios generados automáticamente desde el alta de operarios tampoco puedan operar el panel web con la contraseña inicial vigente.

## Contexto
- La feature 12 genera usuarios automáticos en el alta de operarios con password inicial igual al username.
- La feature 39 agregó en backend la marca persistente `users.must_change_password`, el flag `mustChangePassword` en la respuesta de login/`/me` y el endpoint autenticado `POST /api/v1/auth/first-login/change-password` (revoca los refresh tokens previos y devuelve tokens nuevos).
- El backend ya cubre ambos clientes: esta feature es solo de frontend web.
- Evaluación registrada en la feature 39: el riesgo aplica igual en web, porque los usuarios operario pueden iniciar sesión en el panel Angular y la contraseña inicial seguiría vigente ahí aunque mobile la fuerce a cambiar.

## Tareas
1. Leer `mustChangePassword` en la respuesta del login web y en `/auth/me`.
2. Si el flag está activo, redirigir a una pantalla dedicada de cambio de contraseña inicial (estilo premium dark SaaS de Campo App) antes de permitir el acceso al resto del panel.
3. Bloquear la navegación con un guard de rutas mientras el cambio esté pendiente (incluye sesiones persistidas: refresh de página o reingreso).
4. Consumir `POST /api/v1/auth/first-login/change-password`, persistir los tokens nuevos devueltos y recién entonces continuar al panel.
5. Validaciones client-side espejadas con la política backend: mínimo 8 caracteres, minúscula, mayúscula, número y símbolo (`@$!%*?&`), confirmación igual a la nueva, nueva distinta de la actual.
6. Mensajes de error claros sin exponer información sensible (401 = contraseña actual incorrecta).

## Requisitos Técnicos
- Componente Angular standalone en carpeta propia con `.ts`, `.html` y `.css`.
- Guard funcional de Angular Router para el bloqueo.
- Reutilizar el servicio de auth existente del frontend.

## Dependencias
- Feature 39: backend del flujo (flag, endpoint, revocación de tokens).
- Feature 12: alta de operarios con usuario automático.

## Estado
Pendiente.
