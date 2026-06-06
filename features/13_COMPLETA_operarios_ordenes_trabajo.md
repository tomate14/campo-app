# 13 - Operarios: Ordenes de Trabajo

## Estado
Completa. Implementada con backend, frontend Angular, migracion Flyway y validacion tecnica.

## Implementacion Realizada
- Backend `/api/v1/operarios/ordenes` con CRUD de ordenes, filtros, estados, actividades, aceptacion/rechazo e historial.
- Persistencia con soft delete y auditoria base via `AuditableEntity`.
- Dashboard operativo con KPIs de ordenes totales, pendientes, en progreso, completadas y vencidas.
- Frontend Angular en `/operarios/ordenes` con KPIs, filtros, tabs, cards operativas, panel contextual y modales.
- Navegacion agregada a la sidebar.
- Tarea 4 `Asignacion de maquinas` excluida explicitamente por pedido del usuario. No se agregaron campos ni relaciones a maquinaria.

## Descripcion
Sistema de ordenes de trabajo para asignacion de tareas, seguimiento operativo y registro de actividades completadas.

## Funcionalidades Principales
- Creacion y asignacion de ordenes de trabajo
- Seguimiento operativo
- Registro de actividades completadas
- Historial de trabajos completados

## Tareas
1. **Crear Orden de Trabajo**: Descripcion, lote/zona, operario
2. **Estado de Orden**: Pendiente, en progreso, completada, cancelada
3. **Asignacion a Operarios**: Quien realiza el trabajo
4. **Asignacion de Maquinas**: No implementada por pedido explicito del usuario
5. **Duracion Estimada vs. Real**: Tracking de tiempo
6. **Registro de Actividades**: Que se hizo, desde cuando hasta cuando
7. **Aceptacion/Rechazo**: Operario confirma completitud
8. **Historial Completo**: Auditoria de todas las ordenes

## Servicios
- `OrdenTrabajoService`: Creacion y gestion
- `RegistroActividadService`: Tracking de progreso operativo

## Repositorios
- `OrdenTrabajoRepository`
- `OrdenTrabajoActividadRepository`
- `OrdenTrabajoHistorialRepository`

## Requisitos Tecnicos
- UUID para ordenes
- Estados bien definidos
- Auditoria de cambios de estado
- Endpoint REST: `/api/v1/operarios/ordenes`
- Disponible offline (sincronizacion de cambios) queda para feature transversal offline
- Notificaciones en tiempo real quedan fuera del core implementado

## Dependencias
- Operarios (asignacion)
- Lotes (ubicacion del trabajo)
- GPS (tracking de operario)
- Finanzas (costo de hora de trabajo)
- Reportes (productividad)
