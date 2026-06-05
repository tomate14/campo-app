# 11 - Maquinaria: Consumo de Combustible

## DescripciÃ³n
Seguimiento integral del consumo de combustible por mÃ¡quina para optimizar costos y detectar anomalÃ­as.

## Funcionalidades Principales
- Registro de recargas de combustible
- CÃ¡lculo de consumo litros/hora
- DetecciÃ³n de desvÃ­os y robos
- AnÃ¡lisis de eficiencia por mÃ¡quina
- Presupuesto vs. real

## Tareas
1. **Registro de Recargas**: Fecha, mÃ¡quina, cantidad, costo
2. **CÃ¡lculo de Consumo**: Diferencia de tanque, horas de trabajo
3. **Consumo por Tarea**: L/hora segÃºn actividad (arado, siembra, etc.)
4. **Alertas de AnomalÃ­a**: Consumo inusualmente alto
5. **Consumo Acumulado**: HistÃ³rico por mÃ¡quina y perÃ­odo
6. **AnÃ¡lisis Comparativo**: MÃ¡quinas similares
7. **Presupuesto de Combustible**: EstimaciÃ³n vs. real
8. **IntegraciÃ³n con Sensores**: Lectura automÃ¡tica de tanque

## Servicios
- `CombustibleService`: GestiÃ³n de recargas
- `ConsumoService`: CÃ¡lculos y anÃ¡lisis
- `AlertaAnomaliaService`: DetecciÃ³n de desvÃ­os

## Repositorios
- `RecargaCombustibleRepository`
- `ConsumoRepository`
- `PresupuestoCombustibleRepository`

## Requisitos TÃ©cnicos
- UUID para registros
- AuditorÃ­a de todas las recargas
- Endpoint REST: `/api/v1/maquinaria/combustible`
- Disponible offline
- Alertas automÃ¡ticas de consumo anÃ³malo

## Integraciones Externas
- Sensores de tanque (IoT)
- Proveedores de combustible (para cotizaciones)

## Dependencias
- Maquinaria (identidad y horometro)
- Operarios (quiÃ©n recarga)
- GPS/TelemetrÃ­a (horas de trabajo)
- Finanzas (costos)
- Reportes (anÃ¡lisis de eficiencia)

