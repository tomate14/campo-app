# 41 - Seguridad: Roles y permisos de menú

## Objetivo
Crear una pantalla administrativa para definir qué opciones del menú puede ver cada rol del sistema.

## Alcance
- Backend:
  - Agregar catálogo persistente de opciones de menú.
  - Agregar relación rol-opción de menú.
  - Exponer endpoints admin para listar matriz de permisos y guardar opciones habilitadas por rol.
  - Exponer endpoint autenticado para consultar las opciones visibles del usuario actual.
  - Por defecto `super_admin` y `admin` deben ver todas las opciones, incluida esta pantalla.
  - El rol `operario` debe inicializarse con todas las opciones disponibles para que luego el admin pueda restringirlas.
- Frontend:
  - Crear pantalla `/admin/roles-menu`.
  - Mostrar roles y opciones de menú agrupadas por sección.
  - Permitir activar/desactivar opciones por rol y guardar cambios.
  - Agregar entrada visible para admin en el sidebar.
  - Aplicar estilo premium dark SaaS Campo App.

## Reglas
- La pantalla solo debe estar disponible para `admin` y `super_admin`.
- El menú del sidebar debe ocultar opciones no habilitadas para el usuario actual.
- No se modifica el RBAC técnico de endpoints; esta feature controla visibilidad de navegación.

## Estado
Realizada.
