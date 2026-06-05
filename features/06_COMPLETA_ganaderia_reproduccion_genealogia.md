# 06 - GanaderÃ­a: ReproducciÃ³n y GenealogÃ­a

## DescripciÃ³n
Control integral del programa reproductivo, genealogÃ­a y mejoramiento genÃ©tico del rodeo.

## Funcionalidades Principales
- Calendario reproductivo (montas, inseminaciones artificiales)
- GestiÃ³n de preÃ±ez y parto
- CÃ¡lculo de Ã­ndices genÃ©ticos
- Reportes de eficiencia reproductiva
- IntegraciÃ³n con laboratorios de IA

## Tareas
1. **Registro de Montas**: Fecha, toro/semental, vaca, resultado
2. **InseminaciÃ³n Artificial (IA)**: Registro de procedimientos y genÃ©tica usada
3. **Seguimiento de PreÃ±ez**: DiagnÃ³stico, control de evoluciÃ³n
4. **Registro de Parto**: Fecha, complicaciones, viabilidad del ternero
5. **GenealogÃ­a Completa**: Ãrbol genealÃ³gico visualizable
6. **Ãndices ZootÃ©cnicos**: EPD, DEP, evaluaciÃ³n genÃ©tica
7. **Alertas Reproductivas**: Animales en celo, prÃ³ximos a parir
8. **Mejoramiento GenÃ©tico**: Recomendaciones de cruzamientos

## Servicios
- `ReproduccionService`: GestiÃ³n del programa reproductivo
- `GenealogiService`: CÃ¡lculos de pedigree
- `PartosService`: Seguimiento de pariciones

## Repositorios
- `MontaRepository`
- `InseminacionRepository`
- `PreÃ±ezRepository`
- `PartoRepository`
- `IndiceGeneticoRepository`

## Requisitos TÃ©cnicos
- CÃ¡lculos genÃ©ticos complejos
- UUID para registros
- AuditorÃ­a de eventos reproductivos
- Endpoint REST: `/api/v1/ganaderia/reproduccion`
- Disponible offline

## Dependencias
- Animales (identidad y genealogÃ­a)
- Operarios (quiÃ©n registra)
- Reportes (anÃ¡lisis reproductivo)
- Finanzas (costos de IA)

