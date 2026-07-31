# 67 - Frontend: scrollbar del sidebar colapsado (color premium + sin barra X)

## Descripción
Cuando el menú lateral (sidebar del `dashboard-shell`) queda colapsado, se veían
dos scrollbars nativas grises: la vertical (eje Y) y la horizontal (eje X). Se
pide: (1) darle a la barra vertical los colores de la identidad de Campo App (no
la gris por defecto) y (2) hacer desaparecer la barra horizontal cuando el menú
está colapsado.

## Contexto
- El área scrolleable es `.nav-section` (`overflow-y: auto`), que al no fijar
  `overflow-x` termina con `overflow-x: auto` implícito → aparece la barra X
  cuando el contenido colapsado desborda por unos píxeles.

## Solución (resuelto en el branch de la feature 65 por pedido del usuario)
En `frontend/src/app/layout/dashboard-shell/dashboard-shell.component.css`:
- Scrollbar temática en `.nav-section` con el verde premium:
  - Firefox: `scrollbar-width: thin` + `scrollbar-color: rgba(159,232,112,0.45) transparent`.
  - WebKit/Chromium: `::-webkit-scrollbar` de 6px, track transparente y thumb con
    gradiente verde→azul (`rgba(159,232,112,…)` → `rgba(110,168,255,…)`) y hover
    más intenso.
- `.collapsed .nav-section { overflow-x: hidden; }` para eliminar la barra del
  eje X cuando el menú está colapsado (la vertical se mantiene).

## Requisitos Técnicos
- Solo CSS del `dashboard-shell`. Sin cambios de lógica.

## Verificación
- Contra el stack Docker (estilos computados): con el menú colapsado
  `.nav-section` queda con `overflow-x: hidden` (barra X eliminada) y
  `overflow-y: auto`; `scrollbar-color` = verde premium + track transparente,
  `scrollbar-width: thin`. En expandido no se altera el comportamiento previo.

## Dependencias
- Feature 41 (sidebar/menú por permisos).

## Estado
Realizada.
