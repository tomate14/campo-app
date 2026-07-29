# 60 - Agrícola: cosecha con pérdidas y destino

## Descripción
Ampliar el registro de cosecha para contemplar las pérdidas de cosecha con su
detalle y causa, y el destino del grano en el día (camión, silo, puerto, etc.),
sumando un apartado en el dashboard de administración.

## Alcance
1. **Pérdidas de cosecha**: agregar al registro de cosecha:
   - Área real cosechada (en %) y hectáreas cosechadas.
   - Granos perdidos y kilos de pérdida por hectárea.
   - Aclarar la semántica: lo que junta la cosechadora es el **rendimiento**; la
     pérdida es lo que queda en el campo.
   - Tipo de pérdida y causa (cabezal, cola, etc.).
2. **Destino del día**: registrar a dónde fue la cosecha en el día (camión, silo,
   puerto, etc.), con la cantidad correspondiente.
3. **Dashboard de administración**: apartado que consolide destino y pérdidas
   (por lote/campaña), integrado al dashboard existente.

## Requisitos Técnicos
- Backend: extender el modelo de `RegistroCosecha` (o entidad relacionada) con los
  campos de pérdidas y con el/los destinos del día. Migración Flyway.
- Web y mobile: formularios de cosecha con los nuevos campos (usar selects/chips
  para tipo de pérdida y destino).
- Dashboard: nuevas métricas/serie de destino y pérdidas.
- Estilo premium dark SaaS.

## Dependencias
- Feature 00 (siembra/cosecha), 10-reportes (dashboard agrícola).

## Estado
Pendiente.
