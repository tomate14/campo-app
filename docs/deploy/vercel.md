# Despliegue de Campo App en Vercel

Campo App se despliega como un proyecto multi-servicio:

- `frontend`: Angular compilado y servido por Nginx.
- `backend`: Spring Boot 3 y Java 17.
- `/api/*`: rewrite interno hacia el backend.
- `/*`: rewrite hacia el frontend.
- region de compute: Mumbai (`bom1`), cercana a la instancia Aiven Free.

La aplicacion mobile no se publica en Vercel. Sus binarios se generan con EAS y
deben compilarse con `EXPO_PUBLIC_API_URL=https://<dominio>/api/v1`.

## Base de datos

Vercel no ejecuta el contenedor MySQL de `docker-compose.yml`. Se requiere una
instancia MySQL externa. El entorno actual utiliza Aiven for MySQL con SSL
obligatorio.

Variables obligatorias:

- `DB_URL` o `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
- `DB_SSL_MODE`
- `JWT_SECRET`
- `CRON_SECRET`

Variables opcionales:

- `FRONTEND_URL`
- credenciales OAuth
- limites de pool `DB_POOL_*`

Las migraciones Flyway no se ejecutan durante el arranque del backend en
Vercel. Deben aplicarse explicitamente antes de construir cada deployment con
`backend/deploy/migrate.ps1`. El script usa la misma version de Flyway que
Spring Boot y toma las credenciales exclusivamente desde `DB_URL`, `DB_USER` y
`DB_PASS`.

Antes de promover un deployment se debe comprobar:

- conexion correcta a la instancia MySQL
- validacion exitosa de todas las migraciones
- esquema actualizado sin migraciones pendientes

## Arranque del backend

El contenedor backend utiliza `deploy/vercel-launcher.go` como proceso de
entrada. Este launcher:

- abre inmediatamente el puerto publico definido por `PORT`
- inicia Spring Boot en el puerto interno `APPLICATION_PORT`
- espera a que Tomcat este disponible antes de derivar cada request
- propaga las senales de terminacion al proceso Java

Esto evita que Vercel descarte el contenedor durante el cold start de Spring,
Flyway y Hibernate. El binario Java se invoca mediante su ruta absoluta porque
el runtime de Vercel puede reemplazar la variable `PATH`.

El perfil `vercel` tambien habilita la inicializacion lazy de Spring Data JPA
para evitar construir todos los repositorios durante cada cold start.

## Schedulers

En el perfil `vercel` los schedulers de Spring estan deshabilitados porque los
contenedores escalan horizontalmente y a cero. Vercel Cron invoca endpoints GET
protegidos con `Authorization: Bearer $CRON_SECRET`.

Los horarios de `vercel.json` estan expresados en UTC:

- clima general: 04:30 UTC; las consultas refrescan el cache si supera 30 minutos
- precipitaciones: 05:00 UTC, equivalente a 02:00 de Buenos Aires
- idempotencia: 06:30 UTC, equivalente a 03:30 de Buenos Aires

El plan Hobby solo admite ejecuciones diarias. Por eso el cache climatico se
refresca bajo demanda al consultar un lote. Con Vercel Pro se puede restaurar
`*/30 * * * *` para ejecutar el barrido completo cada 30 minutos.

## Validacion local

```powershell
docker build -f backend/Dockerfile.vercel -t campo-backend-vercel backend
docker build -f frontend/Dockerfile.vercel -t campo-frontend-vercel frontend
```

## Despliegue

```powershell
npx vercel@latest link
npx vercel@latest env add DB_URL production
npx vercel@latest env add DB_USER production
npx vercel@latest env add DB_PASS production
npx vercel@latest env add JWT_SECRET production
npx vercel@latest env add CRON_SECRET production

$env:DB_URL = "jdbc:mysql://<host>:<port>/<database>?sslMode=REQUIRED"
$env:DB_USER = "<usuario>"
$env:DB_PASS = "<password>"
.\backend\deploy\migrate.ps1

npx vercel@latest build --prod --yes
npx vercel@latest deploy --prebuilt --prod --yes
```

Si la migracion falla, el deployment no debe continuar. El runtime productivo
usa `spring.flyway.enabled=false`, por lo que una version nueva del backend no
actualizara el esquema automaticamente.

## Verificacion

```powershell
Invoke-WebRequest https://<dominio>/

$body = @{
  email = "usuario-inexistente"
  password = "password-invalida"
} | ConvertTo-Json

Invoke-WebRequest `
  -Uri https://<dominio>/api/v1/auth/login `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

El frontend debe responder `200`. La prueba de autenticacion debe responder
`401`; ese resultado confirma que el request llego a Spring y que el backend
pudo consultar la base de datos.
