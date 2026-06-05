# 05 - GanaderÃ­a: Sanidad y VacunaciÃ³n

## DescripciÃ³n
Programa integral de vacunaciÃ³n, medicaciÃ³n y control de enfermedades en el rodeo.

## Funcionalidades Principales
- Calendario de vacunaciones obligatorias y recomendadas
- Registro de aplicaciones de medicinas
- Alertas de prÃ³ximas vacunas vencidas
- Historial veterinario por animal
- Reportes para auditorÃ­a sanitaria

## Tareas
1. **Calendario de VacunaciÃ³n**: Programa anual segÃºn edad/tipo de animal
2. **Registro de Vacunas**: Aplicadas, fecha, operario, lote/marca
3. **Control de Vencimiento**: Alertas de dosis prÃ³ximas a vencer
4. **Medicinas y Tratamientos**: Registro de aplicaciones
5. **DiagnÃ³sticos Veterinarios**: Enfermedades detectadas y tratamiento
6. **Reportes Sanitarios**: Para SENASA y auditorÃ­as
7. **Costos de Sanidad**: Seguimiento de gastos en medicinas

## Servicios
- `VacunacionService`: GestiÃ³n de calendarios y registros
- `MedicinaService`: Control de medicamentos
- `SanidadService`: Monitoreo de salud del rodeo

## Repositorios
- `VacunaRepository`
- `AplicacionVacunaRepository`
- `TratamientoMedicRepository`
- `DiagnosticoRepository`

## Requisitos TÃ©cnicos
- Notificaciones automÃ¡ticas de vencimientos
- UUID para registros
- AuditorÃ­a de todas las aplicaciones
- Endpoint REST: `/api/v1/ganaderia/sanidad`
- Disponible offline

## Dependencias
- Animales (trazabilidad)
- Operarios (quiÃ©n aplicÃ³)
- Inventario (stock de vacunas)
- Finanzas (costos de sanidad)
- Reportes (auditorÃ­a SENASA)

