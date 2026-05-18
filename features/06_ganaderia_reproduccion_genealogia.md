# 06 - Ganadería: Reproducción y Genealogía

## Descripción
Control integral del programa reproductivo, genealogía y mejoramiento genético del rodeo.

## Funcionalidades Principales
- Calendario reproductivo (montas, inseminaciones artificiales)
- Gestión de preñez y parto
- Cálculo de índices genéticos
- Reportes de eficiencia reproductiva
- Integración con laboratorios de IA

## Tareas
1. **Registro de Montas**: Fecha, toro/semental, vaca, resultado
2. **Inseminación Artificial (IA)**: Registro de procedimientos y genética usada
3. **Seguimiento de Preñez**: Diagnóstico, control de evolución
4. **Registro de Parto**: Fecha, complicaciones, viabilidad del ternero
5. **Genealogía Completa**: Árbol genealógico visualizable
6. **Índices Zootécnicos**: EPD, DEP, evaluación genética
7. **Alertas Reproductivas**: Animales en celo, próximos a parir
8. **Mejoramiento Genético**: Recomendaciones de cruzamientos

## Servicios
- `ReproduccionService`: Gestión del programa reproductivo
- `GenealogiService`: Cálculos de pedigree
- `PartosService`: Seguimiento de pariciones

## Repositorios
- `MontaRepository`
- `InseminacionRepository`
- `PreñezRepository`
- `PartoRepository`
- `IndiceGeneticoRepository`

## Requisitos Técnicos
- Cálculos genéticos complejos
- UUID para registros
- Auditoría de eventos reproductivos
- Endpoint REST: `/api/v1/ganaderia/reproduccion`
- Disponible offline

## Dependencias
- Animales (identidad y genealogía)
- Operarios (quién registra)
- Reportes (análisis reproductivo)
- Finanzas (costos de IA)
