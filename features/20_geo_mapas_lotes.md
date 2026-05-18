# 20 - Geolocalización: Mapas y Lotes

## Descripción
Sistema de geolocalización con visualización de lotes, máquinas y operarios en mapas interactivos en tiempo real.

## Funcionalidades Principales
- Mapas interactivos de lotes
- Visualización de máquinas en movimiento
- Seguimiento de operarios
- Cálculos de distancias y áreas
- Importación de mapas base

## Tareas
1. **Mapa Base**: Integración con proveedores (Google Maps, Mapbox, OSM)
2. **Visualización de Lotes**: Polígonos en mapa con datos
3. **Máquinas en Vivo**: Posiciones actualizadas en tiempo real
4. **Operarios**: Localización de personas en campo
5. **Rutas**: Visualización de recorridos realizados
6. **Mediciones**: Distancia, área de lotes
7. **Geofencing**: Zonas permitidas/prohibidas
8. **Importación/Exportación**: Archivos KML, GeoJSON

## Servicios
- `MapaService`: Gestión de capas y visualización
- `GeoService`: Cálculos geoespaciales
- `ProvedorMapasService`: Integración con APIs

## Repositorios
- `PolígonoRepository`
- `PuntoInteresRepository`
- `RutaRepository`

## Requisitos Técnicos
- Base de datos geoespacial (PostGIS compatible)
- Endpoint REST: `/api/v1/geo/mapas`
- WebSocket para actualizaciones en vivo
- Disponible offline (mapas cached)
- Compatibilidad con estándares OGC (WMS, WFS)

## Integraciones Externas
- Google Maps
- Mapbox
- OpenStreetMap
- Providers de tiles

## Dependencias
- Lotes (polígonos a mostrar)
- Máquinas (posiciones GPS)
- Operarios (posiciones)
- Reportes (análisis espacial)
