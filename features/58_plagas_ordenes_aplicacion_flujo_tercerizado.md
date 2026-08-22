# 58 - Plagas: órdenes de aplicación con flujo tercerizado

## Descripción
Incorporar el concepto de **orden de aplicación** fitosanitaria y su flujo entre el
**responsable** que la carga (usuario logueado) y el **operario/aplicador** al que
se le asigna (otro usuario del sistema). La orden se crea desde una **burbuja nueva**
en el mapa de Plagas (web) y en el mapa de la app mobile, aparece en el **histórico
del lote**, lleva un **número de orden correlativo** (desde 1) y, cuando el operario
la **acepta**, se transforma en un **registro de aplicación** normal del sistema.

## Flujo objetivo
1. El **responsable** (usuario logueado) crea una **orden de aplicación** desde la
   burbuja del mapa (web Plagas / mobile): elige lote (y opcionalmente detección),
   producto, principio activo, dosis, unidad, superficie a tratar, fecha y demás
   datos de la aplicación.
   - `responsableId` = id del usuario logueado (automático).
   - `operarioId` = otro usuario del sistema, seleccionable por id (el "tercero").
   - Se le asigna un **número de orden** correlativo empezando en 1.
2. La orden queda **PENDIENTE** y visible para el operario asignado.
3. El **operario acepta** la orden → pasa a **ACEPTADA** y vuelve al **responsable**
   (creador) y a los **admin/super_admin** para su validación (aún **sin** generar la
   aplicación). Si la **rechaza**, pasa a **RECHAZADA** (con motivo).
4. El **responsable o un admin/super_admin valida** la orden (botón "Validar") →
   recién ahí se genera el **registro de aplicación** (`AplicacionFitosanitaria`) con
   los datos de la orden, tal como funciona hoy el sistema; la orden pasa a **VALIDADA**.
5. La orden aparece en el **histórico del lote** (web y mobile) como un evento más.

## Estados de la orden
`PENDIENTE → ACEPTADA` (por el operario) `→ VALIDADA` (por el responsable/admin: genera
el registro de aplicación) | `RECHAZADA` (por el operario, con motivo).
Autorización: acepta/rechaza solo el operario asignado; valida solo el responsable o un
admin/super_admin.

## Número de orden (tabla separada)
- El **número correlativo** de la orden NO vive en la tabla de la orden: se guarda en
  una **tabla separada** de numeración. Al crear la orden se calcula el siguiente
  número (correlativo global desde 1) y se persiste la relación en esa tabla.
- El número se expone en el DTO/response de la orden (join/lookup).

## Alcance
1. **Backend**:
   - Entidad `OrdenAplicacion` (lote, detección opcional, producto, principio activo,
     dosis, unidad, superficie, fecha, estado, `responsableId`, `operarioId`, motivo
     de rechazo, timestamps).
   - Tabla separada de numeración (`orden_aplicacion_numero`) con el correlativo.
   - Endpoints: crear, editar, listar (con filtros: por responsable creador, por
     operario asignado, por estado, por lote), aceptar (genera aplicación) y rechazar.
   - Al aceptar: crear `AplicacionFitosanitaria` con los datos de la orden.
   - Migración Flyway (tabla orden + tabla numeración) y permiso RBAC del módulo.
2. **Web (Angular)**:
   - Burbuja nueva "Orden de aplicación" en el rail del mapa de Plagas + formulario
     de alta (responsable automático, operario seleccionable por id).
   - Nueva opción en el **menú izquierdo** con su ruta y permiso.
   - Página/panel que **lista todas** las órdenes con **filtro arriba** (estado,
     operario, responsable, lote); edición de la orden.
   - La orden aparece en el histórico del lote (componente compartido `app-lote-historial`).
3. **Mobile (React Native/Expo)**:
   - Burbuja nueva "Orden de aplicación" en el mapa de lotes + pantalla de alta.
   - Nueva opción en el **menú izquierdo**.
   - Lista: si el usuario es **operario**, ve las órdenes **asignadas a él**; si es
     **responsable**, ve las órdenes **que creó** (con edición posterior).
   - Aceptar/rechazar la orden desde mobile (aceptar genera la aplicación).
   - La orden aparece en el histórico del lote (`buildLoteHistory`).
4. **Offline** (implementado): las mutaciones de orden operan offline vía el outbox
   (feature 24): alta (POST), edición (PUT), y aceptar/validar/rechazar (POST acción).
   El remap de tempId reescribe el id en la URL, así que aceptar/validar sobre una orden
   creada offline se resuelve al drenar; el drain usa Idempotency-Key y las acciones son
   idempotentes en el backend.

## Requisitos Técnicos
- `responsableId` automático (usuario logueado); `operarioId` referenciando a otro
  usuario del sistema por id.
- Número correlativo en tabla separada, empezando en 1, sin huecos por diseño simple
  (MAX+1 / contador) — documentar la estrategia elegida.
- Aceptación idempotente: aceptar una orden ya aceptada no duplica la aplicación.
- Estilo premium dark SaaS; iconos SVG reales; código en inglés, comentarios en español.

## Dependencias
- Feature 37 (aplicaciones fitosanitarias), 57 (responsable automático),
  60 (patrón de módulo nuevo con permiso RBAC), 24 (offline),
  12/13 (operarios/usuarios del sistema como referencia).

## Estado
Realizada (backend + web + mobile). Numero correlativo en tabla separada
`orden_aplicacion_numero`. Pendiente de verificacion end-to-end contra Docker.
