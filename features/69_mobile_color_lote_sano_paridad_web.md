# 69 - Mobile: color del lote sano en paridad con web

## Descripción
El color de fondo (relleno del polígono) de los lotes en el mapa no coincidía
entre web y mobile. Se unifica para que sea idéntico en ambas plataformas.

## Problema (bug reportado)
- Web y mobile ya usaban el mismo criterio (salud por severidad de detecciones
  con estado `ABIERTA`/`EN_TRATAMIENTO`) y los mismos hex para CRITICA/ALTA/
  MEDIA/BAJA. La única divergencia era el **lote sano** (sin detecciones
  abiertas), que es la mayoría de los lotes:
  - Web (`plagas-page.component.ts` `loteHealthColor`): siempre `#9FE870` (verde).
  - Mobile (`(tabs)/lotes.tsx` `loteHealthColor`): devolvía `null` y caía en una
    **paleta rotativa por índice** (`palette[index % 6]` =
    `#9FE870,#6EA8FF,#9A7DFF,#FFB84D,#39D0D8,#75E4B3`), por lo que cada lote sano
    tomaba un color distinto según su posición en la lista. Además el ámbar
    `#FFB84D` colisionaba con el color de severidad MEDIA.

## Solución (resuelto en el branch de la feature 65 por pedido del usuario)
Web es la fuente de verdad. En `mobile/app/(tabs)/lotes.tsx`:
- `loteHealthColor` devuelve `#9FE870` en su rama final (tipo `string`, ya no
  `string | null`), igual que la web.
- Se elimina el fallback `?? palette[index % palette.length]` en el armado del
  item de lote (y el parámetro `index` que solo servía para eso).
- Se elimina la constante `palette` (quedaba sin uso).
La opacidad ya coincidía (web 0.24 / nativo alpha `3D` ≈ 0.239 / mobile-web 0.24),
sin cambios.

## Fuera de alcance
- Los mapas web de preview/detalle de un solo lote (`lote-map-preview`,
  `lote-detail-page`) usan colores fijos propios y no son parte de esta
  divergencia salud-por-lote.

## Requisitos Técnicos
- Mobile `tsc --noEmit` verde.

## Verificación
- `tsc` de mobile verde (sin `palette`/`index` sin uso). Paleta y criterio ahora
  idénticos entre web y mobile: severidades iguales y lote sano `#9FE870` en
  ambas. Verificación visual en dispositivo/emulador queda pendiente (mismo
  límite de entorno de las features mobile).

## Dependencias
- Feature 37 (plagas), 45/46 (mapa de lotes mobile), 66/68 (paridad web/mobile).

## Estado
Realizada.
