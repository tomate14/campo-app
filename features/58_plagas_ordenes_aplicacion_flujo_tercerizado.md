# 58 - Plagas: órdenes de aplicación con flujo tercerizado

## Descripción
Incorporar el concepto de **orden de aplicación** fitosanitaria y su flujo de
trabajo entre el operario del campo y un aplicador tercerizado, con cálculo del
total de producto, cierre automático al registrar la aplicación, y aceptación o
rechazo (con motivos) del registro resultante.

## Flujo objetivo
1. El **operario del campo** crea una **orden de aplicación** (asociada a una
   detección/lote): producto, dosis, unidad, superficie a tratar.
   - La orden calcula el **total de producto a aplicar** = dosis × superficie
     (respetando la unidad, p. ej. l/ha × ha = litros).
2. La orden es **recibida por el operario tercerizado** (aplicador): se muestra un
   **pin en el mapa** para el tercerizado con las órdenes pendientes.
3. El tercerizado **registra la aplicación**, lo que marca la **orden vinculada
   como realizada** (se cierra).
   - En el registro de aplicación, el **responsable se carga automáticamente con
     el usuario logueado** (quien lo carga puede ser un tercero) y el **aplicador
     es otro usuario seleccionable**.
4. El registro de aplicación puede marcarse **aceptado** o **no aceptado**; si no
   se acepta, se cargan los **motivos**.

## Estados sugeridos de la orden
`PENDIENTE → RECIBIDA → REALIZADA` (al registrar la aplicación) → el registro
asociado: `ACEPTADO` | `RECHAZADO` (con motivos).

## Alcance
1. **Backend**: entidad `OrdenAplicacion` (producto, dosis, unidad, superficie,
   total calculado, lote/detección, estado, aplicador asignado, timestamps),
   endpoints CRUD + transición de estados; vínculo orden↔aplicación; campos de
   aceptación/rechazo + motivos en la aplicación. Migración Flyway.
2. **Web y mobile**: alta de orden (campo), bandeja/pines de órdenes para el
   tercerizado, registro de aplicación que cierra la orden, y aceptación/rechazo
   con motivos. Responsable automático (logueado) + aplicador seleccionable.
3. **Mapa**: pin de órdenes pendientes para el aplicador tercerizado.
4. **Offline**: encolar alta de orden y registro de aplicación (feature 24).

## Requisitos Técnicos
- Cálculo del total según unidad (validar unidades soportadas).
- Roles/usuarios: distinguir operario de campo, aplicador tercerizado y quien
  carga el registro.
- Estilo premium dark SaaS.

## Dependencias
- Feature 37 (aplicaciones fitosanitarias), 57 (responsable automático),
  24 (offline), 12/13 (operarios/órdenes de trabajo como referencia de patrón).

## Estado
Pendiente.
