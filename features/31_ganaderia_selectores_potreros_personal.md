# 31 - Ganaderia: Selectores, Potreros y Formularios Asistidos

## Descripcion
Refactor de la experiencia de alta y operacion sobre trazabilidad animal para reemplazar inputs manuales por selectores buscables, introducir la gestion formal de potreros y reutilizar un componente generico de seleccion remota.

## Objetivo
Mejorar la consistencia operativa en ganaderia, reducir errores de carga y dejar una base reutilizable para todos los formularios que dependan de busqueda y seleccion contra API.

## Tareas
1. **Componente Generico de Select/Buscador**: construir un componente reutilizable donde se configure:
   - URL del endpoint GET
   - campos de busqueda
   - campo identificador
   - campo de label principal
   - mapping de campos secundarios
2. **Eliminar Campo QR**: remover el campo QR del alta/edicion de animal mientras no exista un flujo real de generacion/lectura que lo justifique.
3. **Ubicacion por Potrero**: reemplazar el input libre de ubicacion por seleccion de potreros. Utilizar lo definido en 1
4. **Gestion de Potreros**: si todavia no existe un modulo ganadero de potreros, implementarlo con una logica equivalente a la gestion de lotes, incluyendo alta, edicion, consulta y referencia geografica/operativa minima.
5. **Raza como Select**: convertir raza en un selector de razas bovinas soportadas por catalogo. Utilizar lo definido en 1
6. **Movimiento con Origen/Destino Asistido**: cambiar origen y destino de movimientos para que seleccionen potreros existentes. Utilizar lo definido en 1
7. **Responsable Buscable**: convertir responsable del movimiento en selector buscable de personal autorizado. Utilizar lo definido en 1
8. **Veterinario Seleccionable**: convertir el registro medico para que el veterinario se elija desde un selector de profesionales habilitados. Utilizar lo definido en 1
9. **Refactor Madre/Padre**: reemplazar el esquema actual por selectores buscables sobre animales existentes, optimizados para volumen alto de registros.
10. **Integracion de Formularios**: aplicar el componente generico al alta/edicion de animal, registro de movimientos y registro medico.

## Servicios
- `AnimalService`: alta y actualizacion de animales con referencias normalizadas.
- `PotreroService`: CRUD y consulta de potreros ganaderos.
- `PersonalService`: consulta de personal autorizado para operaciones.
- `VeterinarioService`: consulta de veterinarios habilitados.
- `CatalogoGanaderoService`: catalogos de razas y entidades de apoyo.

## Repositorios
- `AnimalRepository`
- `PotreroRepository`
- `PersonalRepository`
- `VeterinarioRepository`

## Requisitos Tecnicos
- Soporte de busqueda remota con debounce.
- Soporte de paginacion o limite para datasets grandes.
- Componente generico reusable en Angular y reutilizable en mobile si corresponde.
- Contratos backend preparados para lookup liviano (`id`, `label`, `subtitle`, `metadata`).
- Validacion de integridad referencial para madre, padre, potrero, responsable y veterinario.
- Formularios sin inputs libres donde la relacion deba normalizarse.

## Dependencias
- 04_ganaderia_trazabilidad_animal
- 12_operarios_gestion_administracion
- 20_geo_mapas_lotes

## Resultado Esperado
- Alta de animal mas robusta y asistida.
- Movimientos y registros medicos con referencias consistentes.
- Base reutilizable para futuros selectores remotos en toda la plataforma.
