# 21 - Geolocalización: Tracking de Operarios

## Descripción
Sistema de localización y seguimiento en tiempo real de operarios en el campo para seguridad y optimización.

## Funcionalidades Principales
- Posicionamiento GPS en tiempo real
- Historial de movimientos
- Geofencing con alertas
- Seguridad y emergencias
- Análisis de productividad territorial

## Tareas
1. **GPS en Vivo**: Actualización continua de posición
2. **Historial de Rutas**: Trazado de movimientos diarios
3. **Geofencing**: Alertas al salir de zonas permitidas
4. **Botón de Pánico**: Emergencia para operario
5. **Duración en Zona**: Tiempo invertido en cada lote/tarea
6. **Velocidad de Desplazamiento**: Alerta si va muy rápido/lento
7. **Proximidad a Máquinas**: Verificar operario está con su máquina
8. **Reportes de Movilidad**: Análisis de eficiencia territorial

## Servicios
- `TrackingOperarioService`: Posiciones y seguimiento
- `GeofenceService`: Control de límites
- `AlertaService`: Notificaciones de eventos
- `SegurService`: Gestión de emergencias

## Repositorios
- `PosicionOperarioRepository`
- `MovimientoRepository`
- `EventoGeofenceRepository`

## Requisitos Técnicos
- Actualización cada 10-30 segundos
- UUID para eventos
- Auditoría de ubicaciones
- Endpoint REST: `/api/v1/geo/tracking`
- WebSocket para cambios en vivo
- Disponible offline (sync posterior)

## Requisitos de Privacidad
- Consentimiento explícito de operarios
- Visualización restringida a roles autorizados
- Eliminación automática de historiales según retención

## Dependencias
- Operarios (identidad)
- Órdenes de Trabajo (asignaciones)
- Seguridad (acceso a datos personales)
- Reportes (análisis de movilidad)
