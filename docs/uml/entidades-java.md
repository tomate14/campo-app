# UML de entidades Java - Campo App

Fecha de relevamiento: 2026-06-09

Este documento refleja el estado actual de las entidades Java/JPA del sistema. No representa el modelo ideal final de integridad referencial definido en la feature 43, sino la estructura que existe hoy en el codigo.

## Leyenda

- `-->` relacion por FK/JPA existente.
- `--` relacion many-to-many por tabla intermedia.
- `..>` relacion pendiente o deuda tecnica detectada.
- Los atributos listados son los mas relevantes para entender la estructura, no todos los campos de cada entidad.

## Seguridad, usuarios y roles

```mermaid
classDiagram
direction LR

class User {
  UUID id
  String email
  String username
  String password
  Boolean enabled
}

class Role {
  UUID id
  String name
  String description
}

class Permission {
  UUID id
  String name
  String module
  String action
}

class RefreshToken {
  UUID id
  String token
  Instant expiryDate
}

class AuditLog {
  UUID id
  String username
  String action
  String entityType
  UUID entityId
  LocalDateTime createdAt
}

User "0..*" -- "0..*" Role : user_roles
Role "0..*" -- "0..*" Permission : role_permissions
RefreshToken "*" --> "1" User : user_id
```

## Agricultura, clima y plagas

```mermaid
classDiagram
direction LR

class Lote {
  UUID id
  String nombre
  BigDecimal areaHectareas
  String cultivo
  Integer temporada
  String estado
  String geoJson
}

class EventoSiembra {
  UUID id
  LocalDate fechaSiembra
  String cultivo
  BigDecimal superficie
}

class RegistroCosecha {
  UUID id
  LocalDate fechaCosecha
  BigDecimal rendimiento
  BigDecimal volumen
}

class PropiedadSuelo {
  UUID id
  String tipo
  BigDecimal valor
  LocalDate fechaMedicion
}

class HistoricoCultivo {
  UUID id
  String cultivo
  Integer temporada
  BigDecimal rendimiento
}

class CatalogoPlaga {
  UUID id
  String nombre
  String tipo
  String severidad
}

class DeteccionPlaga {
  UUID id
  LocalDate fechaDeteccion
  String estado
  BigDecimal latitud
  BigDecimal longitud
}

class AplicacionFitosanitaria {
  UUID id
  LocalDate fechaAplicacion
  String producto
  String responsable
}

class SeguimientoPlaga {
  UUID id
  LocalDate fechaSeguimiento
  String estado
  String observaciones
}

class DatoClima {
  UUID id
  LocalDate fecha
  BigDecimal temperatura
  BigDecimal humedad
  BigDecimal precipitacion
}

class Pronostico {
  UUID id
  LocalDate fecha
  BigDecimal tempMin
  BigDecimal tempMax
  BigDecimal probabilidadLluvia
}

class AlertaClima {
  UUID id
  String tipo
  String severidad
  LocalDateTime fecha
}

class PrecipitacionDiaria {
  UUID id
  LocalDate fecha
  BigDecimal milimetros
}

Lote "1" --> "*" EventoSiembra : lote_id
Lote "1" --> "*" RegistroCosecha : lote_id
Lote "1" --> "*" PropiedadSuelo : lote_id
Lote "1" --> "*" HistoricoCultivo : lote_id
Lote "1" --> "*" DeteccionPlaga : lote_id
CatalogoPlaga "1" --> "*" DeteccionPlaga : catalogo_plaga_id
DeteccionPlaga "1" --> "*" AplicacionFitosanitaria : deteccion_plaga_id
Lote "1" --> "*" AplicacionFitosanitaria : lote_id
DeteccionPlaga "1" --> "*" SeguimientoPlaga : deteccion_plaga_id
Lote "1" --> "*" DatoClima : lote_id
Lote "1" --> "*" Pronostico : lote_id
Lote "1" --> "*" AlertaClima : lote_id
Lote "1" --> "*" PrecipitacionDiaria : lote_id
```

## Ganaderia

```mermaid
classDiagram
direction LR

class Animal {
  UUID id
  String caravana
  String raza
  String sexo
  LocalDate fechaNacimiento
  BigDecimal pesoActualKg
  String rfidCodigo
  String estado
  String ubicacionActual
}

class Potrero {
  UUID id
  String nombre
  BigDecimal superficieHa
  Integer capacidadAnimales
  String estado
  String geoJson
}

class MovimientoAnimal {
  UUID id
  LocalDateTime fechaMovimiento
  String origen
  String destino
  String responsable
}

class HistorialMedicoAnimal {
  UUID id
  LocalDate fecha
  String tipo
  String diagnostico
  String veterinario
}

class VacunaCatalogo {
  UUID id
  String nombre
  String tipo
  Integer frecuenciaDias
}

class AplicacionVacuna {
  UUID id
  LocalDate fechaAplicacion
  BigDecimal dosis
  String responsable
}

class DiagnosticoSanitario {
  UUID id
  LocalDate fecha
  String severidad
  String estado
}

class TratamientoMedicamento {
  UUID id
  LocalDate fechaInicio
  LocalDate fechaFin
  String medicamento
  String responsable
}

class PesajeAnimal {
  UUID id
  LocalDate fecha
  BigDecimal pesoKg
  String metodo
}

class DietaNutricional {
  UUID id
  String nombre
  String estado
}

class DietaIngrediente {
  UUID id
  String alimento
  BigDecimal cantidad
}

class RegistroAlimentacion {
  UUID id
  LocalDate fecha
  String potrero
  BigDecimal cantidadKg
}

class Monta {
  UUID id
  LocalDate fecha
  String resultado
}

class Inseminacion {
  UUID id
  LocalDate fecha
  String tecnico
  String semen
}

class ControlPrenez {
  UUID id
  LocalDate fecha
  String resultado
  String veterinario
}

class Parto {
  UUID id
  LocalDate fecha
  String estado
  String riesgo
}

class IndiceGenetico {
  UUID id
  String tipo
  BigDecimal valor
}

Animal "0..1" --> "0..*" Animal : madre_id
Animal "0..1" --> "0..*" Animal : padre_id
Animal "1" --> "*" MovimientoAnimal : animal_id
Animal "1" --> "*" HistorialMedicoAnimal : animal_id
Animal "1" --> "*" AplicacionVacuna : animal_id
VacunaCatalogo "1" --> "*" AplicacionVacuna : vacuna_id
Animal "1" --> "*" DiagnosticoSanitario : animal_id
Animal "1" --> "*" TratamientoMedicamento : animal_id
Animal "1" --> "*" PesajeAnimal : animal_id
Animal "1" --> "*" RegistroAlimentacion : animal_id
DietaNutricional "1" --> "*" RegistroAlimentacion : dieta_id
DietaNutricional "1" --> "*" DietaIngrediente : dieta_id
Animal "1" --> "*" Monta : vaca_id
Animal "1" --> "*" Monta : toro_id
Animal "1" --> "*" Inseminacion : vaca_id
Animal "1" --> "*" ControlPrenez : vaca_id
Animal "1" --> "*" Parto : madre_id
Animal "0..1" --> "*" Parto : ternero_id
Animal "1" --> "*" IndiceGenetico : animal_id
Animal ..> Potrero : ubicacionActual texto pendiente de FK
MovimientoAnimal ..> Potrero : origen/destino texto pendiente de FK
RegistroAlimentacion ..> Potrero : potrero texto pendiente de FK
```

## Maquinaria

```mermaid
classDiagram
direction LR

class Maquinaria {
  UUID id
  String codigo
  String tipo
  String marca
  String modelo
  String estado
  String ubicacionActual
}

class AsignacionMaquinaria {
  UUID id
  LocalDate fechaInicio
  LocalDate fechaFin
  String responsable
}

class DocumentoMaquinaria {
  UUID id
  String tipo
  String numero
  LocalDate vencimiento
}

class HistorialEstadoMaquinaria {
  UUID id
  String estadoAnterior
  String estadoNuevo
  LocalDateTime fechaCambio
}

class UsoMaquinaria {
  UUID id
  LocalDate fecha
  BigDecimal horasUso
  String responsable
}

class PlanMantenimiento {
  UUID id
  String nombre
  String frecuencia
}

class MantenimientoProgramado {
  UUID id
  LocalDate fechaProgramada
  String estado
}

class IntervencionMantenimiento {
  UUID id
  LocalDate fecha
  String tipo
  BigDecimal costo
}

class RepuestoUtilizado {
  UUID id
  String repuesto
  Integer cantidad
  BigDecimal costo
}

Maquinaria "1" --> "*" AsignacionMaquinaria : maquinaria_id
Maquinaria "1" --> "*" DocumentoMaquinaria : maquinaria_id
Maquinaria "1" --> "*" HistorialEstadoMaquinaria : maquinaria_id
Maquinaria "1" --> "*" UsoMaquinaria : maquinaria_id
Maquinaria "0..1" --> "*" PlanMantenimiento : maquinaria_id
Maquinaria "1" --> "*" MantenimientoProgramado : maquinaria_id
PlanMantenimiento "0..1" --> "*" MantenimientoProgramado : plan_id
Maquinaria "1" --> "*" IntervencionMantenimiento : maquinaria_id
PlanMantenimiento "0..1" --> "*" IntervencionMantenimiento : plan_id
MantenimientoProgramado "0..1" --> "*" IntervencionMantenimiento : mantenimiento_programado_id
IntervencionMantenimiento "1" --> "*" RepuestoUtilizado : intervencion_id
```

## Operarios y ordenes de trabajo

```mermaid
classDiagram
direction LR

class Operario {
  UUID id
  String nombre
  String apellido
  String telefono
  String rolOperativo
  String estado
}

class OperarioDocumento {
  UUID id
  String tipo
  String numero
  LocalDate vencimiento
}

class OperarioHistorialRol {
  UUID id
  String rolAnterior
  String rolNuevo
  LocalDateTime fechaCambio
}

class OrdenTrabajo {
  UUID id
  String titulo
  String tipo
  String estado
  LocalDateTime fechaInicio
  LocalDateTime fechaFin
}

class OrdenTrabajoActividad {
  UUID id
  String descripcion
  String estado
  LocalDateTime fecha
}

class OrdenTrabajoHistorial {
  UUID id
  String estadoAnterior
  String estadoNuevo
  LocalDateTime fechaCambio
}

class User {
  UUID id
  String username
}

class Lote {
  UUID id
  String nombre
}

User "0..1" --> "0..1" Operario : user_id
Operario "1" --> "*" OperarioDocumento : operario_id
Operario "1" --> "*" OperarioHistorialRol : operario_id
Operario "1" --> "*" OrdenTrabajo : operario_id
Lote "0..1" --> "*" OrdenTrabajo : lote_id
OrdenTrabajo "1" --> "*" OrdenTrabajoActividad : orden_trabajo_id
Operario "0..1" --> "*" OrdenTrabajoActividad : operario_id
OrdenTrabajo "1" --> "*" OrdenTrabajoHistorial : orden_trabajo_id
```

## Integridad referencial implementada por feature 43

La feature 43 corrige el vinculo operativo entre animales y potreros para que la ubicacion actual salga de una relacion por ID y no de un nombre textual.

```mermaid
classDiagram
direction LR

class Animal {
  UUID id
  String caravana
}

class Potrero {
  UUID id
  String nombre
}

class AnimalPotrero {
  UUID id
  UUID animal_id
  UUID potrero_id
  LocalDateTime fechaDesde
  LocalDateTime fechaHasta
  Boolean activo
}

class MovimientoAnimal {
  UUID id
  UUID animal_id
  UUID potrero_origen_id
  UUID potrero_destino_id
  LocalDateTime fechaMovimiento
}

Animal "1" --> "*" AnimalPotrero : animal_id
Potrero "1" --> "*" AnimalPotrero : potrero_id
Animal "1" --> "*" MovimientoAnimal : animal_id
Potrero "0..1" --> "*" MovimientoAnimal : potrero_origen_id
Potrero "1" --> "*" MovimientoAnimal : potrero_destino_id
```

Reglas implementadas por feature 43:

- Toda relacion entre entidades debe resolverse por FK/ID, no por nombre textual.
- Un animal debe estar asignado a un potrero mediante una tabla relacional como `animal_potrero`.
- Un movimiento de animal debe cerrar la asignacion activa anterior y crear una nueva asignacion activa en destino.
- Los reportes y dashboards deben agrupar por `potrero_id` y luego mostrar `potrero.nombre`.
- El mismo criterio queda como regla transversal para responsables, veterinarios, operarios, maquinaria, lotes, potreros e insumos.
