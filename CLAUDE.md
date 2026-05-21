# Campo App — Orquestador Principal

## Descripción del Proyecto
Campo App es una aplicación full-stack con API REST en Java/Spring Boot, frontend web en Next.js, app mobile en React Native (monorepo compartido), y cobertura completa de testing, seguridad y documentación.

## Stack Tecnológico Global

| Capa | Tecnología |
|------|-----------|
| Backend | Java 17+, Spring Boot 3.x, Spring Security (OAuth2), JPA/Hibernate, MySQL 8 |
| Frontend Web | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Mobile | React Native 0.73+, Expo SDK, compartiendo lógica con frontend |
| Testing | JUnit 5, Mockito (backend) · Jest, Playwright (frontend/mobile) |
| Documentación | OpenAPI 3 / Springdoc, Markdown |
| Seguridad | Spring Security OAuth2, OWASP Top 10, análisis de dependencias |

## Estructura del Repositorio (Monorepo)

```
Campo-app/
├── CLAUDE.md                  ← este archivo (orquestador)
├── features/                  ← punto de entrada de todas las nuevas features
│   └── {nombre-feature}/
│       └── feature.md         ← descripción, criterios y agentes involucrados
├── .claude/
│   └── agents/
│       ├── backend.md         ← agente backend
│       ├── frontend.md        ← agente frontend
│       ├── testing.md         ← agente testing
│       ├── security.md        ← agente seguridad
│       ├── mobile.md          ← agente mobile
│       └── docs.md            ← agente documentación
├── backend/                   ← Spring Boot project (Maven)
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── src/test/java/
├── frontend/                  ← Next.js web app
│   ├── src/app/
│   ├── src/components/
│   └── src/lib/               ← lógica compartida con mobile
├── mobile/                    ← React Native / Expo app
│   ├── app/
│   ├── components/
│   └── shared/                ← referencia a frontend/src/lib/
├── docs/                      ← documentación generada y manual
│   ├── api/
│   ├── guides/
│   └── changelogs/
└── tests/                     ← tests E2E compartidos
```

---

## Flujo de Nuevas Features — `/features`

**Toda nueva feature empieza creando un archivo en `/features` antes de escribir una sola línea de código.**

### Estructura de una feature

```
features/
└── {nombre-en-kebab-case}/
    └── feature.md
```

### Formato del archivo `feature.md`

```markdown
# Feature: {Nombre}

## Descripción
Qué hace esta feature y por qué existe.

## Criterios de Aceptación
- [ ] criterio 1
- [ ] criterio 2

## Agentes Involucrados
- [ ] Backend — qué endpoints/entidades crea o modifica
- [ ] Frontend — qué páginas/componentes crea o modifica
- [ ] Mobile — qué pantallas crea o modifica (si aplica)
- [ ] Testing — qué tests hay que escribir
- [ ] Seguridad — qué revisar antes del merge
- [ ] Documentación — qué documentar al terminar

## Notas Técnicas
Decisiones de diseño, dependencias entre agentes, referencias a ADRs.
```

### Cómo el orquestador deriva la feature

Cuando se crea o actualiza un archivo en `features/`, el orquestador:

1. **Lee** el `feature.md` para entender el alcance
2. **Identifica** qué agentes están involucrados según la sección "Agentes Involucrados"
3. **Ordena** las tareas respetando dependencias (backend define el contrato → frontend/mobile lo consumen → testing valida → seguridad audita → docs documenta)
4. **Delega** a cada agente con instrucciones específicas derivadas del feature.md
5. **Verifica** que cada agente complete su checklist antes de marcar la feature como terminada

### Orden de ejecución por defecto

```
Backend ──► Frontend ──► Testing
              └──► Mobile ──────┘
```

### Ejemplo de invocación

Para empezar a trabajar en una feature:

> "trabajar en features/login-oauth2"

El orquestador leerá `features/login-oauth2/feature.md` y coordinará los agentes en el orden correcto.

---

## Convenciones Globales

### Código
- **Idioma del código**: inglés (variables, funciones, clases)
- **Comentarios y docs**: español
- **Ramas**: `main` (producción), `develop` (integración), `feature/*`, `fix/*`, `chore/*`
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`)
- **Directorio de salida**: todo archivo generado va a `C:\Users\Maxi\Desktop\campo-app` y sus subcarpetas (`backend/`, `frontend/`, etc.) — nunca a una carpeta `output/`

### APIs
- REST bajo `/api/v1/`
- Respuestas con envelope: `{ data, error, metadata }`
- Autenticación: Bearer token (JWT via OAuth2)
- Errores: códigos HTTP estándar + mensaje descriptivo en español

### Seguridad
- Nunca commitear secrets — usar variables de entorno
- Revisar OWASP Top 10 en cada PR de backend
- Dependencias: `mvn dependency-check` (backend) y `npm audit` (frontend/mobile) semanalmente

## Cómo Invocar Cada Agente

- **"agente backend"** → endpoints, entidades JPA, servicios, repositorios, configuración de seguridad
- **"agente frontend"** → componentes Next.js, páginas, hooks, estilos Tailwind
- **"agente testing"** → escribe o ejecuta tests unitarios, de integración o E2E
- **"agente seguridad"** → audita el código, revisa vulnerabilidades, valida OAuth2
- **"agente mobile"** → screens React Native, navegación, componentes nativos
- **"agente documentación"** → OpenAPI specs, READMEs, guías, changelogs

## Variables de Entorno Requeridas

```env
# Backend (backend/.env)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=campo_db
DB_USER=campo_user
DB_PASS=<secret>
OAUTH2_CLIENT_ID=<secret>
OAUTH2_CLIENT_SECRET=<secret>
JWT_SECRET=<secret>
JWT_EXPIRATION_MS=86400000

# Frontend / Mobile (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_OAUTH2_CLIENT_ID=<secret>
```
## Reglas generales antes de empezar una feature nueva
- Crear una nueva rama git con el nombre de la feature. Ejemplo `00_agricultura_monitoreo_siembra_cosecha`
- **NUNCA** crear archivos de documentación (`docs/`, `*.md` de auditoría, changelogs, READMEs) a menos que el usuario lo pida explícitamente en ese momento
- **NUNCA** generar auditorías de seguridad (`audit-*.md`), reportes OWASP ni archivos en `docs/security/`
- **NUNCA** actualizar `CHANGELOG.md` ni crear entradas de versión
- Los agentes de Seguridad y Documentación **no se ejecutan** en el flujo por defecto
- El flujo de ejecución es: Backend → Frontend + Mobile → Testing (fin)