# Campo App - Orquestador Principal

## Descripcion del Proyecto
Campo App es una aplicacion full-stack con API REST en Java/Spring Boot, frontend web en Angular, app mobile en React Native/Expo, y cobertura de testing, seguridad y documentacion.

## Stack Tecnologico Global

| Capa | Tecnologia |
|------|-----------|
| Backend | Java 17+, Spring Boot 3.x, Spring Security (OAuth2), JPA/Hibernate, MySQL 8 |
| Frontend Web | Angular 21, TypeScript, HttpClient, signals, MapLibre |
| Mobile | React Native, Expo Router, React Query |
| Testing | JUnit 5, Mockito (backend) · Jest / TypeScript checks |
| Documentacion | OpenAPI 3 / Springdoc, Markdown |
| Seguridad | Spring Security OAuth2, OWASP Top 10, analisis de dependencias |

## Estructura del Repositorio

```text
campo-app/
|- CLAUDE.md
|- features/
|- backend/
|- frontend/
|- mobile/
|- docs/
```

## Regla de Features Nuevas
- Toda nueva feature debe crearse como archivo nuevo dentro de `features/` antes de desarrollar codigo.
- Si durante el desarrollo aparece trabajo pendiente que no se completa en la feature actual, ese pendiente no queda como nota suelta: se crea otra feature nueva.
- Esa feature nueva debe usar siempre el numero siguiente al maximo numero de feature existente en el proyecto.
- No reutilizar numeros viejos ni crear nombres ad hoc fuera de la secuencia principal.
- Ejemplo: si la maxima feature existente es `27_*`, el siguiente pendiente nuevo se crea como `28_*`.
- Toda feature nueva o cambio de estado de una feature debe registrarse tambien en `features/MANIFEST.md`.
- Cuando una feature se termine, actualizar `features/MANIFEST.md` marcandola como `Realizada` o `Parcial` segun corresponda.

## Flujo de Nuevas Features
1. Leer la feature objetivo en `features/`.
2. Crear un branch nuevo desde `master` con el nombre exacto del archivo o feature que se va a desarrollar.
3. Implementar todos los cambios de esa feature dentro de ese branch.
4. Identificar alcance real y dependencias.
5. Implementar backend primero cuando define contratos.
6. Implementar frontend web y mobile sobre esos contratos.
7. Validar con testing tecnico disponible.
8. Si queda trabajo pendiente fuera del alcance cerrado, crear una nueva feature numerada `max + 1`.

## Convenciones Globales
- Idioma del codigo: ingles.
- Comentarios y documentacion interna: espanol.
- No actualizar changelogs ni auditorias salvo pedido explicito del usuario.
- Los pendientes detectados deben materializarse como features nuevas, no solo mencionarse en respuestas.
- Cuando el usuario pida desarrollar una feature, siempre crear primero un branch nuevo desde `master` con el nombre exacto de la feature y trabajar ahi.

## Estado Actual del Frontend
- El frontend web vigente es Angular.
- Los componentes Angular deben quedar separados por carpeta con archivos `.ts`, `.html` y `.css`.
- El runtime web no debe depender de hooks React.
- Mobile puede seguir usando React Query y hooks propios.
- Todas las cards nuevas del sistema deben seguir el lenguaje visual premium dark SaaS ya definido en la pantalla de ganaderia/sanidad.
- Evitar cards genericas o basicas: usar jerarquia visual clara, glassmorphism suave, bordes amplios, espaciado limpio, contraste alto y acabado enterprise consistente con Campo App.
- No usar siglas, letras o abreviaturas como iconos visuales. Todo icono nuevo debe ser un SVG o un icono real; si no hay un icono claro para representar la accion o entidad, preguntar antes de resolverlo con texto.

## Regla Visual de Tooltips
- Todos los tooltips nuevos de graficos y visualizaciones deben usar el patron premium de Campo App: card dark SaaS de aproximadamente 380x430px, fondo #081225/#0B1730, borde 1px rgba(159,232,112,0.20), radio 24px, glow verde sutil, banda superior con color de serie/cultivo, icono real, titulo grande, subtitulo gris, badge de estado, separador sutil, metricas con icono-label-valor y footer de leyenda. No usar tooltips nativos simples para graficos salvo fallback tecnico temporal.

