# 04 - Ganadería: Trazabilidad Animal

## Descripción
Identificación única y seguimiento completo de cada animal, desde nacimiento hasta comercialización.

## Funcionalidades Principales
- Registro y caravana de animales
- Historial de movimientos y locaciones
- Genealogía y pedigree
- Trazabilidad integrada con SENASA
- QR/RFID para escaneo rápido

## Tareas
1. **Registro de Animales**: Caravana, raza, edad, peso, fecha de compra
2. **Identificación Única**: RFID, código QR, número de caravana
3. **Genealogía**: Madre, padre, línea genética
4. **Movimientos**: Registro de entrada, salida, transferencias entre potreros
5. **Ubicación Actual**: Corral/potrero donde se encuentra
6. **Historial Médico**: Enfermedades, tratamientos asociados
7. **Integración SENASA**: Exportación de trazabilidad para cumplimiento normativo

## Servicios
- `AnimalService`: CRUD de animales
- `TrazabilidadService`: Seguimiento de movimientos
- `GenealogiService`: Gestión de pedigree
- `SENASAService`: Integración normativa

## Repositorios
- `AnimalRepository`
- `MovimientoAnimalRepository`
- `GenealogiRepository`

## Requisitos Técnicos
- UUID para cada animal
- Soft delete obligatorio
- Auditoría de todos los movimientos
- Endpoint REST: `/api/v1/ganaderia/trazabilidad`
- Disponible offline (sync de movimientos)

## Integraciones Externas
- SENASA (Servicio Nacional de Sanidad y Calidad Agroalimentaria)
- RFID readers
- Lectores de códigos QR

## Dependencias
- Operarios (quién registra/mueve animales)
- Geolocalización (ubicación de corrales)
- Reportes (trazabilidad para exportación)
