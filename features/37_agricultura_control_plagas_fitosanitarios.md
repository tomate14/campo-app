# 37 - Agricultura: Control operativo de plagas y aplicaciones fitosanitarias

## Estado
Finalizada.

## Nota de alcance posterior
El reemplazo del campo `responsable` por select buscador en `Registrar evento` queda derivado a la feature `31_ganaderia_selectores_potreros_personal.md`, porque depende del componente generico de select remoto y del lookup de personal autorizado.

## Resumen
Implementar el modulo operativo de control de plagas en Agricultura para que Campo App soporte deteccion, seguimiento, decision de tratamiento y registro trazable de aplicaciones fitosanitarias por lote. Esta feature complementa la `25_agricultura_control_plagas_enfermedades.md`, dejando IA, captura avanzada de fotos y offline profundo para fases posteriores si corresponde.

## Objetivo funcional
Permitir que un usuario pueda:
- Registrar una deteccion de plaga o enfermedad sobre un lote.
- Registrar una deteccion desde mobile con foto opcional y geolocalizacion automatica del dispositivo.
- Registrar una deteccion desde web seleccionando manualmente un punto sobre el mapa del lote.
- Clasificar severidad, cultivo afectado, superficie/porcentaje afectado y estado del caso.
- Consultar catalogo de plagas, enfermedades y malezas relevantes.
- Registrar recomendaciones y aplicaciones fitosanitarias asociadas.
- Controlar dosis, producto, principio activo, carencia, reingreso y responsable.
- Visualizar historial por lote, pins georreferenciados y estado de controles.
- Generar alertas operativas por casos abiertos, reincidencia o vencimientos de seguimiento.

## Alcance MVP
- Backend completo para catalogos, detecciones, seguimientos y aplicaciones.
- Frontend Angular web con pantalla premium en Agricultura.
- Flujo mobile para captura de foto opcional y coordenadas del dispositivo.
- Integracion con Lotes existentes.
- Mapa interactivo por lote con pins de alertas/detecciones.
- Integracion basica con Inventario de insumos agricolas si existe stock disponible.
- Sin IA de imagen, sin mobile offline avanzado y sin proveedores externos en esta etapa.

## Flujo operativo esperado

### Mobile
1. El operario presiona `Registrar evento`.
2. Se abre la camara del telefono para tomar una imagen de la plaga/enfermedad. La foto es opcional: el usuario puede omitirla.
3. Al capturar la imagen o confirmar el ingreso sin imagen, la app solicita/toma geolocalizacion del dispositivo.
4. Con las coordenadas capturadas, el sistema determina automaticamente a que lote pertenece el punto usando los poligonos ya definidos en Lotes.
5. Se muestra el formulario de deteccion con:
   - latitud y longitud precargadas;
   - lote precargado por pertenencia geografica;
   - foto adjunta si fue tomada;
   - fecha/hora precargada;
   - campos tecnicos de plaga, severidad, area afectada, descripcion y responsable.
6. Al guardar, se crea la deteccion y se agrega un pin en el mapa del lote.

### Web
1. El usuario presiona `Registrar evento`.
2. Se abre el mapa interactivo del lote o selector de lote + mapa.
3. El usuario selecciona manualmente un punto sobre el mapa.
4. El sistema precarga latitud, longitud y lote seleccionado.
5. Se muestra el formulario de deteccion con los datos tecnicos.
6. Al guardar, se crea la deteccion y se agrega un pin en el mapa del lote.

### Mapa de lote
- Cada deteccion abierta o en tratamiento se renderiza como pin/alerta sobre el mapa del lote.
- El color del pin depende de la severidad:
  - `BAJA`: verde.
  - `MEDIA`: amarillo/naranja.
  - `ALTA`: naranja/rojo suave.
  - `CRITICA`: rojo suave con glow.
- Al hacer click sobre el pin, se muestra un tooltip con esquema de card premium:
  - plaga/enfermedad;
  - lote;
  - severidad;
  - estado;
  - fecha de deteccion;
  - responsable;
  - foto miniatura si existe;
  - botones `Ver detalle`, `Registrar aplicacion`, `Seguimiento`.

## Backend

### Modelo de datos sugerido
- `catalogo_plagas`
  - `id`
  - `nombre_comun`
  - `nombre_cientifico`
  - `tipo`: `PLAGA`, `ENFERMEDAD`, `MALEZA`
  - `cultivos_afectados`
  - `descripcion`
  - `sintomas`
  - `umbral_accion`
  - `activo`
- `detecciones_plaga`
  - `id`
  - `lote_id`
  - `catalogo_plaga_id`
  - `fecha_deteccion`
  - `cultivo`
  - `severidad`: `BAJA`, `MEDIA`, `ALTA`, `CRITICA`
  - `area_afectada_ha`
  - `porcentaje_afectado`
  - `estado`: `ABIERTA`, `EN_TRATAMIENTO`, `CONTROLADA`, `CERRADA`
  - `latitud`
  - `longitud`
  - `precision_metros`
  - `origen_geolocalizacion`: `MOBILE_GPS`, `WEB_MAPA`, `MANUAL`
  - `foto_url`
  - `foto_nombre`
  - `foto_content_type`
  - `foto_tamanio_bytes`
  - `descripcion`
  - `responsable`
  - `created_at`
  - `updated_at`
- `aplicaciones_fitosanitarias`
  - `id`
  - `deteccion_id`
  - `lote_id`
  - `fecha_aplicacion`
  - `producto`
  - `principio_activo`
  - `dosis`
  - `unidad_dosis`
  - `volumen_caldo_l_ha`
  - `superficie_tratada_ha`
  - `periodo_carencia_dias`
  - `periodo_reingreso_horas`
  - `maquinaria_id` opcional
  - `operario_responsable`
  - `condiciones_climaticas`
  - `observaciones`
- `seguimientos_plaga`
  - `id`
  - `deteccion_id`
  - `fecha`
  - `resultado`: `SIN_CAMBIOS`, `MEJORA`, `EMPEORA`, `CONTROLADA`
  - `severidad`
  - `observaciones`
  - `responsable`
- `adjuntos_plaga` opcional si se decide soportar mas de una foto por deteccion:
  - `id`
  - `deteccion_id`
  - `url`
  - `nombre`
  - `content_type`
  - `tamanio_bytes`
  - `created_at`

### Servicios
- `CatalogoPlagaService`
- `DeteccionPlagaService`
- `GeolocalizacionLoteService`: resolver lote por punto usando poligono de lote.
- `AdjuntoPlagaService`: guardar foto opcional y metadata.
- `AplicacionFitosanitariaService`
- `SeguimientoPlagaService`
- `PlagasDashboardService`

### Endpoints sugeridos
- `GET /api/v1/agricola/plagas/catalogo`
- `POST /api/v1/agricola/plagas/catalogo`
- `GET /api/v1/agricola/plagas/detecciones?loteId=&estado=&severidad=&cultivo=`
- `POST /api/v1/agricola/plagas/detecciones`
- `POST /api/v1/agricola/plagas/detecciones/con-foto` - multipart con foto opcional + payload de deteccion.
- `GET /api/v1/agricola/plagas/detecciones/{id}`
- `PATCH /api/v1/agricola/plagas/detecciones/{id}/estado`
- `POST /api/v1/agricola/plagas/detecciones/{id}/seguimientos`
- `POST /api/v1/agricola/plagas/detecciones/{id}/aplicaciones`
- `GET /api/v1/agricola/plagas/dashboard`
- `GET /api/v1/agricola/plagas/lotes/{loteId}/historial`
- `GET /api/v1/agricola/plagas/lotes/{loteId}/mapa` - devuelve detecciones georreferenciadas para pins.
- `POST /api/v1/agricola/plagas/geolocalizacion/resolver-lote` - recibe lat/lon y devuelve lote contenedor si existe.

### Validaciones
- No permitir detecciones sin lote existente.
- Si el evento llega desde mobile con coordenadas, resolver lote por poligono. Si no hay lote contenedor, permitir seleccionar lote manualmente pero marcar `origen_geolocalizacion` como `MANUAL`.
- Validar que latitud/longitud sean numeros finitos y esten dentro de rangos validos.
- Validar archivo opcional: tipos permitidos `image/jpeg`, `image/png`, `image/webp`; tamano maximo configurable.
- No permitir aplicaciones sin producto, dosis, fecha y responsable.
- Si hay periodo de carencia, calcular fecha segura de cosecha.
- Si hay periodo de reingreso, exponer fecha/hora de reingreso seguro.
- Validar severidad y estado por enums.
- Auditar usuario y fecha de cambios.

### Reglas de geolocalizacion
- Mobile debe usar coordenadas del dispositivo cuando el usuario toma la foto o confirma el evento.
- Web no debe intentar asumir GPS del navegador como flujo principal; el usuario debe seleccionar el punto en el mapa.
- Si el punto esta dentro de un poligono de lote, el lote se precarga automaticamente.
- Si el punto cae fuera de todos los lotes, el formulario debe pedir seleccion manual de lote y mostrar advertencia operativa.
- El backend debe guardar siempre latitud/longitud cuando exista deteccion georreferenciada para poder reconstruir el mapa.

## Frontend Angular

### Ruta sugerida
- `/agricola/plagas`

### UI esperada
Aplicar el estilo premium dark SaaS vigente:
- Header con eyebrow `Campo App · Agricultura`.
- Metric cards alineadas igual que Alimentacion: icono, titulo/subtitulo y valor.
- Tabs con cards operativas premium y paginacion enterprise.
- Maximo 3 cards por pagina en listados operativos.
- Iconos SVG reales, nunca letras o siglas.
- Mapa interactivo del lote con pins de detecciones/alertas.
- Tooltip de pin con card premium compacta y acciones operativas.

### Secciones
- Dashboard superior:
  - Casos abiertos
  - En tratamiento
  - Controlados
  - Alertas criticas
- Filtros compactos:
  - Lote
  - Cultivo
  - Tipo
  - Severidad
  - Estado
- Mapa:
  - Selector de lote.
  - Vista del poligono del lote.
  - Pins de detecciones.
  - Toggle para ver `Abiertas`, `En tratamiento`, `Controladas` y `Todas`.
  - Click en mapa para crear deteccion web.
- Tabs:
  - Detecciones
  - Aplicaciones
  - Seguimientos
  - Catalogo
- Cards de deteccion:
  - Plaga/enfermedad
  - Lote
  - Severidad
  - Area afectada
  - Estado
  - Fecha deteccion
  - Responsable
  - Indicador de foto adjunta si existe
  - Botones: `Registrar aplicacion`, `Seguimiento`, `Ver completo`
- Cards de aplicacion:
  - Producto
  - Principio activo
  - Dosis
  - Superficie tratada
  - Carencia
  - Reingreso
  - Responsable
- Formularios:
  - Nueva deteccion
  - Registrar aplicacion fitosanitaria
  - Registrar seguimiento
  - Nuevo item de catalogo

### Formulario de nueva deteccion
- Campos precargados:
  - `loteId`
  - `latitud`
  - `longitud`
  - `fechaDeteccion`
  - `foto` si se capturo desde mobile
- Campos editables:
  - plaga/enfermedad/maleza desde catalogo;
  - tipo;
  - cultivo;
  - severidad;
  - area afectada ha;
  - porcentaje afectado;
  - descripcion/sintomas;
  - responsable.
- Mobile:
  - boton `Registrar evento`;
  - abre camara;
  - permite `Omitir foto`;
  - toma coordenadas del dispositivo;
  - resuelve lote automaticamente.
- Web:
  - boton `Registrar evento`;
  - abre mapa;
  - usuario selecciona punto;
  - resuelve/precarga lote segun punto seleccionado.

## Integraciones futuras fuera de alcance
- Offline avanzado de captura mobile con cola local de fotos.
- Identificacion por IA.
- Sincronizacion offline-first completa.
- Integracion con bases regulatorias externas.
- Alertas regionales por vecinos o zona.

## Test plan
- Backend:
  - `mvn -DskipTests compile`
  - Tests unitarios de servicios para detecciones, aplicaciones y dashboard.
  - Validar lote inexistente.
  - Validar estados y severidades invalidas.
  - Validar calculo de reingreso y carencia.
- Frontend:
  - `npm.cmd run type-check`
  - `npm.cmd run build`
  - Verificar estados vacios.
  - Verificar carga de lotes y catalogo.
  - Verificar paginacion de tabs y cards.
  - Verificar seleccion de punto en mapa web.
  - Verificar render de pins por severidad.
  - Verificar tooltip/card al hacer click en un pin.
- Mobile:
  - Verificar apertura de camara.
  - Verificar flujo con foto.
  - Verificar flujo sin foto.
  - Verificar captura de coordenadas.
  - Verificar precarga de lote por coordenadas.

## Dependencias
- Feature 01: Gestion de lotes.
- Feature 15: Inventario de insumos agricolas, si se descuenta stock.
- Feature 20: Mapas de lotes, si se renderizan coordenadas.
- Feature 25: Alcance avanzado de plagas/enfermedades, IA y mobile.

## Criterios de aceptacion
- El usuario puede registrar una deteccion de plaga sobre un lote.
- En mobile, el usuario puede registrar deteccion con foto opcional y coordenadas del dispositivo.
- En web, el usuario puede registrar deteccion seleccionando un punto en el mapa.
- El sistema precarga lote cuando el punto pertenece a un poligono de lote existente.
- La deteccion se renderiza como pin en el mapa del lote.
- El pin muestra tooltip/card con detalle y acciones.
- El usuario puede registrar una aplicacion fitosanitaria asociada.
- El usuario puede registrar seguimientos hasta cerrar/controlar el caso.
- La pantalla muestra metricas, cards por tab y paginacion con el estilo premium definido.
- No se usan iconos con letras o siglas.
- La API devuelve datos trazables para auditoria operativa.
