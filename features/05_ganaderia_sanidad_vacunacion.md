# 05 - Ganadería: Sanidad y Vacunación

## Descripción
Programa integral de vacunación, medicación y control de enfermedades en el rodeo.

## Funcionalidades Principales
- Calendario de vacunaciones obligatorias y recomendadas
- Registro de aplicaciones de medicinas
- Alertas de próximas vacunas vencidas
- Historial veterinario por animal
- Reportes para auditoría sanitaria

## Tareas
1. **Calendario de Vacunación**: Programa anual según edad/tipo de animal
2. **Registro de Vacunas**: Aplicadas, fecha, operario, lote/marca
3. **Control de Vencimiento**: Alertas de dosis próximas a vencer
4. **Medicinas y Tratamientos**: Registro de aplicaciones
5. **Diagnósticos Veterinarios**: Enfermedades detectadas y tratamiento
6. **Reportes Sanitarios**: Para SENASA y auditorías
7. **Costos de Sanidad**: Seguimiento de gastos en medicinas

## Servicios
- `VacunacionService`: Gestión de calendarios y registros
- `MedicinaService`: Control de medicamentos
- `SanidadService`: Monitoreo de salud del rodeo

## Repositorios
- `VacunaRepository`
- `AplicacionVacunaRepository`
- `TratamientoMedicRepository`
- `DiagnosticoRepository`

## Requisitos Técnicos
- Notificaciones automáticas de vencimientos
- UUID para registros
- Auditoría de todas las aplicaciones
- Endpoint REST: `/api/v1/ganaderia/sanidad`
- Disponible offline

## Dependencias
- Animales (trazabilidad)
- Operarios (quién aplicó)
- Inventario (stock de vacunas)
- Finanzas (costos de sanidad)
- Reportes (auditoría SENASA)
