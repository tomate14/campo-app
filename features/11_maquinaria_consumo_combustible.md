# 11 - Maquinaria: Consumo de Combustible

## Descripción
Seguimiento integral del consumo de combustible por máquina para optimizar costos y detectar anomalías.

## Funcionalidades Principales
- Registro de recargas de combustible
- Cálculo de consumo litros/hora
- Detección de desvíos y robos
- Análisis de eficiencia por máquina
- Presupuesto vs. real

## Tareas
1. **Registro de Recargas**: Fecha, máquina, cantidad, costo
2. **Cálculo de Consumo**: Diferencia de tanque, horas de trabajo
3. **Consumo por Tarea**: L/hora según actividad (arado, siembra, etc.)
4. **Alertas de Anomalía**: Consumo inusualmente alto
5. **Consumo Acumulado**: Histórico por máquina y período
6. **Análisis Comparativo**: Máquinas similares
7. **Presupuesto de Combustible**: Estimación vs. real
8. **Integración con Sensores**: Lectura automática de tanque

## Servicios
- `CombustibleService`: Gestión de recargas
- `ConsumoService`: Cálculos y análisis
- `AlertaAnomaliaService`: Detección de desvíos

## Repositorios
- `RecargaCombustibleRepository`
- `ConsumoRepository`
- `PresupuestoCombustibleRepository`

## Requisitos Técnicos
- UUID para registros
- Auditoría de todas las recargas
- Endpoint REST: `/api/v1/maquinaria/combustible`
- Disponible offline
- Alertas automáticas de consumo anómalo

## Integraciones Externas
- Sensores de tanque (IoT)
- Proveedores de combustible (para cotizaciones)

## Dependencias
- Maquinaria (identidad y horometro)
- Operarios (quién recarga)
- GPS/Telemetría (horas de trabajo)
- Finanzas (costos)
- Reportes (análisis de eficiencia)
