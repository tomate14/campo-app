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

## Flujo de Nuevas Features
1. Leer la feature objetivo en `features/`.
2. Identificar alcance real y dependencias.
3. Implementar backend primero cuando define contratos.
4. Implementar frontend web y mobile sobre esos contratos.
5. Validar con testing tecnico disponible.
6. Si queda trabajo pendiente fuera del alcance cerrado, crear una nueva feature numerada `max + 1`.

## Convenciones Globales
- Idioma del codigo: ingles.
- Comentarios y documentacion interna: espanol.
- No actualizar changelogs ni auditorias salvo pedido explicito del usuario.
- Los pendientes detectados deben materializarse como features nuevas, no solo mencionarse en respuestas.

## Estado Actual del Frontend
- El frontend web vigente es Angular.
- Los componentes Angular deben quedar separados por carpeta con archivos `.ts`, `.html` y `.css`.
- El runtime web no debe depender de hooks React.
- Mobile puede seguir usando React Query y hooks propios.
