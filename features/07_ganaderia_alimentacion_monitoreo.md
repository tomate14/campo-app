# 07 - Ganadería: Alimentación y Monitoreo de Peso

## Descripción
Gestión de programas nutricionales y seguimiento de peso/condición corporal del rodeo.

## Funcionalidades Principales
- Planes nutricionales por tipo de animal
- Registro de alimentos suministrados
- Monitoreo de peso y condición corporal (BCS)
- Cálculos de conversión alimenticia
- Alertas de desnutrición o sobrepeso

## Tareas
1. **Formulación de Dietas**: Ingredientes, proporciones, costo
2. **Registro de Alimentación**: Qué, cuánto, cuándo se suministró
3. **Pesaje de Animales**: Registro periódico de peso
4. **Calificación de Condición**: Escala BCS (Body Condition Score)
5. **Consumo de Alimentos**: Seguimiento de inventario consumido
6. **Eficiencia Alimenticia**: Ganancia de peso vs. alimento consumido
7. **Análisis de Costos**: Costo de alimentación por animal
8. **Alertas Nutricionales**: Cambios bruscos de peso o condición

## Servicios
- `AlimentacionService`: Gestión de dietas y suministros
- `PesajeService`: Registro y análisis de peso
- `NutricionService`: Cálculos nutricionales

## Repositorios
- `DietaRepository`
- `RegistroAlimentacionRepository`
- `PesajeRepository`
- `CondicionCorporalRepository`

## Requisitos Técnicos
- Almacenamiento de series temporales (peso)
- UUID para registros
- Cálculos automáticos de conversión
- Endpoint REST: `/api/v1/ganaderia/alimentacion`
- Disponible offline

## Integraciones Externas
- Balanzas inteligentes (para pesaje automático)
- Cálculos nutricionales estándar (NRC, INRA)

## Dependencias
- Animales (identidad, tipo)
- Inventario (stock de alimentos)
- Operarios (quién alimenta)
- Finanzas (costo de alimentación)
- Reportes (análisis de eficiencia)
