# Changelog — Campo App

## [0.3.0] — 2026-05-18

### Added — Feature 01: Agricultura — Gestión de Lotes

#### Backend (`com.campoapp.agricultura`)
- Migración Flyway `V3__gestion_lotes.sql`:
  - `ALTER TABLE lotes ADD COLUMN poligono JSON NULL` — soporte para polígono GeoJSON
  - `CREATE TABLE propiedades_suelo` — análisis de suelo (pH, N, P, K, M.O., CE, soft delete)
  - `CREATE TABLE historico_cultivos` — historial de cultivos por lote (soft delete)
  - Nuevos permisos RBAC: `read/create/update/delete:suelo`, `read/create/update/delete:historial`
- Entidades JPA: `PropiedadSuelo`, `HistoricoCultivo` (UUID, soft delete, auditoría)
- `Lote` extendido: campo `poligono` (JSON), relaciones `@OneToMany` con suelo e historial
- Servicios: `SueloService` + `HistorialCultivoService` (interface + implementación)
- Repositorios JPQL con soft delete: `PropiedadSueloRepository`, `HistoricoCultivoRepository`
- REST controllers:
  - `GET/POST/PUT/DELETE /api/v1/agricola/lotes/{loteId}/suelo` — CRUD análisis de suelo
  - `GET /api/v1/agricola/lotes/{loteId}/suelo/ultimo` — último análisis por lote
  - `GET/POST/PUT/DELETE /api/v1/agricola/historial` — CRUD historial de cultivos
  - `GET /api/v1/agricola/lotes/{loteId}/historial` — historial por lote
  - `GET /api/v1/agricola/lotes/{loteId}/rotacion` — recomendación de rotación pampeana
- Algoritmo de rotación: mapa estático con reglas para SOJA, MAÍZ, TRIGO, GIRASOL, SORGO
- Tests unitarios: `SueloServiceTest` (8 casos), `HistorialCultivoServiceTest` (10 casos)

#### Frontend (`frontend/src`)
- Tipos TypeScript: `PropiedadSuelo`, `HistoricoCultivo`, `RotacionRecomendacion` y sus requests
- API client extendido en `lib/api/agricola.ts` con 10 nuevas funciones para suelo e historial
- Hooks TanStack Query: `useSuelo`, `useHistorial` con invalidación automática de caché
- Página de detalle de lote `/agricola/lotes/[id]` con 4 tabs:
  - **Info** — campos del lote en grid de tarjetas
  - **Suelo** — lista de análisis + formulario de registro integrado
  - **Historial** — historial de cultivos + banner de recomendación de rotación
  - **Mapa** — visualización Leaflet con marker y polígono GeoJSON
- Componentes: `SueloForm`, `HistorialForm`, `LoteMapTab`
- Clases utilitarias globales: `field-input`, `btn-primary`, `btn-secondary` en `globals.css`

#### Mobile (`mobile/`)
- Shared hooks: `useSuelo`, `useHistorial` re-exportados desde `frontend/src/lib/`
- Pantalla `/agricola/suelo/[loteId]` — lista de análisis de suelo con modal de creación
- Pantalla `/agricola/historial/[loteId]` — historial de cultivos con banner de rotación recomendada
- Modales bottom-sheet: `SueloFormModal`, `HistorialFormModal` (KeyboardAvoidingView, chips de selección)

#### Seguridad
- Auditoría OWASP Feature 01 completada — 0 hallazgos críticos o altos
- Ver reporte: `docs/security/audit-feature01.md`

---

## [0.2.0] — 2026-05-18

### Added — Feature 00: Agricultura — Monitoreo de Siembra y Cosecha

#### Backend (`com.campoapp.agricultura`)
- Entidades JPA: `Lote`, `EventoSiembra`, `RegistroCosecha` (UUID, soft delete, auditoría automática)
- Migración Flyway `V2__agricultura_siembra_cosecha.sql` con tablas y permisos RBAC
- Servicios: `LoteService`, `SiembraService`, `CosechaService` (interface + implementación)
- Repositorios JPQL con filtrado por soft delete
- REST controllers bajo `/api/v1/agricola/`:
  - `GET/POST/PUT/DELETE /lotes` — CRUD de lotes con filtro por temporada y cultivo
  - `GET/POST/PUT/DELETE /siembra` — Eventos de siembra y monitoreo fenológico
  - `GET /siembra/rango` — Eventos por rango de fechas
  - `GET/POST/PUT/DELETE /cosecha` — Registro de cosechas
  - `GET /cosecha/lote/:id/rendimiento-promedio` — Analítica de rendimiento
- Permisos RBAC granulares: `read/create/update/delete:siembra` y `read/create/update/delete:cosecha`
- Tests unitarios JUnit 5 + Mockito: `LoteServiceTest`, `SiembraServiceTest`, `CosechaServiceTest`

#### Frontend (`frontend/src`)
- Sistema de diseño aplicado: tokens CSS con paleta Enterprise SaaS, tipografía Space Grotesk
- `tailwind.config.ts` actualizado con variables de diseño del sistema ui-ux-pro-max
- Tipos TypeScript: `Lote`, `EventoSiembra`, `RegistroCosecha` y sus requests
- API client Axios con interceptor de autenticación en `lib/api/agricola.ts`
- Hooks TanStack Query: `useLotes`, `useSiembra`, `useCosecha` con invalidación automática de caché
- Páginas dashboard:
  - `/agricola/lotes` — Grid de lotes con CRUD modal
  - `/agricola/siembra` — Timeline de eventos fenológicos con filtro por lote y tipo
  - `/agricola/cosecha` — Registro de cosechas con métricas de rendimiento
- Componentes: `LoteCard`, `LoteForm` (React Hook Form + Zod)

#### Mobile (`mobile/`)
- Sistema de colores `constants/colors.ts` sincronizado con el diseño web (light/dark)
- Expo Router con tabs: Inicio, Lotes, Campo
- Pantalla principal con stats rápidos y acceso directo a registro
- Lista de lotes con pull-to-refresh y navegación a detalle
- Formulario `nueva-siembra` con selección visual de tipo de evento y estado fenológico
- Shared hooks re-exportados desde `frontend/src/lib/` para reutilización de lógica

#### Seguridad
- Auditoría OWASP Top 10 completada — 0 hallazgos críticos o altos
- Ver reporte completo: `docs/security/audit-2026-05-18.md`

---

## [0.1.0] — Feature 26: Autenticación y Seguridad
- Sistema completo de autenticación JWT con refresh tokens
- RBAC con roles: `super_admin`, `admin`, `jefe_campo`, `operario`, `contador`
- Rate limiting en endpoints de auth (Bucket4j)
- Audit log de acciones críticas
