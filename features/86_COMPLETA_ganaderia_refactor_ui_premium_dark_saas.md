# 86 - Ganadería: refactor de UI premium dark SaaS (mockups)

## Descripción
Refactorizar toda la UI del módulo de ganadería (panel **web** Angular) siguiendo los
mockups aprobados (`Diseños-ganaderia.zip`, carpeta `export-v3`), unificando el
lenguaje visual premium dark SaaS ya definido en Campo App. Es un refactor **solo de
UI**: se preserva la funcionalidad, los datos y las llamadas al backend existentes.

## Decisiones (validadas con el usuario)
- **Plataforma**: solo web. Mobile (features 45/46/50) queda como está.
- **Profundidad**: solo UI/layout/estilos; se conserva la lógica, los datos y los
  endpoints actuales. No se tocan backend ni contratos.
- **Potreros**: excluido (no hay mockup; `ganaderia-potreros-page` / mapa queda igual).
- **Componentes compartidos**: se extrae un set reutilizable y se usa en todas las
  pantallas para consistencia y menos duplicación.

## Mapeo mockup → pantalla
- `01-04 trazabilidad-*` → `pages/ganaderia-trazabilidad-page` (tabs Animales / Movimientos / Genealogía; KPIs; filtros; tabla + toggle Tarjetas; paginación).
- `05-09 sanidad-*` → `pages/ganaderia-sanidad-page` (Alertas / Vacunaciones / Tratamientos / Diagnósticos / Catálogo).
- `10-13 alimentacion-*` → `pages/ganaderia-alimentacion-page` (Dietas / Suministros / Pesajes / Alertas).
- `14-20 reproduccion-*` → `pages/ganaderia-reproduccion-page` (Próximos partos / Servicios / Preñez / Partos / Índices genéticos / Genealogía / Cruzamientos).
- `21 dashboard-ganadero` → `pages/reportes-ganaderia-page`.
- `22-25 modales`: ficha animal, nuevo animal, detalle vacunación, registrar evento (modales de las pantallas anteriores).

## Set de componentes compartidos (nuevos, en `shared/`)
Reutilizables por todas las pantallas de ganadería (y candidatos a reuso general):
- **page-header**: eyebrow ("CAMPO APP · GANADERÍA") + título + subtítulo + slot de botones de acción.
- **kpi-card** / **kpi-grid**: tarjeta de KPI (ícono, label, valor grande, delta/subtítulo con tono verde/rojo/azul/amarillo).
- **tabs premium**: pestañas con ícono + label + badge de conteo.
- **data-table** con toggle **Tabla / Tarjetas** y paginación (o mejora del patrón existente).
- **premium-modal**: barra superior con gradiente verde, header (ícono, título, subtítulo, badge de estado, cerrar), cuerpo con grilla de tiles y secciones.
- **tarjeta de entidad** (animal / registro) para la vista Tarjetas.
Nota: reutilizar componentes ya existentes (`multi-search-select`, selects con buscador,
donut/line charts) donde apliquen.

## Requisitos técnicos
- Angular standalone + signals; sin hooks React (regla del proyecto).
- Lenguaje premium dark SaaS: glassmorphism suave, bordes amplios, alto contraste,
  íconos SVG reales (nada de letras/siglas como ícono), tooltips premium.
- Preservar el cableado de datos/servicios/estado de cada pantalla; el refactor no debe
  cambiar el comportamiento funcional ni los contratos.
- Tokens/colores consistentes con el resto (bg #081225, acento #9FE870, bordes
  rgba(110,168,255,.13) / rgba(159,232,112,.18), etc.).

## Fuera de alcance
- Mobile.
- Potreros (mapa interactivo).
- Cambios de backend / contratos / lógica de negocio.

## Dependencias
- Features de ganadería existentes: 04 (trazabilidad), 05 (sanidad), 06 (reproducción),
  07 (alimentación), 42/49 (dashboard ganadero), 51 (nombres operarios).

## Estado
Realizada. Refactor UI web del módulo ganadería (trazabilidad, sanidad, alimentación,
reproducción, dashboard ganadero + modales) según los mockups, con set de componentes
compartidos (page-header, kpi-card, stat-tabs, premium-modal, entity-card, info-tile,
svg-icon), preservando lógica/datos/endpoints. Validado: type-check consolidado limpio;
el build sólo falla por budgets preexistentes (feature 80). Solo web; Potreros excluido.
