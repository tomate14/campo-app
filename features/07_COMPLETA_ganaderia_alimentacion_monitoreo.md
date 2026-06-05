# 07 - GanaderÃ­a: AlimentaciÃ³n y Monitoreo de Peso

## Estado
Core operativo desarrollado.

## DescripciÃ³n
GestiÃ³n de programas nutricionales y seguimiento de peso/condiciÃ³n corporal del rodeo.

## Funcionalidades Principales
- Planes nutricionales por tipo de animal.
- Registro de alimentos suministrados.
- Monitoreo de peso y condiciÃ³n corporal (BCS).
- CÃ¡lculos de conversiÃ³n alimenticia.
- Alertas de desnutriciÃ³n o sobrepeso por BCS.

## Tareas
- [x] FormulaciÃ³n de dietas: ingredientes, proporciones, costo.
- [x] Registro de alimentaciÃ³n: quÃ©, cuÃ¡nto, cuÃ¡ndo se suministrÃ³.
- [x] Pesaje de animales: registro periÃ³dico de peso.
- [x] CalificaciÃ³n de condiciÃ³n: escala BCS.
- [x] Consumo de alimentos: seguimiento de alimento consumido.
- [x] Eficiencia alimenticia: ganancia de peso vs. alimento consumido.
- [x] AnÃ¡lisis de costos: costo de alimentaciÃ³n por animal/mes operativo.
- [x] Alertas nutricionales: condiciÃ³n corporal fuera de rango.

## Servicios
- `AlimentacionService`: gestiÃ³n de dietas, suministros, pesajes, KPIs y alertas.

## Repositorios
- `DietaNutricionalRepository`
- `DietaIngredienteRepository`
- `RegistroAlimentacionRepository`
- `PesajeAnimalRepository`

## Endpoints
- `GET /api/v1/ganaderia/alimentacion`
- `GET /api/v1/ganaderia/alimentacion/dashboard`
- `GET|POST /api/v1/ganaderia/alimentacion/dietas`
- `GET|POST /api/v1/ganaderia/alimentacion/registros`
- `GET|POST /api/v1/ganaderia/alimentacion/pesajes`

## Pendientes Fuera De Alcance
Offline real, balanzas inteligentes e integraciÃ³n con estÃ¡ndares NRC/INRA quedan separados en la feature `35_ganaderia_alimentacion_offline_balanzas_nrc_inra.md`.

