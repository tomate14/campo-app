# 23 - Reportes: Agrícola y Ganadería

## Descripción
Reportes especializados para análisis agrícola y ganadero con indicadores técnicos y comerciales.

## Funcionalidades Principales
- Análisis de cultivos
- Reporte de producción
- Indicadores zootécnicos
- Sanidad del rodeo
- Trazabilidad de productos

## Tareas
1. **Reporte de Siembra/Cosecha**: Volumen, calidad, costo por hectárea
2. **Rendimiento Comparativo**: Lotes, cultivos, años
3. **Análisis de Suelo**: Evolución de propiedades
4. **Indicadores Ganaderos**: Mortalidad, preñez, ganancia de peso
5. **Trazabilidad Animal**: SENASA, genealogía, sanidad
6. **Análisis de Alimentos**: Consumo, eficiencia, costo
7. **Calendario Fenológico**: Seguimiento del ciclo
8. **Proyecciones**: Estimaciones de rendimiento

## Servicios
- `ReporteAgriculturaService`: Análisis agrícola
- `ReporteGanaderiaService`: Análisis ganadero
- `IndicadorService`: Cálculos de KPIs

## Repositorios
- `ReporteAgriculturaRepository`
- `ReporteGanaderiaRepository`

## Requisitos Técnicos
- Cálculos complejos de indicadores
- Endpoint REST: `/api/v1/reportes/agricola-ganaderia`
- Generación de PDF/Excel
- Gráficos especializados
- Series temporales

## Integraciones Externas
- Normas SENASA
- Estándares zootécnicos internacionales

## Dependencias
- Siembra-Cosecha (datos agrícolas)
- Lotes (información territorial)
- Animales (trazabilidad)
- Sanidad (indicadores de salud)
- Alimentación (consumos)
- Reproducción (eficiencia reproductiva)
- Reportes Operacionales (base de datos)
