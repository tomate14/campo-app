# 14 - Operarios: Asignaciones y Disponibilidad

## Descripción
Gestión de disponibilidad, calendario de trabajo y asignación eficiente de operarios a tareas y máquinas.

## Funcionalidades Principales
- Calendario de disponibilidad de operarios
- Planificación de jornadas
- Conflictos de asignación
- Rotación de personal
- Análisis de carga de trabajo

## Tareas
1. **Calendario de Disponibilidad**: Días y horarios que trabaja cada operario
2. **Jornadas**: Entrada, salida, descansos
3. **Conflictos de Horario**: Detección cuando hay superposición de asignaciones
4. **Preferencias**: Operario + máquina + tipo de tarea
5. **Rotación de Personal**: Balanceo de carga entre operarios
6. **Ausentismo**: Registro de faltas y permisos
7. **Sobretiempo**: Alertas de horas extraordinarias
8. **Análisis de Carga**: Horas asignadas vs. disponibles

## Servicios
- `DisponibilidadService`: Gestión de calendarios
- `PlanificacionService`: Algoritmos de asignación
- `ConflictoService`: Detección de problemas

## Repositorios
- `DisponibilidadRepository`
- `JornadaRepository`
- `AsignacionDisponibleRepository`

## Requisitos Técnicos
- Calendario integrado
- UUID para registros
- Alertas automáticas de conflictos
- Endpoint REST: `/api/v1/operarios/disponibilidad`
- Disponible offline

## Dependencias
- Operarios (identidad)
- Órdenes de Trabajo (asignaciones)
- Finanzas (horas y costos)
- Reportes (análisis de productividad)
