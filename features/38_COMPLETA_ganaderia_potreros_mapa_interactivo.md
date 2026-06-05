# 38 - Ganaderia: Potreros con Mapa Interactivo

## Descripcion
Implementar una pantalla de gestion de potreros para ganaderia, similar a la gestion de lotes de agricultura, pero orientada a mapear multiples potreros dentro de un mismo mapa interactivo.

El objetivo es que el usuario pueda definir, visualizar y administrar todos los potreros del establecimiento sobre un mapa, dibujando poligonos de forma operativa y guardando informacion tecnica asociada a cada potrero.

## Objetivo Funcional
- Crear una nueva pantalla web Angular para potreros.
- Permitir dibujar multiples potreros sobre un mismo mapa interactivo.
- Finalizar el dibujo de un potrero con doble click sobre un punto/vertice.
- Permitir iniciar un nuevo potrero con un nuevo click en otra zona del mapa luego de finalizar el anterior.
- Mostrar un popup/modal al finalizar cada potrero para cargar la informacion del potrero.
- Persistir los potreros con su poligono GeoJSON y datos operativos.
- Mostrar todos los potreros ya definidos en el mapa, con colores y tooltips premium.

## Alcance Backend

### Entidad Potrero
Crear entidad persistente `Potrero` bajo dominio ganaderia.

Campos sugeridos:
- `id`
- `nombre`
- `descripcion`
- `superficieHa`
- `tipoUso` (PASTOREO, RESERVA, RECRIA, MATERNIDAD, ENCIERRE, OTRO)
- `estado` (ACTIVO, INACTIVO, DESCANSO, MANTENIMIENTO)
- `capacidadAnimales`
- `cargaAnimalActual`
- `tipoPasto` / `recursoForrajero`
- `disponibilidadAgua` (boolean)
- `tieneSombra` (boolean)
- `observaciones`
- `poligono` GeoJSON Polygon
- `centroideLatitud`
- `centroideLongitud`
- `createdAt`
- `updatedAt`
- `deletedAt`

### Endpoints
Crear endpoints REST bajo:

`/api/v1/ganaderia/potreros`

Endpoints requeridos:
- `GET /api/v1/ganaderia/potreros`: lista potreros activos y permite filtros basicos.
- `GET /api/v1/ganaderia/potreros/{id}`: detalle de un potrero.
- `POST /api/v1/ganaderia/potreros`: crear potrero con datos y poligono.
- `PUT /api/v1/ganaderia/potreros/{id}`: actualizar datos y/o poligono.
- `DELETE /api/v1/ganaderia/potreros/{id}`: baja logica.
- `GET /api/v1/ganaderia/potreros/mapa`: retorna todos los potreros activos optimizados para render de mapa.

### Validaciones
- Nombre obligatorio.
- Poligono obligatorio para alta desde mapa.
- El poligono debe tener al menos 3 puntos reales y estar cerrado.
- Superficie mayor o igual a 0.
- No aceptar coordenadas NaN o infinitas.
- Validar GeoJSON con estructura `Polygon`.

### Integraciones internas
- Exponer potreros para ser usados por el selector generico de feature 31.
- La ubicacion del animal debe poder referenciar un potrero cuando la feature 31 se implemente.
- Movimiento de ganaderia debe poder usar potreros como origen/destino cuando corresponda.

## Alcance Frontend Web Angular

### Ruta
Agregar pantalla:

`/ganaderia/potreros`

### Navegacion
Agregar opcion en sidebar dentro de Ganaderia:

`Potreros`

### Layout visual
Debe seguir el estilo premium dark SaaS ya definido:
- Fondo #081225 / #0B1730.
- Glassmorphism suave.
- Bordes 20-24px.
- Glow verde sutil.
- Cards y paneles consistentes con Sanidad, Trazabilidad, Alimentacion e Inventario.
- Iconos reales SVG, no letras ni siglas.

### Pantalla principal
La pantalla debe incluir:
- Header premium con titulo `Potreros`.
- Subtitulo: `Mapeo y gestion operativa de potreros ganaderos.`
- Acciones:
  - `Nuevo mapeo`
  - `Guardar cambios`
  - `Cancelar dibujo`
- KPIs compactos:
  - Potreros activos
  - Hectareas mapeadas
  - Capacidad total
  - Potreros en descanso
- Panel de mapa principal ocupando la mayor parte de la pantalla.
- Panel lateral o inferior con lista resumida de potreros existentes.

### Mapa interactivo
Usar la libreria de mapa vigente del frontend Angular.

Comportamiento requerido:
- Un click agrega un vertice al potrero en edicion.
- La linea del poligono debe ir mostrando el dibujo en progreso.
- Doble click sobre un punto/vertice finaliza el potrero en edicion.
- Al finalizar, cerrar automaticamente el poligono.
- Mostrar popup/modal para cargar los datos del potrero.
- Al guardar el popup, persistir el potrero y renderizarlo en el mapa.
- Despues de guardar o cancelar, un nuevo click en otra zona debe iniciar un nuevo potrero.
- Permitir visualizar todos los potreros ya cargados en el mismo mapa.
- Cada potrero debe tener color propio o color segun estado.
- Hover sobre potrero: tooltip premium con nombre, superficie, estado, capacidad y uso.
- Click sobre potrero existente: abrir detalle o acciones contextuales.

### Popup de alta al finalizar dibujo
Debe abrirse al hacer doble click para finalizar el poligono.

Campos iniciales:
- Nombre
- Superficie estimada ha (precalculada si se implementa calculo geodesico; editable)
- Tipo de uso
- Estado
- Capacidad animales
- Recurso forrajero / tipo de pasto
- Disponibilidad de agua
- Sombra disponible
- Observaciones

Botones:
- `Guardar potrero`
- `Descartar`

Reglas UX:
- El popup debe tener cruz chica arriba a la derecha.
- Escape debe cerrar popup si no hay cambios pendientes o pedir confirmacion si hay datos cargados.
- No usar popups nativos del navegador.

### Lista de potreros
La pantalla debe mostrar una lista o grid compacto con:
- Nombre
- Superficie
- Estado
- Uso
- Capacidad
- Acciones: ver, editar, eliminar

Las cards/lista deben seguir el estilo premium definido para Campo App.

## Alcance Mobile Futuro
Esta feature se enfoca en web Angular. Mobile puede quedar diferido salvo que se decida ampliar alcance.

Pendientes potenciales para feature futura:
- Mapeo de potreros desde mobile con GPS.
- Captura offline de potreros.
- Sincronizacion offline-first.
- Alertas por carga animal y rotacion.

## Dependencias
- Feature 04: trazabilidad animal.
- Feature 07: alimentacion y monitoreo ganadero.
- Feature 31: selectores genericos con buscador para potreros/personal.
- Modulo actual de mapas/lotes como referencia tecnica.

## Criterios de Aceptacion
- Se puede acceder a `/ganaderia/potreros` desde el sidebar.
- El mapa carga todos los potreros activos.
- El usuario puede dibujar un potrero con clicks sucesivos.
- El doble click finaliza el poligono y abre el popup de datos.
- Al guardar el popup, el potrero queda persistido y visible en el mapa.
- Luego de guardar, se puede iniciar otro potrero con un nuevo click.
- No se guardan poligonos invalidos ni coordenadas NaN.
- Los tooltips y popups respetan el estilo premium de Campo App.
- Backend compila y expone endpoints documentados.
- Frontend pasa type-check y build.

## Test Plan

### Backend
- `mvn -DskipTests compile`
- Tests unitarios para creacion, actualizacion, baja logica y validacion de GeoJSON.
- Validar error al crear potrero sin poligono o con menos de 3 puntos.
- Validar listado de mapa con potreros activos.

### Frontend
- `npm.cmd run type-check`
- `npm.cmd run build`
- Probar dibujo de multiples potreros en un mismo mapa.
- Probar doble click para finalizar potrero.
- Probar popup de alta y persistencia.
- Probar tooltips sobre potreros existentes.

## Estado
Realizada.

