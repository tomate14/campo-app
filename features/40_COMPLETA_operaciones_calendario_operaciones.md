# 40 - Operaciones: Calendario de Operaciones

## Descripcion
Nuevo modulo operativo diario para visualizar ordenes de trabajo programadas en formato calendario semanal.

## Objetivo
Centralizar operaciones reales programadas sobre agricultura, ganaderia, maquinaria y personal, permitiendo ver rapidamente que debe ejecutarse, quien es responsable, donde se realiza, que recursos intervienen y que operaciones estan retrasadas.

## Alcance
- Agregar opcion de sidebar `OPERACIONES > Calendario`.
- Crear pantalla `Calendario de Operaciones`.
- Vista semanal tipo Google Calendar.
- Columnas de lunes a domingo.
- Horario operativo de 06:00 a 20:00.
- Intervalos visuales de 30 minutos.
- Cada bloque representa una orden de trabajo con titulo, responsable, ubicacion, horario y estado.
- Filtros superiores por operario, lote y estado/operacion.
- Chips con los primeros 5 operarios retornados por backend para activar/desactivar visualizacion.
- Popup de detalle al seleccionar una operacion.
- Desde el popup permitir actualizar estado o registrar actividad, reutilizando endpoints de ordenes de trabajo.

## Fuente de Datos
- Reutilizar ordenes de trabajo existentes.
- Endpoint base: `/api/v1/operarios/ordenes/resumen`.
- Referencias:
  - `/api/v1/operarios/gestion/operarios`
  - `/api/v1/agricola/lotes`

## Requisitos Visuales
- Mantener estilo Campo App premium dark SaaS.
- Inspiracion Google Calendar + John Deere Operations Center.
- Glassmorphism suave, bordes amplios, glow verde sutil.
- Bloques coloreados segun estado de orden de trabajo.
- No usar diseno generico ni Bootstrap.

## Integraciones Futuras
- Drag & Drop.
- Reprogramacion.
- Notificaciones push.
- Integracion con clima.
- Integracion con lotes, potreros, maquinaria, operarios y alertas automaticas.

## Estado
Realizada.
