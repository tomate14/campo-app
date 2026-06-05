# 12 - Operarios: GestiÃ³n y AdministraciÃ³n

## Estado
Completa. Implementada con backend, frontend Angular, migracion Flyway y validacion tecnica.

## Implementacion Realizada
- Backend `/api/v1/operarios/gestion` con CRUD de operarios, documentacion y cambios de rol.
- Persistencia con soft delete y auditoria base via `AuditableEntity`.
- Dashboard operativo con KPIs de dotacion, activos, disponibilidad y documentos vencidos.
- Frontend Angular en `/operarios/gestion` con KPIs, filtros, tabla premium, panel contextual y modales operativos.
- Navegacion agregada a la sidebar.
- Alta de operario simplificada sin legajo, email, tipo de contrato, jornada base, area ni ubicacion.
- Generacion automatica de usuario: primera letra del nombre + primera palabra del apellido, en minuscula y sin caracteres especiales.
- Password inicial igual al username generado. El cambio obligatorio en primer login mobile queda derivado a feature 39.

## DescripciÃ³n
Registro integral de operarios, roles, permisos y documentacion de personal en operaciones agricolas.

## Funcionalidades Principales
- Base de datos de operarios
- Roles y permisos (RBAC)
- DocumentaciÃ³n legal (DNI, contratos)

## Tareas
1. **Registro de Operarios**: Datos personales, documento, contacto
2. **Roles y Permisos**: AsignaciÃ³n de roles (peÃ³n, tractorista, supervisor, etc.)
3. **DocumentaciÃ³n**: Certificados, licencias, habilitaciones
4. **Contrato y Legales**: Datos del contrato, salario, fechas
5. **RBAC (Control de Acceso)**: QuÃ© puede hacer cada rol en el sistema
6. **Historial de Cambios**: Promociones, cambios de rol

## Servicios
- `OperarioService`: CRUD y gestiÃ³n
- `RBACService`: Control de permisos

## Repositorios
- `OperarioRepository`
- `RolRepository`
- `PermisoRepository`
- `DesempenoRepository`

## Requisitos TÃ©cnicos
- UUID para cada operario
- Soft delete obligatorio
- AuditorÃ­a de cambios de rol/permisos
- Endpoint REST: `/api/v1/operarios/gestion`
- Cumplimiento normativo laboral
- Disponible offline (base de datos de operarios)

## Integraciones Externas
- Sistema de autenticaciÃ³n (OAuth/JWT)

## Dependencias
- AutenticaciÃ³n (login)
- Finanzas (nÃ³mina)
- Ã“rdenes de Trabajo (asignaciones)

