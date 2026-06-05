# 01 - Agricultura: GestiÃ³n de Lotes

## DescripciÃ³n
AdministraciÃ³n centralizada de lotes: mapeo, propiedades, historial y anÃ¡lisis de suelo.

## Funcionalidades Principales
- Registro de lotes con polÃ­gonos geoespaciales
- Historial de cultivos por lote
- AnÃ¡lisis de suelo (pH, nutrientes, materia orgÃ¡nica)
- RotaciÃ³n de cultivos
- Mapeo visual de lotes

## Tareas
1. **CRUD de Lotes**: Crear, editar, eliminar lotes con soft delete
2. **PolÃ­gonos Geoespaciales**: Almacenar y visualizar lÃ­mites de lotes (GeoJSON)
3. **Propiedades del Suelo**: Registro de anÃ¡lisis quÃ­micos y fÃ­sicos
4. **Historial de Cultivos**: Trazabilidad de quÃ© se sembrÃ³ en cada lote y cuÃ¡ndo
5. **RotaciÃ³n de Cultivos**: Recomendaciones segÃºn rotaciÃ³n
6. **Ãrea y Productividad**: CÃ¡lculos de rendimiento por hectÃ¡rea
7. **API de Consulta**: BÃºsqueda filtrada por propiedades

## Servicios
- `LoteService`: GestiÃ³n de lotes y propiedades
- `GeoService`: Manejo de polÃ­gonos geoespaciales
- `SueloService`: AnÃ¡lisis y trazabilidad de suelo

## Repositorios
- `LoteRepository`
- `PropiedadSueloRepository`
- `HistoricoSueloRepository`

## Requisitos TÃ©cnicos
- Almacenamiento de geometrÃ­as (GeoJSON)
- UUID para lotes
- AuditorÃ­a de cambios en propiedades
- Endpoint REST: `/api/v1/agricola/lotes`
- Soporte para importar/exportar mapas

## Dependencias
- Siembra-Cosecha (historial de cultivos)
- GeolocalizaciÃ³n (visualizaciÃ³n de mapa)
- Reportes (productividad por lote)

