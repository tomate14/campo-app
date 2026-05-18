# 01 - Agricultura: Gestión de Lotes

## Descripción
Administración centralizada de lotes: mapeo, propiedades, historial y análisis de suelo.

## Funcionalidades Principales
- Registro de lotes con polígonos geoespaciales
- Historial de cultivos por lote
- Análisis de suelo (pH, nutrientes, materia orgánica)
- Rotación de cultivos
- Mapeo visual de lotes

## Tareas
1. **CRUD de Lotes**: Crear, editar, eliminar lotes con soft delete
2. **Polígonos Geoespaciales**: Almacenar y visualizar límites de lotes (GeoJSON)
3. **Propiedades del Suelo**: Registro de análisis químicos y físicos
4. **Historial de Cultivos**: Trazabilidad de qué se sembró en cada lote y cuándo
5. **Rotación de Cultivos**: Recomendaciones según rotación
6. **Área y Productividad**: Cálculos de rendimiento por hectárea
7. **API de Consulta**: Búsqueda filtrada por propiedades

## Servicios
- `LoteService`: Gestión de lotes y propiedades
- `GeoService`: Manejo de polígonos geoespaciales
- `SueloService`: Análisis y trazabilidad de suelo

## Repositorios
- `LoteRepository`
- `PropiedadSueloRepository`
- `HistoricoSueloRepository`

## Requisitos Técnicos
- Almacenamiento de geometrías (GeoJSON)
- UUID para lotes
- Auditoría de cambios en propiedades
- Endpoint REST: `/api/v1/agricola/lotes`
- Soporte para importar/exportar mapas

## Dependencias
- Siembra-Cosecha (historial de cultivos)
- Geolocalización (visualización de mapa)
- Reportes (productividad por lote)
