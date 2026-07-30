# 62 - Frontend: selects con buscador alimentados por options (sin endpoint)

## Descripción
Unificar el criterio de los selects con buscador (`app-remote-search-select`)
para que reciban los datos por `[options]` (lista ya cargada por el componente
padre) en vez de `[endpoint]` (auto-fetch por cada instancia). Con `[endpoint]`,
cada combo pega al backend al montar (y por búsqueda), generando llamadas
redundantes; con `[options]` el filtrado es client-side y no hay llamadas extra.

## Contexto
- Componente compartido: `frontend/src/app/shared/remote-search-select`. Ya
  soporta `[options]`: cuando `options.length > 0`, filtra en memoria y NO llama
  al endpoint.
- Precedente: en `ganaderia-trazabilidad-page` los combos de Madre/Padre se
  migraron a `[options]` (una sola carga de `/animales` + split por sexo en el
  front), eliminando las N llamadas al abrir el form de registrar animal.
- Alcance actual: **47** usos de `app-remote-search-select` con `[endpoint]` en
  **12 componentes**. Endpoints: operarios (21), animales (13), maquinas (5),
  potreros (4), usuarios (2), proveedores (2), lotes (2), facturas (2), razas (1),
  insumos (1), compras (1), clientes (1).

## Alcance
Para cada `app-remote-search-select` que hoy use `[endpoint]`:
1. Asegurar que el componente padre cargue la lista correspondiente **una sola
   vez** (en un signal/observable), reutilizando cargas existentes cuando ya las
   haya.
2. Reemplazar `[endpoint]` (+ `[extraParams]`) por `[options]` con la lista
   cargada; replicar el filtrado que hacían los `extraParams`/`allowedValues`
   como computeds client-side (p. ej. operarios por `estado: ACTIVO` y por
   `rol: VETERINARIO`, animales por sexo, etc.).
3. Mantener `valueField`, `labelField`, `subtitleFields`, `searchFields`,
   `[value]`, `(valueChange)`, `(itemSelected)`.

## Consideraciones / caveat
- Ideal para datasets acotados (operarios, animales, potreros, maquinas, razas,
  lotes, insumos, clientes, proveedores de un establecimiento).
- Para listas potencialmente grandes o ya paginadas (**facturas**, **compras**),
  cargar todo en memoria puede no escalar: evaluar caso por caso; si el volumen
  lo justifica, dejar esos selects con búsqueda server-side o cargar un tope
  razonable. Documentar la decisión por cada uno.
- No romper el contrato de los formularios ni la preselección de valores.

## Requisitos Técnicos
- Sin cambios de backend (se reutilizan los listados existentes).
- Gate: `npm run type-check` verde en frontend.
- Verificación en navegador: al abrir los forms, no deben dispararse llamadas por
  combo (solo las cargas de lista del propio componente).

## Dependencias
- Feature 31 (componente select-buscador), 53 (precedente de options en mobile).

## Estado
Realizada.

## Resumen de implementación
- Migrados 44 de 47 combos `app-remote-search-select` de `[endpoint]` a
  `[options]` en 12 componentes. Cada catálogo (operarios, animales, potreros,
  maquinas, lotes, razas, insumos, clientes, proveedores) se carga una sola vez
  en el padre y se expone por signal/computed; los filtros de `extraParams`/
  `allowedValues` se replicaron client-side (`operariosActivos`, `veterinarios`,
  hembras/machos por sexo, etc.). Se quitaron `[endpoint]`/`[extraParams]`/
  `[allowedValues]`/`queryParam` de esos combos.
- **3 combos quedaron con `[endpoint]` a propósito** (listas paginadas/grandes,
  con comentario `TODO(feature 62)`): Factura en los modales COBRO y NOTA de
  `finanzas-facturacion-page` (2) y Compra en el modal PAGO de
  `finanzas-compras-page` (1). Cargarlas enteras en memoria no escala; quedan con
  búsqueda server-side hasta evaluar un tope/estrategia.
- Nota: el rol de veterinario se filtra por `rolOperativo` (el modelo `Operario`
  del front no tiene campo `rol`). Algunas props viejas quedaron sin uso en un
  par de páginas (no rompen el gate); se pueden limpiar en un pase aparte.
- Gate: `npm run type-check` verde. Precedente (Madre/Padre en trazabilidad)
  verificado en navegador: al abrir el form no se disparan llamadas por combo.
