# 14 - Operarios: Asignaciones y Disponibilidad

## DescripciÃ³n
GestiÃ³n de disponibilidad, calendario de trabajo y asignaciÃ³n eficiente de operarios a tareas y mÃ¡quinas.

## Funcionalidades Principales
- Calendario de disponibilidad de operarios
- PlanificaciÃ³n de jornadas
- Conflictos de asignaciÃ³n
- RotaciÃ³n de personal
- AnÃ¡lisis de carga de trabajo

## Tareas
1. **Calendario de Disponibilidad**: DÃ­as y horarios que trabaja cada operario. Similar a google calendar
3. **Conflictos de Horario**: DetecciÃ³n cuando hay superposiciÃ³n de asignaciones
4. **Preferencias**: Operario + mÃ¡quina + tipo de tarea
5. **RotaciÃ³n de Personal**: Balanceo de carga entre operarios
8. **AnÃ¡lisis de Carga**: Horas asignadas vs. disponibles

## Servicios
- `DisponibilidadService`: GestiÃ³n de calendarios
- `PlanificacionService`: Algoritmos de asignaciÃ³n
- `ConflictoService`: DetecciÃ³n de problemas

## Repositorios
- `DisponibilidadRepository`
- `JornadaRepository`
- `AsignacionDisponibleRepository`

## Requisitos TÃ©cnicos
- Calendario integrado
- UUID para registros
- Alertas automÃ¡ticas de conflictos
- Endpoint REST: `/api/v1/operarios/disponibilidad`
- Disponible offline

## Dependencias
- Operarios (identidad)
- Ã“rdenes de Trabajo (asignaciones)
- Finanzas (horas y costos)
- Reportes (anÃ¡lisis de productividad)

