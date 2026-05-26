# 07 - Ganadería: Alimentación y Monitoreo de Peso

## Estado
Core operativo desarrollado.

## Descripción
Gestión de programas nutricionales y seguimiento de peso/condición corporal del rodeo.

## Funcionalidades Principales
- Planes nutricionales por tipo de animal.
- Registro de alimentos suministrados.
- Monitoreo de peso y condición corporal (BCS).
- Cálculos de conversión alimenticia.
- Alertas de desnutrición o sobrepeso por BCS.

## Tareas
- [x] Formulación de dietas: ingredientes, proporciones, costo.
- [x] Registro de alimentación: qué, cuánto, cuándo se suministró.
- [x] Pesaje de animales: registro periódico de peso.
- [x] Calificación de condición: escala BCS.
- [x] Consumo de alimentos: seguimiento de alimento consumido.
- [x] Eficiencia alimenticia: ganancia de peso vs. alimento consumido.
- [x] Análisis de costos: costo de alimentación por animal/mes operativo.
- [x] Alertas nutricionales: condición corporal fuera de rango.

## Servicios
- `AlimentacionService`: gestión de dietas, suministros, pesajes, KPIs y alertas.

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
Offline real, balanzas inteligentes e integración con estándares NRC/INRA quedan separados en la feature `35_ganaderia_alimentacion_offline_balanzas_nrc_inra.md`.
