# 02 - Clima: Monitoreo e Integración

## Descripción
Capturas de datos meteorológicos en tiempo real y alertas climáticas para toma de decisiones agrícolas.

## Funcionalidades Principales
- Integración con APIs climáticas (OpenWeatherMap, INTA, etc.)
- Pronóstico de 15 días
- Alertas de heladas, lluvias, sequías
- Histórico climático por lote
- Recomendaciones basadas en clima

## Tareas
1. **Integración API Clima**: Conectar con proveedores externos
2. **Pronóstico a 15 días**: Descarga y almacenamiento de predicciones
3. **Datos Actuales**: Temperatura, humedad, presión, viento, radiación
4. **Alertas Inteligentes**: Heladas, lluvia excesiva, estrés hídrico
5. **Histórico**: Registro de datos para análisis temporal
6. **Recomendaciones Agrícolas**: Sugerencias de riego, aplicaciones, cosecha
7. **Visualización**: Gráficos de evolución climática

## Servicios
- `ClimaService`: Obtención y cálculo de datos
- `AlertaClimaService`: Generación de alertas
- `RecomendacionService`: Sugerencias basadas en clima

## Repositorios
- `DatoClimaRepository`
- `AlertaClimaRepository`
- `PronosticoRepository`

## Requisitos Técnicos
- Almacenamiento de series temporales
- UUID para registros
- Sincronización cada 30 minutos
- Endpoint REST: `/api/v1/clima/monitoreo`
- Disponible offline (últimos datos cached)

## Integraciones Externas
- OpenWeatherMap API
- INTA (Instituto Nacional de Tecnología Agropecuaria)
- APIs climáticas locales

## Dependencias
- Lotes (datos geo-ubicados)
- Alertas (notificaciones)
- Reportes (análisis histórico)
