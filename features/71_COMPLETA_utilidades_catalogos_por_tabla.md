# 71 - Utilidades: más catálogos y una tabla por catálogo

## Descripción
Extender el apartado **Utilidades** a más dropdowns del sistema y cambiar el
almacenamiento a **una tabla por catálogo** (todas con prefijo `utilidad_`),
migrando también los catálogos existentes (destino, tipo de pérdida).

Nuevos catálogos:
1. **Cultivo** (`utilidad_cultivo`): alimenta el cultivo del alta de lote y el
   cultivo de la nueva detección de plaga.
2. **Tipo de plaga** (`utilidad_tipo_plaga`): el "tipo" del catálogo de plagas.
3. **Tipo de insumo** (`utilidad_tipo_insumo`) y **Unidad de insumo**
   (`utilidad_unidad_insumo`): el tipo y la unidad del alta de insumo.

## Decisiones (confirmadas por el usuario)
- **Una tabla por catálogo** (no la tabla genérica única). Se migran destino y
  tipo de pérdida de `utilidad_opcion` a `utilidad_destino_cosecha` y
  `utilidad_tipo_perdida`, y se elimina `utilidad_opcion`.
- La **detección** toma el cultivo del catálogo `CULTIVO` (punto 1).
- Todas las tablas empiezan con `utilidad_`.

## Alcance
### Backend
- Migración `V48`: crea las 6 tablas `utilidad_*` (id, valor, activo, orden,
  timestamps, deleted_at, UNIQUE(valor)); migra los datos de destino y tipo de
  pérdida desde `utilidad_opcion`; seedea cultivo/tipo plaga/tipo insumo/unidad;
  hace `DROP TABLE utilidad_opcion`.
- El módulo Utilidades se refactoriza a una **fachada genérica**: un registro
  `categoria → tabla` (whitelist) y CRUD por `JdbcTemplate`, preservando el
  contrato HTTP (`?categoria=`) y el shape `{id,categoria,valor,activo,orden}`.
  Se elimina la entidad/repo JPA `UtilidadOpcion` (la tabla se dropea). El
  `DELETE` pasa a requerir `categoria` (para saber la tabla).
- Campos que pasan de enum a **String** (las columnas ya son VARCHAR, sin
  migración de tipo): `InsumoAgricola.tipo`/`unidadMedida`, `CatalogoPlaga.tipo`.
  Se ajustan entidad/DTOs/repo/controller/service y se quita el `.name()` en el
  mapper de detección. Se eliminan los enums `TipoInsumoAgricola`,
  `UnidadMedidaInsumo`, `TipoPlaga`.

### Frontend web
- Pantalla Utilidades: suma los 4 catálogos nuevos a la constante `CATALOGOS`.
- `configurable-select` en: cultivo del alta de lote (`lote-form`), tipo del
  catálogo de plaga y cultivo de la detección (`plagas-page`), tipo y unidad del
  alta de insumo (`agricola-insumos-page`). Modelos: los campos pasan a `string`.
  El servicio de utilidades manda `categoria` en el `DELETE`.

### Mobile
- Tipos: `TipoPlaga` pasa a string. El "tipo" del catálogo de plaga y el cultivo
  (detección y alta de lote) se alimentan de los catálogos (`useUtilidadOpciones`),
  sumados a la sync down. No hay pantalla de insumos en mobile.

## Reglas heredadas (feature 70)
Cada catálogo en la pantalla Utilidades: máx. 4 visibles + scrollbar Y premium,
orden alfabético, alta con "+" y baja.

## Requisitos Técnicos
- Backend compila + Hibernate `validate` OK (sin entidad de la tabla dropeada).
- Frontend `npm run type-check` verde; mobile `tsc` verde.

## Dependencias
- Feature 60 y 70 (módulo Utilidades), 15 (insumos), 37 (plagas), 01 (lotes).

## Estado
Realizada. Verificada end-to-end contra Docker:
- 6 tablas `utilidad_*` creadas; destino y tipo de pérdida **migrados** desde
  `utilidad_opcion` (que se dropeó); Hibernate `validate` OK sin la entidad.
- Los 6 catálogos devuelven sus valores en orden alfabético; categoría inválida
  (whitelist) no ejecuta nada; POST + DELETE con `categoria` OK (204).
- Pantalla Utilidades muestra los 6 catálogos con la regla máx 4 + scroll Y
  (Cultivos/Tipo de insumo/Unidad scrollean).
- El alta de catálogo de plaga usa el `configurable-select` de `TIPO_PLAGA`
  (opciones alfabéticas + botón "+").
- Gates: `mvn compile` + `test-compile`, `npm run type-check`, `tsc` mobile — verdes.
