# Feature 80 - Frontend: budgets de build de producción (initial bundle + anyComponentStyle)

## Contexto
Durante la feature 79 se detectó que `ng build` (producción, AOT) **falla por límites de
budget** definidos en `frontend/angular.json`:
- `type: initial` → `maximumError: 2.35MB`; el bundle inicial lo excede (~277 kB por encima).
- `type: anyComponentStyle` → `maximumError: 32kB`; `plagas-page.component.css` ya estaba en
  ~32.48 kB en HEAD (por encima del error) y con la 79 llegó a ~35.9 kB.

Es **tech-debt preexistente** (no lo introdujo la 79): la app corre en dev server (`ng serve`) por
Docker, donde los budgets **no se aplican**, así que hoy no hay impacto en runtime. Pero cualquier
build de producción falla.

## Objetivo
Que `ng build` de producción pase, sin degradar el lenguaje visual premium.

## Alcance / enfoque posible
- **CSS por componente**: extraer estilos compartidos repetidos (cards premium, modales, dropzones,
  hero de imagen) a estilos comunes/reutilizables para bajar el peso de `plagas-page.component.css`
  y otros; o dividir el componente. Objetivo: volver por debajo del budget de `anyComponentStyle`.
- **Initial bundle**: revisar imports pesados, `loadComponent`/lazy loading de rutas grandes
  (plagas, ganadería, reportes), y análisis de bundle para reducir el inicial.
- Sólo si lo anterior no alcanza y se decide con criterio: ajustar los umbrales de budget en
  `angular.json` (documentando por qué).

## Fuera de alcance
- Cambios funcionales; es sólo tamaño/optimización de build y config.

## Estado
Pendiente.
