# Auditoría de Seguridad — Feature 01: Gestión de Lotes

**Fecha:** 2026-05-18
**Versión:** 0.3.0
**Alcance:** endpoints `/api/v1/agricola/lotes/{loteId}/suelo`, `/api/v1/agricola/historial`, `/api/v1/agricola/lotes/{loteId}/rotacion`

---

## Resumen Ejecutivo

| Severidad | Cantidad |
|-----------|----------|
| Crítica   | 0        |
| Alta      | 0        |
| Media     | 1        |
| Baja      | 1        |
| Info      | 2        |

**Estado general: APROBADO para merge a `develop`.**

---

## Hallazgos

### [MEDIA] JSON almacenado sin validación de esquema — `poligono`

**Endpoint:** `PUT /api/v1/agricola/lotes/{id}`
**Campo:** `LoteRequest.poligono` — acepta cualquier JSON como `String`

**Descripción:**
El campo `poligono` se persiste directamente en la columna `JSON` de MySQL sin validar que sea un GeoJSON válido (FeatureCollection o Polygon). Un payload malformado puede causar errores silenciosos en el frontend al intentar parsear el polígono con Leaflet.

**No es inyección:** MySQL valida la sintaxis JSON internamente; un valor no-JSON es rechazado por el motor. El riesgo es de integridad de datos, no de seguridad directa.

**Mitigación recomendada:**
- Agregar una anotación `@JsonValid` o un validador custom en `LoteRequest` que verifique la estructura GeoJSON
- Alternativamente, validar en el servicio antes de persistir

**Estado:** Aceptado como deuda técnica — agregar en Feature siguiente que use el campo (p.ej., módulo de mapas).

---

### [BAJA] Autorización por recurso no verificada (IDOR implícito)

**Endpoints:** `GET /api/v1/agricola/suelo/{id}`, `GET /api/v1/agricola/historial/{id}`

**Descripción:**
Los endpoints de búsqueda por ID no verifican que el lote asociado al análisis o al histórico pertenezca a una organización o usuario con acceso. Un usuario con el permiso `read:suelo` de cualquier organización podría, en principio, acceder a registros de otras organizaciones si conociera el UUID.

**Contexto:** La versión actual no implementa multi-tenancy. Todos los usuarios autenticados comparten el mismo espacio de datos. Este hallazgo es preventivo para cuando se agregue multi-tenancy.

**Mitigación recomendada:**
- Al implementar multi-tenancy: agregar campo `organizacionId` en `AuditableEntity` y filtrar en todos los repositorios
- Evaluar en Feature de multi-tenancy o antes del primer despliegue en producción multi-cliente

**Estado:** Registrado para Feature de multi-tenancy (backlog).

---

## Checklist OWASP Top 10 (2021)

| # | Categoría | Resultado |
|---|-----------|-----------|
| A01 | Broken Access Control | ✅ `@PreAuthorize` en todos los endpoints; soft delete oculta datos eliminados |
| A02 | Cryptographic Failures | ✅ No se almacena información sensible en estas tablas |
| A03 | Injection | ✅ JPQL parametrizado; sin SQL dinámico; JSON validado por MySQL |
| A04 | Insecure Design | ⚠️ IDOR preventivo documentado (ver hallazgo BAJA) |
| A05 | Security Misconfiguration | ✅ CORS restrictivo; CSRF deshabilitado (API stateless) |
| A06 | Vulnerable Components | ✅ Sin nuevas dependencias en Feature 01 |
| A07 | Authentication Failures | ✅ JWT validado por filtro en cada request |
| A08 | Software and Data Integrity | ✅ Flyway versioned migrations; no scripts externos |
| A09 | Security Logging | ✅ `AuditableEntity.createdAt/updatedAt` trazabilidad básica |
| A10 | Server-Side Request Forgery | ✅ No hay fetch de URLs externas en estos endpoints |

---

## Validación de entrada — Endpoints nuevos

### `POST /api/v1/agricola/suelo`
| Campo | Validación |
|-------|-----------|
| `loteId` | `@NotBlank` |
| `fecha` | `@NotNull` (LocalDate) |
| `ph` | `@DecimalMin("0.0") @DecimalMax("14.0")` — previene valores fuera de rango |
| `nitrogenoKgHa / fosforoKgHa / potasioKgHa` | `@DecimalMin("0.0")` |
| `materiaOrganicaPct` | `@DecimalMin("0.0") @DecimalMax("100.0")` |
| `conductividadElectrica` | `@DecimalMin("0.0")` |

### `POST /api/v1/agricola/historial`
| Campo | Validación |
|-------|-----------|
| `loteId` | `@NotBlank` |
| `cultivo` | `@NotBlank @Size(max=50)` |
| `temporada` | `@NotBlank @Size(max=20)` |
| `rendimientoKgHa` | `@DecimalMin("0.0")` |

### `GET /api/v1/agricola/lotes/{loteId}/rotacion`
- Endpoint de solo lectura; no acepta body
- `loteId` validado en capa de servicio (lanza `ResourceNotFoundException` si no existe)

---

## Conclusión

Feature 01 mantiene el nivel de seguridad establecido en Feature 00. Los dos hallazgos documentados son preventivos y no representan riesgo en el estado actual de la aplicación. Se aprueba el merge a `develop`.
