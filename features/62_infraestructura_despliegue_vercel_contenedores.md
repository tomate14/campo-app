# 62 - Infraestructura: despliegue en Vercel con contenedores

## Estado
Pendiente.

## Objetivo
Desplegar Campo App en Vercel usando Vercel Services y contenedores OCI para
Angular y Spring Boot, manteniendo MySQL y los archivos persistentes fuera de
los contenedores stateless.

## Alcance
1. Crear `Dockerfile.vercel` productivos para frontend y backend.
2. Configurar `vercel.json` con servicios separados y rutas:
   - `/*` hacia Angular.
   - `/api/*` hacia Spring Boot.
3. Adaptar Spring Boot al puerto dinamico `PORT`.
4. Crear un perfil de produccion seguro:
   - Flyway sin `clean` automatico.
   - conexion MySQL con SSL y pool acotado.
   - CORS parametrizado por ambiente.
   - secretos fuera del repositorio.
5. Reemplazar URLs `localhost` del frontend por `/api/v1`.
6. Reemplazar los `@Scheduled` incompatibles con scale-to-zero por endpoints
   internos protegidos y Vercel Cron.
7. Documentar y configurar MySQL administrado externo.
8. Configurar variables de Production y Preview sin compartir credenciales.
9. Validar builds, contenedores, rutas SPA, API, autenticacion y migraciones.
10. Crear y verificar el deployment de produccion en Vercel.

## Fuera de alcance
- Publicar binarios nativos de Expo en App Store o Play Store.
- Ejecutar MySQL dentro de Vercel.
- Usar el servidor Metro/Expo de desarrollo como deployment productivo.
- Implementar las capturas multimedia pendientes de la feature 56.

## Criterios de aceptacion
- Angular y Spring Boot responden desde un unico dominio HTTPS.
- `/api/v1/**` llega al backend sin CORS cruzado.
- La base de datos conserva datos entre reinicios y despliegues.
- Los jobs programados se disparan por endpoints autenticados e idempotentes.
- No hay secretos ni credenciales productivas versionadas.
- El frontend web y la aplicacion mobile pueden consumir la URL productiva.

## Dependencias
- Feature 24 (offline-first mobile).
- Feature 26 (autenticacion y tokens).
- Feature 56 para el almacenamiento multimedia futuro.

