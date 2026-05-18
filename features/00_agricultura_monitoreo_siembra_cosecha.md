# 00 - Agricultura: Monitoreo de Siembra y Cosecha

## Descripción
Gestión integral del ciclo de siembra a cosecha, incluyendo planificación, monitoreo en tiempo real y registro de eventos.

## Funcionalidades Principales
- Registro de lotes y calendarios de siembra
- Seguimiento fenológico del cultivo
- Alertas de condiciones óptimas/adversas
- Registro de cosecha y rendimiento
- Historial de operaciones por lote

## Tareas
1. **API de Lotes**: CRUD de lotes con geolocalización, área, cultivo, fechas
2. **Calendario Agrícola**: Planificación de siembra, desarrollo, cosecha
3. **Monitoreo Fenológico**: Registro de estados del cultivo (V4, V8, VE, R1, R3, etc.)
4. **Alertas Automáticas**: Condiciones climáticas, plagas detectadas, recomendaciones
5. **Registro de Cosecha**: Datos de rendimiento, calidad, humedad, toneladas
6. **Reportes de Ciclo**: Performance por cultivo y lote
7. **Sincronización Offline**: Datos de monitoreo disponibles sin internet

## Servicios
- `SiembraService`: Planificación y registro
- `MonitoreoService`: Seguimiento fenológico
- `CosechaService`: Registro y cálculo de rendimiento

## Repositorios
- `LoteRepository`
- `EventoSiembraRepository`
- `RegistroCosechaRepository`

## Requisitos Técnicos
- UUID para identificadores
- Soft delete obligatorio
- Auditoría automática de cambios
- Endpoint REST: `/api/v1/agricola/siembra-cosecha`
- Disponible offline (sync automático)

## Dependencias
- Clima (para alertas)
- Geolocalización (lotes en mapa)
- Reportes (análisis de performance)
