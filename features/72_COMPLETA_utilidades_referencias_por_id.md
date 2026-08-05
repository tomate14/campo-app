# 72 - Utilidades: referencias por id (no por string)

## Descripción
Todo campo que referencia un catálogo de Utilidades debe **almacenar el id** de
la fila `utilidad_*`, no el string `valor`. Así, renombrar una opción del catálogo
se refleja en todas las referencias. Como el sistema no salió a producción, se
**editan las definiciones/seed de las migraciones y se regenera la base** (sin
script nuevo).

## Campos afectados y su catálogo
- `RegistroCosecha.destino` (DESTINO_COSECHA), `RegistroCosecha.tipoPerdida` (TIPO_PERDIDA_COSECHA)
- `Lote.cultivo` (CULTIVO) — el de mayor impacto (dashboard, analytics, mapa, filtros, cards)
- `DeteccionPlaga.cultivo` (CULTIVO) y el `tipo` que muestra (de `CatalogoPlaga.tipo`)
- `CatalogoPlaga.tipo` (TIPO_PLAGA)
- `InsumoAgricola.tipo` (TIPO_INSUMO), `InsumoAgricola.unidadMedida` (UNIDAD_INSUMO)

## Alcance
### Base de datos (editar migraciones + regenerar)
- V48: los seeds de los 6 catálogos `utilidad_*` usan **ids fijos** (slugs
  estables) en vez de `UUID()`. Destino y tipo de pérdida se seedean fresh con
  ids fijos (en vez de migrar de `utilidad_opcion`).
- V12 y V17: `catalogo_plagas.tipo` pasa a insertar el **id fijo** de
  `utilidad_tipo_plaga` (no el string `PLAGA/ENFERMEDAD/MALEZA`).
- No hay seeds de lotes/cosecha/insumos (todo runtime) → no requieren cambio; se
  regenera la base (`down -v`), los datos runtime viejos se descartan.

### Backend
- `UtilidadNombreResolver` (patrón `OperarioNombreResolver`): batch id→valor por
  catálogo (JdbcTemplate), con fallback al crudo.
- Responses con campo resuelto para display: `LoteResponse.cultivoNombre`,
  `DeteccionPlagaResponse.cultivoNombre`/`tipoNombre`, `CatalogoPlagaResponse.tipoNombre`,
  `InsumoAgricolaResponse.tipoNombre`/`unidadMedidaNombre`,
  `RegistroCosechaResponse.destinoNombre`/`tipoPerdidaNombre`. El campo original
  sigue devolviendo el id (para preseleccionar en el form).
- Agrupaciones/labels del dashboard y analytics (distribución por cultivo,
  estadios fenológicos, lotes mapa, comparativa por cultivo, resumen de destino)
  resuelven la etiqueta a `valor`. Los filtros por igualdad siguen andando
  enviando el id.

### Frontend web
- `configurable-select` pasa a bindear/emitir el **id** (mostrando el `valor`).
- Los displays usan los campos `*Nombre`. Los iconos de pin del mapa de plagas
  comparan contra `tipoNombre`. Filtros por cultivo/tipo emiten id.

### Mobile
- Chips/pickers emiten id; displays usan los `*Nombre`.

## Requisitos Técnicos
- Backend compila + validate OK; frontend `type-check`; mobile `tsc` — verdes.
- Regenerar la base y verificar que no se muestran ids crudos.

## Dependencias
- Feature 71 (catálogos por tabla), 51 (patrón resolver id→nombre).

## Estado
Realizada. Verificada end-to-end contra Docker (base regenerada con `down -v`):
- Los 6 catálogos `utilidad_*` se seedean con **ids fijos** legibles (slugs) y en
  orden alfabético; `catalogo_plagas.tipo` seedea el id `tpla-*` (V12/V17).
- Alta de lote `cultivo=cult-maiz` → response `cultivo=cult-maiz` + `cultivoNombre=MAIZ`.
- Catálogo de plaga → `tipo=tpla-plaga` + `tipoNombre=PLAGA` (idem enfermedad/maleza).
- Cosecha `destino=dest-silo`/`tipoPerdida=tperd-cola` → `destinoNombre=Silo` /
  `tipoPerdidaNombre=Cola`.
- Dashboard: distribución por cultivo muestra `MAIZ` y resumen de destino `Silo`
  (labels resueltas, no ids). Analytics comparativa por cultivo idem.
- Frontend: `configurable-select` emite/bindea el id; cards, tablas y tooltips
  muestran los `*Nombre`; los 3 filtros de cultivo de texto libre (lotes,
  plagas, analytics) se convirtieron a `configurable-select CULTIVO` (filtran por
  id exacto); iconos de pin del mapa comparan contra `tipoNombre`. Sin ids crudos
  en la UI, sin errores de consola.
- Mobile: pickers/chips emiten id, displays usan `*Nombre`, icono de pin del mapa
  usa `tipoNombre`.
- Gates verdes: `mvn clean package` (compile + test-compile + tests: 13/13 de los
  services tocados), `npm run type-check` (frontend), `npx tsc --noEmit` (mobile).
