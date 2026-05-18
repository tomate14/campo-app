# 22 - Reportes: Operacionales

## Descripción
Generación de reportes operacionales para análisis de productividad, eficiencia y toma de decisiones diarias.

## Funcionalidades Principales
- Reportes de actividades diarias
- Análisis de eficiencia operativa
- Productividad de operarios y máquinas
- Cumplimiento de órdenes de trabajo
- Dashboards ejecutivos

## Tareas
1. **Reporte Diario**: Resumen de actividades del día
2. **Reporte de Órdenes**: Cumplimiento y estado de trabajos
3. **Reporte de Máquinas**: Uso, disponibilidad, problemas
4. **Reporte de Operarios**: Productividad, horas trabajadas
5. **Eficiencia de Lotes**: Actividades completadas por lote
6. **Incidentes**: Problemas reportados y resolución
7. **Reporte Climático**: Eventos y impacto
8. **Dashboard**: Métricas en vivo

## Servicios
- `ReporteOperacionalService`: Generación de reportes
- `DashboardService`: Cálculos de métricas en vivo
- `AlertasService`: Notificaciones de anomalías

## Repositorios
- `ReporteRepository`
- `MetricaOperacionalRepository`

## Requisitos Técnicos
- Agregaciones en tiempo real
- Endpoint REST: `/api/v1/reportes/operacionales`
- Generación de PDF/Excel
- Gráficos interactivos
- Disponible offline (datos cached)
- Exportación por email automática

## Integraciones Externas
- Email (envío automático)
- Slack/Teams (notificaciones)

## Dependencias
- Órdenes de Trabajo (tareas completadas)
- Maquinaria (uso y estado)
- Operarios (productividad)
- GPS/Tracking (ubicaciones)
- Clima (eventos adversos)
- Todas las otras features (datos consolidados)
