# 09 - Maquinaria: Mantenimiento Preventivo

## Descripción
Programa de mantenimiento preventivo y correctivo para máquinas agrícolas, optimizando disponibilidad y durabilidad.

## Funcionalidades Principales
- Calendario de mantenimiento preventivo
- Registro de intervenciones realizadas
- Control de repuestos necesarios
- Alertas de mantenimiento vencido
- Historial técnico por máquina

## Tareas
1. **Planes de Mantenimiento**: Según modelo de máquina y horas de uso
2. **Programación de Tareas**: Calendario de mantenimiento preventivo
3. **Registro de Intervenciones**: Fecha, tipo, tareas realizadas, operario
4. **Control de Repuestos**: Qué piezas fueron reemplazadas
5. **Costo de Mantenimiento**: Mano de obra y repuestos
6. **Historial Técnico**: Evolución del estado de la máquina
7. **Alertas de Vencimiento**: Próximos mantenimientos
8. **Disponibilidad**: Máquinas en taller vs. operacionales

## Servicios
- `MantenimientoService`: Programación y registro
- `RepuestosService`: Control de partes reemplazadas
- `TallerService`: Gestión de intervenciones

## Repositorios
- `PlanMantenimientoRepository`
- `IntervencionRepository`
- `RepuestoUtilizadoRepository`

## Requisitos Técnicos
- Notificaciones automáticas de vencimientos
- UUID para registros
- Auditoría de todas las intervenciones
- Endpoint REST: `/api/v1/maquinaria/mantenimiento`
- Disponible offline

## Dependencias
- Maquinaria (inventario)
- Inventario (stock de repuestos)
- Operarios (quién realiza mantenimiento)
- Finanzas (costo de mantenimiento)
- Reportes (análisis de disponibilidad)
