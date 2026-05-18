# 13 - Operarios: Órdenes de Trabajo

## Descripción
Sistema de órdenes de trabajo para asignación de tareas, seguimiento en tiempo real y registro de actividades completadas.

## Funcionalidades Principales
- Creación y asignación de órdenes de trabajo
- Seguimiento en tiempo real
- Registro de actividades completadas
- Asignación de máquinas y recursos
- Historial de trabajos completados

## Tareas
1. **Crear Orden de Trabajo**: Descripción, lote/zona, máquina requerida, operario
2. **Estado de Orden**: Pendiente, en progreso, completada, cancelada
3. **Asignación a Operarios**: Quién realiza el trabajo
4. **Asignación de Máquinas**: Qué máquina se usa
5. **Duración Estimada vs. Real**: Tracking de tiempo
6. **Registro de Actividades**: Qué se hizo, desde cuándo hasta cuándo
7. **Aceptación/Rechazo**: Operario confirma completitud
8. **Historial Completo**: Auditoría de todas las órdenes

## Servicios
- `OrdenTrabajoService`: Creación y gestión
- `AsignacionService`: Distribución de tareas
- `RegistroActividadService`: Tracking de progress

## Repositorios
- `OrdenTrabajoRepository`
- `AsignacionOperarioRepository`
- `ActividadRepository`

## Requisitos Técnicos
- UUID para órdenes
- Estados bien definidos
- Auditoría de cambios de estado
- Endpoint REST: `/api/v1/operarios/ordenes`
- Disponible offline (sincronización de cambios)
- Notificaciones en tiempo real

## Dependencias
- Operarios (asignación)
- Maquinaria (asignación de recursos)
- Lotes (ubicación del trabajo)
- GPS (tracking de operario/máquina)
- Finanzas (costo de hora de trabajo)
- Reportes (productividad)
