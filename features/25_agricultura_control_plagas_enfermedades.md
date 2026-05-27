# 25 - Agricultura: Control avanzado de plagas, IA, offline y reportes

## Estado
Pendiente.

## Contexto
La feature `37_agricultura_control_plagas_fitosanitarios.md` ya implementa el core operativo del modulo de plagas: catalogo, detecciones, seguimientos, aplicaciones fitosanitarias, mapa web con pins, resolucion de lote por poligono y dashboard basico.

Esta feature 25 queda reformulada para implementar la capa avanzada que todavia falta: captura mobile real con camara/GPS, storage de imagenes, offline-first, identificacion asistida por IA, recomendaciones tecnicas, alertas por zona, integracion real con inventario/regulacion y reportes avanzados.

## Objetivo funcional
Permitir que Campo App pase de un registro operativo de plagas a un sistema avanzado de deteccion, diagnostico, decision tecnica, trazabilidad regulatoria y analisis territorial.

El usuario debe poder:
- Capturar una foto real desde mobile con coordenadas completas del dispositivo.
- Trabajar offline en campo y sincronizar automaticamente cuando vuelva la conexion.
- Obtener sugerencias de identificacion de plaga/enfermedad/maleza por imagen o sintomas.
- Consultar recomendaciones tecnicas de tratamiento por cultivo, plaga y severidad.
- Validar productos autorizados y stock disponible antes de registrar aplicaciones.
- Analizar presion de plagas por lote, sector, temporada y evolucion temporal.
- Recibir alertas por zona, reincidencia y condiciones climaticas favorables.

## Alcance

### 1. Captura real de camara mobile
- Integrar camara nativa en Expo/React Native para `Registrar evento`.
- Permitir `Tomar foto`, `Repetir foto` y `Omitir foto`.
- Capturar metadata de imagen:
  - timestamp;
  - latitud;
  - longitud;
  - altitud si el dispositivo la informa;
  - precision GPS;
  - origen `MOBILE_GPS`.
- Precargar lote por pertenencia geografica usando el endpoint de resolucion por poligono de la feature 37.
- Si el punto no pertenece a ningun lote, mostrar advertencia y permitir seleccion manual.

### 2. Procesamiento y almacenamiento de imagenes
- Comprimir imagen en mobile antes de subirla.
- Limite objetivo: maximo 2 MB por imagen.
- Validar formatos permitidos: `image/jpeg`, `image/png`, `image/webp`.
- Crear servicio backend de adjuntos para plagas:
  - guardar archivo en storage configurado;
  - persistir metadata;
  - asociar archivo a deteccion.
- Soportar estrategia configurable:
  - filesystem local para desarrollo;
  - S3-compatible para produccion.
- Endpoint multipart real para detecciones con foto.

### 3. Offline-first mobile
- Guardar localmente detecciones pendientes cuando no haya conectividad.
- Persistir:
  - foto comprimida;
  - coordenadas;
  - formulario tecnico;
  - lote resuelto o seleccion manual;
  - timestamp de captura.
- Implementar cola de sincronizacion.
- Reintentar automaticamente cuando vuelva la conexion.
- Mostrar estado de cada registro:
  - `PENDIENTE_SYNC`;
  - `SINCRONIZANDO`;
  - `SINCRONIZADO`;
  - `ERROR_SYNC`.
- Permitir reintento manual.
- Descargar catalogo de plagas para uso offline.

### 4. Identificacion asistida por IA
- Crear servicio `IdentificacionPlagaService`.
- Implementar flujo inicial desacoplado del proveedor:
  - input: foto + cultivo + sintomas opcionales;
  - output: sugerencias ordenadas por confianza.
- Respuesta esperada:
  - plaga/enfermedad/maleza sugerida;
  - confianza;
  - explicacion corta;
  - sintomas coincidentes;
  - recomendacion de verificacion manual.
- Registrar feedback del usuario:
  - sugerencia aceptada;
  - sugerencia rechazada;
  - plaga corregida manualmente.
- Preparar integraciones futuras con proveedores como Google Vision, AWS Rekognition o modelo propio, pero mantener interfaz interna estable.

### 5. Busqueda por sintomas y catalogo avanzado
- Ampliar catalogo de plagas con caracteristicas visuales y sintomas estructurados.
- Permitir busqueda por:
  - cultivo;
  - tipo;
  - sintomas;
  - etapa fenologica;
  - region/zona;
  - severidad.
- Incluir imagenes o referencias visuales ligeras si existe storage disponible.

### 6. Recomendaciones tecnicas de tratamiento
- Crear modelo de recomendaciones por combinacion:
  - cultivo;
  - plaga/enfermedad/maleza;
  - severidad;
  - etapa fenologica;
  - condiciones climaticas;
  - umbral de accion.
- Devolver:
  - tratamiento sugerido;
  - principio activo;
  - dosis recomendada;
  - momento de aplicacion;
  - periodo de carencia;
  - periodo de reingreso;
  - restricciones y observaciones.
- Permitir que el usuario tome una recomendacion y cree una aplicacion fitosanitaria prellenada.

### 7. Integracion real con inventario de insumos
- Validar producto contra inventario de insumos agricolas cuando exista.
- Mostrar stock disponible antes de registrar aplicacion.
- Descontar stock al confirmar aplicacion, si el modulo de inventario agricola esta disponible.
- Si no hay stock suficiente, mostrar advertencia operativa y permitir bloquear o confirmar segun permisos.

### 8. Validacion regulatoria y productos autorizados
- Crear catalogo de productos fitosanitarios autorizados.
- Asociar producto con:
  - cultivos permitidos;
  - plagas objetivo;
  - principio activo;
  - dosis minima/maxima;
  - carencia;
  - reingreso;
  - restricciones.
- Validar aplicaciones contra ese catalogo.
- Registrar auditoria de excepciones si el usuario aplica fuera de recomendacion.

### 9. Alertas por zona y condiciones favorables
- Generar alertas por:
  - reincidencia en un lote;
  - multiples detecciones cercanas;
  - plagas frecuentes por region;
  - condiciones climaticas predisponentes;
  - vencimiento de seguimiento.
- Integrar con clima para evaluar riesgo por humedad, temperatura y precipitacion.
- Mostrar alertas en dashboard web y mobile.

### 10. Reportes avanzados
- Reportes por lote y temporada:
  - cantidad de eventos;
  - severidad promedio;
  - superficie afectada;
  - productos aplicados;
  - tiempo hasta control;
  - reincidencias.
- Mapa de presion de plagas:
  - heatmap o clusters por lote/sector;
  - evolucion temporal;
  - filtros por plaga/cultivo/severidad.
- Exportacion de reporte para auditoria tecnica.

### 11. Privacidad y auditoria avanzada
- Registrar auditoria completa para:
  - captura de foto;
  - coordenadas;
  - cambios de plaga identificada;
  - recomendaciones aceptadas/rechazadas;
  - aplicaciones fitosanitarias.
- Evitar exponer coordenadas sensibles a usuarios sin permiso.
- Definir permisos especificos para visualizar fotos y ubicaciones exactas.

## Backend

### Servicios nuevos o ampliados
- `AdjuntoPlagaService`
- `IdentificacionPlagaService`
- `RecomendacionTratamientoService`
- `PlagaOfflineSyncService`
- `ProductoFitosanitarioService`
- `AlertaPlagaZonaService`
- `ReportePlagaAvanzadoService`
- `AuditoriaPlagaService`

### Endpoints esperados
- `POST /api/v1/agricola/plagas/detecciones/con-foto` con almacenamiento real de archivo.
- `POST /api/v1/agricola/plagas/identificar` para sugerencias por IA/sintomas.
- `POST /api/v1/agricola/plagas/identificaciones/{id}/feedback`.
- `GET /api/v1/agricola/plagas/recomendaciones`.
- `POST /api/v1/agricola/plagas/recomendaciones/{id}/aplicar`.
- `GET /api/v1/agricola/plagas/productos-autorizados`.
- `GET /api/v1/agricola/plagas/alertas-zona`.
- `GET /api/v1/agricola/plagas/reportes/lotes/{loteId}`.
- `GET /api/v1/agricola/plagas/reportes/presion`.
- `POST /api/v1/agricola/plagas/offline/sync`.

## Frontend Web
- Ampliar `/agricola/plagas` sin romper lo implementado en feature 37.
- Agregar:
  - panel de recomendaciones;
  - visualizacion de fotos;
  - estado de identificacion IA;
  - reportes de presion/evolucion;
  - alertas por zona;
  - validacion de stock/productos autorizados.
- Mantener estilo premium dark SaaS vigente:
  - headers tipo Trazabilidad/Alimentacion;
  - metric cards icono/titulo/subtitulo/valor;
  - tabs y cards premium con paginacion;
  - iconos SVG reales, sin letras como iconos.

## Mobile
- Implementar flujo real de campo:
  - abrir camara;
  - capturar foto;
  - obtener GPS;
  - funcionar offline;
  - guardar en cola;
  - sincronizar luego.
- Mostrar feedback claro de sincronizacion.
- Permitir revisar registros pendientes.
- Usar catalogo offline descargado.

## Dependencias
- Feature 37: modulo operativo base de plagas y fitosanitarios.
- Feature 01: Gestion de lotes.
- Feature 02: Clima.
- Feature 15: Inventario de insumos agricolas.
- Feature 20: Mapas de lotes.
- Feature 23: Reportes agricola.
- Feature 24: Sincronizacion offline.
- Feature 31: Selector buscador generico para responsables/personal autorizado.

## Criterios de aceptacion
- Mobile permite tomar foto real y registrar coordenadas completas.
- Mobile permite registrar detecciones sin conexion y sincronizarlas luego.
- Las fotos se comprimen y se almacenan en backend/storage real.
- El catalogo puede consultarse offline.
- El sistema sugiere identificaciones con confianza y permite feedback.
- El sistema devuelve recomendaciones tecnicas accionables.
- Las aplicaciones fitosanitarias pueden validarse contra producto autorizado y stock disponible.
- Existen alertas por zona/reincidencia/condiciones climaticas.
- Existen reportes de presion y evolucion temporal.
- El modulo mantiene trazabilidad y auditoria de decisiones tecnicas.
