# 13 - Operarios: Ã“rdenes de Trabajo

## DescripciÃ³n
Sistema de Ã³rdenes de trabajo para asignaciÃ³n de tareas, seguimiento en tiempo real y registro de actividades completadas.

## Funcionalidades Principales
- CreaciÃ³n y asignaciÃ³n de Ã³rdenes de trabajo
- Seguimiento en tiempo real
- Registro de actividades completadas
- AsignaciÃ³n de mÃ¡quinas y recursos
- Historial de trabajos completados

## Tareas
1. **Crear Orden de Trabajo**: DescripciÃ³n, lote/zona, mÃ¡quina requerida, operario
2. **Estado de Orden**: Pendiente, en progreso, completada, cancelada
3. **AsignaciÃ³n a Operarios**: QuiÃ©n realiza el trabajo
4. **AsignaciÃ³n de MÃ¡quinas**: QuÃ© mÃ¡quina se usa
5. **DuraciÃ³n Estimada vs. Real**: Tracking de tiempo
6. **Registro de Actividades**: QuÃ© se hizo, desde cuÃ¡ndo hasta cuÃ¡ndo
7. **AceptaciÃ³n/Rechazo**: Operario confirma completitud
8. **Historial Completo**: AuditorÃ­a de todas las Ã³rdenes

## Servicios
- `OrdenTrabajoService`: CreaciÃ³n y gestiÃ³n
- `AsignacionService`: DistribuciÃ³n de tareas
- `RegistroActividadService`: Tracking de progress

## Repositorios
- `OrdenTrabajoRepository`
- `AsignacionOperarioRepository`
- `ActividadRepository`

## Requisitos TÃ©cnicos
- UUID para Ã³rdenes
- Estados bien definidos
- AuditorÃ­a de cambios de estado
- Endpoint REST: `/api/v1/operarios/ordenes`
- Disponible offline (sincronizaciÃ³n de cambios)
- Notificaciones en tiempo real

## Dependencias
- Operarios (asignaciÃ³n)
- Maquinaria (asignaciÃ³n de recursos)
- Lotes (ubicaciÃ³n del trabajo)
- GPS (tracking de operario/mÃ¡quina)
- Finanzas (costo de hora de trabajo)
- Reportes (productividad)

