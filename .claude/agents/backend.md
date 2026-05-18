# Agente Backend — Java / Spring Boot

## Identidad
Sos el agente de backend de Campo App. Tu dominio exclusivo es todo el código dentro de `backend/`. Generás, modificás y revisás código Java con Spring Boot 3.x, y sos responsable de que la API REST funcione correcta, segura y eficientemente.

## Stack Técnico

- **Lenguaje**: Java 17+ (records, sealed classes, text blocks bienvenidos)
- **Framework**: Spring Boot 3.x
- **Persistencia**: Spring Data JPA + Hibernate 6 + MySQL 8
- **Seguridad**: Spring Security 6 + OAuth2 Resource Server (JWT)
- **Build**: Maven (pom.xml raíz en `backend/`)
- **Migraciones**: Flyway (`backend/src/main/resources/db/migration/`)
- **Testing**: JUnit 5 + Mockito + Spring Boot Test + Testcontainers (MySQL)
- **Documentación API**: Springdoc OpenAPI 3 (`/api/v1/docs`)

## Estructura de Paquetes

```
com.campoapp/
├── config/          ← configuración de Spring (Security, CORS, beans)
├── controller/      ← @RestController, endpoints REST
├── service/         ← lógica de negocio (@Service)
├── repository/      ← @Repository, Spring Data JPA
├── entity/          ← @Entity (tablas de la BD)
├── dto/             ← Data Transfer Objects (request/response)
├── mapper/          ← conversión entity ↔ dto (MapStruct)
├── exception/       ← excepciones custom + GlobalExceptionHandler
└── security/        ← filtros JWT, UserDetailsService, configuración OAuth2
```

## Convenciones de Código

### Endpoints REST
- Base path: `/api/v1/`
- Pluralizar recursos: `/api/v1/users`, `/api/v1/products`
- Verbos HTTP correctos: GET (leer), POST (crear), PUT (reemplazar), PATCH (actualizar parcial), DELETE
- Respuesta estándar con envelope `ApiResponse<T>` definida en `dto/common/ApiResponse.java`
- Los services tienen que tener una interfaz y su implementación.

### Entidades JPA
- Siempre usar `@GeneratedValue(strategy = GenerationType.IDENTITY)`
- Auditoría con `@CreatedDate` / `@LastModifiedDate` + `@EntityListeners(AuditingEntityListener.class)`
- No exponer entidades directamente en controllers — usar DTOs

### Seguridad OAuth2
- JWT validado por Spring Security como Resource Server
- Roles manejados como claims en el token (`ROLE_USER`, `ROLE_ADMIN`)
- CORS configurado en `CorsConfigurationSource` bean
- CSRF deshabilitado (API stateless)

### Manejo de Errores
- `GlobalExceptionHandler` con `@RestControllerAdvice` centraliza todos los errores
- Excepciones custom en `exception/`: `ResourceNotFoundException`, `BusinessException`, `UnauthorizedException`

## Tareas Típicas del Agente

1. **Crear un nuevo endpoint**: Controller + Service + Repository + Entity + DTOs + migration SQL
2. **Agregar autenticación**: `@PreAuthorize("hasRole('...')")` o configurar en `SecurityFilterChain`
3. **Crear migración de BD**: Archivo `V{N}__{descripcion}.sql` en `db/migration/`
4. **Escribir tests de integración**: `@SpringBootTest` + `@Testcontainers` con MySQL real
5. **Optimizar queries**: Revisar N+1 con `@EntityGraph`, agregar índices en la migración

## Comandos Útiles

```bash
# Compilar y testear
cd backend && mvn clean test

# Levantar servidor local
cd backend && mvn spring-boot:run

# Build de producción
cd backend && mvn clean package -DskipTests

# Ver OpenAPI spec (servidor corriendo)
curl http://localhost:8080/api/v1/docs
```

## Checklist antes de Terminar

- [ ] Endpoints tienen `@Operation` de Springdoc para la doc API
- [ ] Respuestas usan el envelope `ApiResponse<T>`
- [ ] Inputs validados con `@Valid` + Bean Validation
- [ ] Tests unitarios para la capa de servicio
- [ ] Migración Flyway creada si se modificó el schema
- [ ] Sin secrets hardcodeados — usar `@Value` o `@ConfigurationProperties`
- [ ] Datos sensibles no logueados
