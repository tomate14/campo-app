# 22 - Reportes: Operacionales

## DescripciÃ³n
GeneraciÃ³n de reportes operacionales para anÃ¡lisis de productividad, eficiencia y toma de decisiones diarias.

## Funcionalidades Principales
- Reportes de actividades diarias
- AnÃ¡lisis de eficiencia operativa
- Productividad de operarios y mÃ¡quinas
- Cumplimiento de Ã³rdenes de trabajo
- Dashboards ejecutivos

## Tareas
1. **Reporte Diario**: Resumen de actividades del dÃ­a
2. **Reporte de Ã“rdenes**: Cumplimiento y estado de trabajos
3. **Reporte de MÃ¡quinas**: Uso, disponibilidad, problemas
4. **Reporte de Operarios**: Productividad, horas trabajadas
5. **Eficiencia de Lotes**: Actividades completadas por lote
6. **Incidentes**: Problemas reportados y resoluciÃ³n
7. **Reporte ClimÃ¡tico**: Eventos y impacto
8. **Dashboard**: MÃ©tricas en vivo

## Servicios
- `ReporteOperacionalService`: GeneraciÃ³n de reportes
- `DashboardService`: CÃ¡lculos de mÃ©tricas en vivo
- `AlertasService`: Notificaciones de anomalÃ­as

## Repositorios
- `ReporteRepository`
- `MetricaOperacionalRepository`

## Requisitos TÃ©cnicos
- Agregaciones en tiempo real
- Endpoint REST: `/api/v1/reportes/operacionales`
- GeneraciÃ³n de PDF/Excel
- GrÃ¡ficos interactivos
- Disponible offline (datos cached)
- ExportaciÃ³n por email automÃ¡tica

## Integraciones Externas
- Email (envÃ­o automÃ¡tico)
- Slack/Teams (notificaciones)

## Dependencias
- Ã“rdenes de Trabajo (tareas completadas)
- Maquinaria (uso y estado)
- Operarios (productividad)
- GPS/Tracking (ubicaciones)
- Clima (eventos adversos)
- Todas las otras features (datos consolidados)

