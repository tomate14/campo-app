# 04 - GanaderÃ­a: Trazabilidad Animal

## DescripciÃ³n
IdentificaciÃ³n Ãºnica y seguimiento completo de cada animal, desde nacimiento hasta comercializaciÃ³n.

## Funcionalidades Principales
- Registro y caravana de animales
- Historial de movimientos y locaciones
- GenealogÃ­a y pedigree
- Trazabilidad integrada con SENASA
- QR/RFID para escaneo rÃ¡pido

## Tareas
1. **Registro de Animales**: Caravana, raza, edad, peso, fecha de compra
2. **IdentificaciÃ³n Ãšnica**: RFID, cÃ³digo QR, nÃºmero de caravana
3. **GenealogÃ­a**: Madre, padre, lÃ­nea genÃ©tica
4. **Movimientos**: Registro de entrada, salida, transferencias entre potreros
5. **UbicaciÃ³n Actual**: Corral/potrero donde se encuentra
6. **Historial MÃ©dico**: Enfermedades, tratamientos asociados
7. **IntegraciÃ³n SENASA**: ExportaciÃ³n de trazabilidad para cumplimiento normativo

## Servicios
- `AnimalService`: CRUD de animales
- `TrazabilidadService`: Seguimiento de movimientos
- `GenealogiService`: GestiÃ³n de pedigree
- `SENASAService`: IntegraciÃ³n normativa

## Repositorios
- `AnimalRepository`
- `MovimientoAnimalRepository`
- `GenealogiRepository`

## Requisitos TÃ©cnicos
- UUID para cada animal
- Soft delete obligatorio
- AuditorÃ­a de todos los movimientos
- Endpoint REST: `/api/v1/ganaderia/trazabilidad`
- Disponible offline (sync de movimientos)

## Integraciones Externas
- SENASA (Servicio Nacional de Sanidad y Calidad Agroalimentaria)
- RFID readers
- Lectores de cÃ³digos QR

## Dependencias
- Operarios (quiÃ©n registra/mueve animales)
- GeolocalizaciÃ³n (ubicaciÃ³n de corrales)
- Reportes (trazabilidad para exportaciÃ³n)

