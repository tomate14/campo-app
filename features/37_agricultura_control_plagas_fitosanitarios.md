# 37 - Agricultura: Control operativo de plagas y aplicaciones fitosanitarias

## Resumen
Implementar el modulo operativo de control de plagas en Agricultura para que Campo App soporte deteccion, seguimiento, decision de tratamiento y registro trazable de aplicaciones fitosanitarias por lote. Esta feature complementa la `25_agricultura_control_plagas_enfermedades.md`, dejando IA, captura avanzada de fotos y offline profundo para fases posteriores si corresponde.

## Objetivo funcional
Permitir que un usuario pueda:
- Registrar una deteccion de plaga o enfermedad sobre un lote.
- Clasificar severidad, cultivo afectado, superficie/porcentaje afectado y estado del caso.
- Consultar catalogo de plagas, enfermedades y malezas relevantes.
- Registrar recomendaciones y aplicaciones fitosanitarias asociadas.
- Controlar dosis, producto, principio activo, carencia, reingreso y responsable.
- Visualizar historial por lote y estado de controles.
- Generar alertas operativas por casos abiertos, reincidencia o vencimientos de seguimiento.

## Alcance MVP
- Backend completo para catalogos, detecciones, seguimientos y aplicaciones.
- Frontend Angular web con pantalla premium en Agricultura.
- Integracion con Lotes existentes.
- Integracion basica con Inventario de insumos agricolas si existe stock disponible.
- Sin IA de imagen, sin mobile offline avanzado y sin proveedores externos en esta etapa.

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

### Servicios
- `CatalogoPlagaService`
- `DeteccionPlagaService`
- `AplicacionFitosanitariaService`
- `SeguimientoPlagaService`
- `PlagasDashboardService`

### Endpoints sugeridos
- `GET /api/v1/agricola/plagas/catalogo`
- `POST /api/v1/agricola/plagas/catalogo`
- `GET /api/v1/agricola/plagas/detecciones?loteId=&estado=&severidad=&cultivo=`
- `POST /api/v1/agricola/plagas/detecciones`
- `GET /api/v1/agricola/plagas/detecciones/{id}`
- `PATCH /api/v1/agricola/plagas/detecciones/{id}/estado`
- `POST /api/v1/agricola/plagas/detecciones/{id}/seguimientos`
- `POST /api/v1/agricola/plagas/detecciones/{id}/aplicaciones`
- `GET /api/v1/agricola/plagas/dashboard`
- `GET /api/v1/agricola/plagas/lotes/{loteId}/historial`

### Validaciones
- No permitir detecciones sin lote existente.
- No permitir aplicaciones sin producto, dosis, fecha y responsable.
- Si hay periodo de carencia, calcular fecha segura de cosecha.
- Si hay periodo de reingreso, exponer fecha/hora de reingreso seguro.
- Validar severidad y estado por enums.
- Auditar usuario y fecha de cambios.

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

## Integraciones futuras fuera de alcance
- Captura mobile con foto y GPS offline.
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

## Dependencias
- Feature 01: Gestion de lotes.
- Feature 15: Inventario de insumos agricolas, si se descuenta stock.
- Feature 20: Mapas de lotes, si se renderizan coordenadas.
- Feature 25: Alcance avanzado de plagas/enfermedades, IA y mobile.

## Criterios de aceptacion
- El usuario puede registrar una deteccion de plaga sobre un lote.
- El usuario puede registrar una aplicacion fitosanitaria asociada.
- El usuario puede registrar seguimientos hasta cerrar/controlar el caso.
- La pantalla muestra metricas, cards por tab y paginacion con el estilo premium definido.
- No se usan iconos con letras o siglas.
- La API devuelve datos trazables para auditoria operativa.
