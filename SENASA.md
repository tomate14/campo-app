# Integración de Campo App con SENASA / SIGSA

> Estado: investigación técnica y normativa concluida; implementación pendiente.
>
> Última verificación de fuentes: 18 de julio de 2026.
>
> Alcance: trazabilidad ganadera, identificación electrónica, SIGSA, SIGBIOtraza,
> TRI y Documento de Tránsito Electrónico (DTe).

**Estado real del producto:** Campo App no está actualmente homologada ni
conectada a SIGSA. Este documento registra la evidencia pública y el diseño
propuesto; no demuestra autorización del organismo ni completa por sí mismo la
feature de integración.

## 1. Conclusión ejecutiva

Campo App puede integrarse con SENASA, concretamente con el Sistema Integrado de
Gestión de Sanidad Animal (SIGSA), por dos vías complementarias:

1. **Integración asistida disponible hoy:** generar y validar los archivos TXT
   admitidos oficialmente por SIGSA para declarar dispositivos electrónicos,
   reidentificar animales y completar una TRI o el cierre de un DTe. El usuario
   presenta el archivo y finaliza la operación en SIGSA.
2. **Integración directa posterior:** SENASA documenta un Token/QR temporal para
   que aplicaciones externas interactúen con SIGSA, y su inventario oficial
   declara intercambio de información con entidades privadas mediante web
   services. Sin embargo, SENASA no publica en Internet el contrato técnico de
   esa integración: no se encontraron endpoints, OpenAPI/WSDL, sandbox,
   mecanismo de validación del token ni procedimiento técnico de alta.

Por lo tanto, Campo App no está bloqueada: puede construir primero el flujo
oficial basado en archivos y dejar una arquitectura preparada para sustituir el
adaptador TXT por un adaptador API cuando SENASA otorgue acceso y homologación.

Fuentes principales:

- [Gestión de Token/QR para vincular aplicaciones con SIGSA](https://www.argentina.gob.ar/sites/default/files/2026/01/gestion_de_token_para_vincular_la_app_sigbiotraza_con_sigsa.pdf)
- [Inventario oficial de sistemas de SENASA - Resolución 1417/2024](https://www.argentina.gob.ar/normativa/406814_res1417senasa_pdf/archivo)
- [Manual de uso de SIGBIOtraza](https://www.argentina.gob.ar/sites/default/files/2026/01/manual_de_uso_-_sigbiotraza.pdf)
- [Declaración de dispositivos electrónicos en SIGSA](https://www.argentina.gob.ar/sites/default/files/2026/01/declaracion_de_dispositivos_de_identificacion_electronicos_en_sigsa_.pdf)

## 2. Qué sistemas intervienen

| Sistema | Función | Relación con Campo App |
|---|---|---|
| SIGSA | Registro sanitario animal, existencias, movimientos y trámites ganaderos | Sistema oficial objetivo de la integración |
| SIGBIOtraza | Aplicación oficial para capturar lotes e identificaciones electrónicas | Referencia funcional del flujo móvil y del uso del Token/QR |
| DTe | Documento de Tránsito Electrónico | Trámite oficial de movimiento que no debe confundirse con un traslado interno entre potreros |
| TRI | Tarjeta de Registro Individual | Puede recibir identificadores electrónicos mediante el formato TXT oficial |
| RENSPA | Registro Nacional Sanitario de Productores Agropecuarios | Identifica el establecimiento/productor sobre el que se opera |

El sistema ganadero relevante es SIGSA. Otros servicios de SENASA, como
TrazaAgro para productos fitosanitarios, SIGICA/SIGCER para establecimientos
regulados o los datos abiertos estadísticos, no reemplazan una integración con
SIGSA.

## 3. Base normativa y funcional

### 3.1 Identificación electrónica obligatoria

Desde el 1 de enero de 2026, los terneros bovinos y bubalinos y los cérvidos de
criaderos comerciales alcanzados por la norma deben identificarse
electrónicamente al destete o antes del primer movimiento, lo que ocurra
primero. La declaración debe realizarse dentro de los diez días hábiles y puede
gestionarse en la oficina local, mediante autogestión SIGSA o con
SIGBIOtraza. Para declarar los dispositivos debe estar registrado previamente
el stock de terneros mediante la novedad de nacimiento o el acta de vacunación.

Fuente: [Resolución SENASA 841/2025](https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-841-2025-419696/texto).

### 3.2 Estructura del identificador electrónico

Para bovinos, el código oficial tiene 15 dígitos:

```text
032 + 01 + NNNNNNNNNN
│     │    └─ Número de Identificación Individual: 10 dígitos
│     └────── Código de especie bovina: 2 dígitos
└──────────── Código de país Argentina: 3 dígitos
```

Ejemplo sintético:

```text
032010000000000
```

Los dispositivos deben cumplir ISO 11784/11785 y operar con tecnologías
FDX-B o HDX. Los lectores trabajan a 134,2 kHz y, para el uso móvil previsto,
deben poder comunicar las lecturas por Bluetooth.

Fuente: [Resolución SENASA 530/2025](https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-530-2025-415359/texto).

### 3.3 Antecedentes de SIGSA y operadores autorizados

- La [Resolución SENASA 356/2008](https://www.argentina.gob.ar/senasa/resolucion-3562008)
  establece el marco de SIGSA y DTe.
- La [Resolución SENASA 162/2018](https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-162-2018-310129/texto)
  contempla que SENASA autorice a entidades agropecuarias u otros organismos a
  emitir DTe por autogestión con autorización expresa del productor. Esto puede
  consultarse como posible encuadre institucional, pero no equivale por sí solo
  a una habilitación API para Campo App.
- El inventario de la [Resolución SENASA 1417/2024](https://www.argentina.gob.ar/normativa/406814_res1417senasa_pdf/archivo)
  indica que SIGSA intercambia información con entidades privadas mediante web
  services. Confirma la existencia de integraciones, no un contrato público de
  libre acceso.

## 4. Token/QR de SIGSA para aplicaciones externas

El manual oficial de diciembre de 2025 describe el Token/QR como una llave de
acceso segura y temporal para que SIGBIOtraza y otras aplicaciones externas
interactúen con SIGSA.

Características documentadas:

- El titular lo genera desde SIGSA.
- Se selecciona la persona representada.
- Se asignan permisos y perfiles específicos.
- Entre los ejemplos visibles están la gestión de microchips de identificación
  y la consulta de movimientos.
- Puede entregarse como código QR o como token alfanumérico.
- El titular puede revocarlo de inmediato.
- Debe tratarse con la misma precaución que una contraseña.

Fuente: [Manual de gestión de Token/QR](https://www.argentina.gob.ar/sites/default/files/2026/01/gestion_de_token_para_vincular_la_app_sigbiotraza_con_sigsa.pdf).

### Información que SENASA todavía debe proporcionar

Antes de desarrollar el adaptador directo deben obtenerse respuestas oficiales
sobre:

- Elegibilidad y alta de una aplicación privada.
- Procedimiento de homologación.
- Registro de aplicación, `client_id` o whitelist, si correspondiera.
- Contrato OpenAPI, Swagger, WSDL u otra especificación.
- URLs de prueba/homologación y producción.
- Forma exacta de validar o intercambiar el Token/QR.
- Vigencia, renovación, expiración y revocación del token.
- Scopes disponibles para RENSPA, existencias, movimientos, RFID, TRI y DTe.
- Esquemas de request y response.
- Catálogo de errores y reglas de reintento.
- Límites de consumo y SLA.
- Garantías de idempotencia o claves de deduplicación admitidas.
- Webhooks, polling o mecanismo de conciliación.
- Requisitos de auditoría, consentimiento, seguridad y conservación de datos.

No se debe inferir este contrato observando tráfico de SIGBIOtraza ni mediante
ingeniería inversa. La conexión directa queda detrás de una feature flag hasta
recibir la documentación y homologación oficiales.

## 5. Integración asistida que puede implementarse ahora

### 5.1 Declaración de dispositivos electrónicos

Formato oficial:

```text
DISPOSITIVO-SEXO-RAZA-FECHA_NACIMIENTO;DISPOSITIVO-SEXO-RAZA-FECHA_NACIMIENTO
```

Ejemplo sintético válido como referencia de estructura:

```text
032010000000000-M-AA-08/2025;032010000000001-H-BF-08/2025
```

Reglas relevantes:

- Cada dispositivo electrónico contiene 15 dígitos.
- Debe tratarse como texto para preservar todos los ceros iniciales.
- Los campos de cada animal se separan con `-`.
- Los animales se separan con `;`.
- `M` representa macho y `H`, hembra.
- La raza debe enviarse con el código reconocido por SIGSA; por ejemplo, `AA`
  para Aberdeen Angus y `BF` para Braford.
- El formato de nacimiento mostrado por el manual es mes/año.
- El archivo no lleva el CSV interno de Campo App ni encabezados propios.

La documentación pública consultada no debe completarse con suposiciones sobre
encoding, nombre de archivo, BOM, saltos de línea o terminador final cuando el
manual no los especifique. Esos detalles deben confirmarse mediante una
importación aceptada en SIGSA o en el ambiente de homologación.

Fuente: [Manual oficial de declaración de dispositivos](https://www.argentina.gob.ar/sites/default/files/2026/01/declaracion_de_dispositivos_de_identificacion_electronicos_en_sigsa_.pdf).

### 5.2 Reidentificación

Formato oficial:

```text
DISPOSITIVO_ORIGINAL-DISPOSITIVO_NUEVO;DISPOSITIVO_ORIGINAL-DISPOSITIVO_NUEVO
```

Ejemplo sintético:

```text
AA000A001-032010000000000;AA000A002-032010000000001
```

Campo App debe conservar ambos valores y el historial del reemplazo. El
identificador anterior no debe sobrescribirse sin trazabilidad.

### 5.3 TRI y cierre del DTe

Para una TRI, los identificadores electrónicos de 15 dígitos pueden informarse
separados por espacios:

```text
032010000000000 032010000000001 032010000000002
```

En el cierre del DTe, SIGSA permite pegar identificadores o seleccionar un lote
previamente cargado mediante SIGBIOtraza.

Fuente: [Declaración de dispositivos al cierre del DTe](https://www.argentina.gob.ar/sites/default/files/2026/01/declaracion_de_dispositivos_de_identificacion_electronicos_al_cierre_del_dt-e.pdf).

### 5.4 Continuación manual en SIGSA

Incluso el flujo de la aplicación oficial SIGBIOtraza envía una planilla,
devuelve un número de planilla y requiere continuar en SIGSA para determinadas
acciones, entre ellas declarar los dispositivos, generar la TRI o cerrar el
DTe. Por eso, la primera versión de Campo App debe mostrar con claridad:

1. Archivo o planilla preparada.
2. Validaciones superadas y advertencias.
3. Acción pendiente que el usuario debe completar en SIGSA.
4. Campo para registrar número de planilla o comprobante.
5. Estado conciliado de la operación.

Fuente: [Manual de SIGBIOtraza](https://www.argentina.gob.ar/sites/default/files/2026/01/manual_de_uso_-_sigbiotraza.pdf).

## 6. DTe no equivale a un movimiento interno

El movimiento actual de animales entre potreros es una operación productiva
interna. No debe reutilizarse como si fuera un DTe.

Un DTe incluye, entre otros datos:

- RENSPA de origen y destino.
- Categorías y cantidades de animales.
- Motivo del movimiento.
- Consignatario.
- Guía asociada, cuando corresponda.
- Empresa de transporte, CUIT y conductor.
- Patentes de tractor y acoplado.
- Fechas de carga, vencimiento y llegada.
- Precintos.
- Pago, emisión y cierre.

Fuentes: [micrositio oficial DTe](https://www.argentina.gob.ar/senasa/micrositios/dt-e) y
[manual de autogestión DTe](https://www.argentina.gob.ar/sites/default/files/manual_dte_-_sigsa_-_autogestor.pdf).

Si se implementa DTe en Campo App, debe crearse una entidad y un flujo oficiales
separados de `MovimientoAnimal`.

## 7. Arquitectura recomendada

```text
Lector RFID Bluetooth
        │
        ▼
Aplicación mobile offline
        │ evento de dominio + Idempotency-Key
        ▼
Backend de Campo App
        │
        ├── Validación normativa y mapeos versionados
        ├── Cola de operaciones SENASA
        ├── Auditoría, reintentos y conciliación
        │
        ▼
SenasaGateway
        ├── TxtSenasaAdapter  → disponible sin API privada
        └── ApiSenasaAdapter  → habilitar luego de homologación
```

El mobile nunca debe almacenar credenciales permanentes de SENASA ni llamar
directamente a SIGSA. Su responsabilidad es capturar el trabajo de campo sin
conectividad y sincronizarlo con el backend de Campo App. El backend controla
el token, la seguridad, los reintentos y la conciliación.

Interfaz conceptual:

```java
public interface SenasaGateway {
    SenasaSubmissionResult submit(SenasaOperation operation);
    SenasaOperationStatus getStatus(String externalReference);
}
```

Los métodos y DTO reales no deben definirse como contrato definitivo hasta
obtener la documentación oficial de la API.

## 8. Modelo de datos propuesto

Los nombres son orientativos y deben adaptarse a las convenciones del backend.

### 8.1 Cuenta o autorización SENASA

`senasa_account`:

- `id`
- `organization_id` o productor asociado
- CUIT titular
- CUIT representado
- RENSPA asociado o relación con múltiples RENSPA
- token cifrado o referencia a un secret manager
- scopes otorgados
- fecha de creación, expiración y revocación
- estado de la autorización
- último uso confirmado

Antes de soportar varios productores debe existir explícitamente la relación
usuario/organización/productor/CUIT/RENSPA. No se debe asumir que el usuario de
login representa por sí solo a un único establecimiento.

### 8.2 Identidad oficial del animal

Conviene conservar de manera separada:

- Caravana o identificación interna.
- CUIG o identificador legado, cuando corresponda.
- Identificador electrónico oficial de 15 dígitos.
- Tipo y tecnología del dispositivo.
- Fecha de aplicación.
- Estado de declaración ante SIGSA.
- Número de planilla o confirmación.
- Historial de reidentificaciones.

No se debe eliminar la identificación histórica ni forzar una migración
destructiva de animales legados.

### 8.3 Mapeos normativos versionados

`senasa_breed_mapping` o catálogo equivalente:

- Código interno de raza.
- Código admitido por SIGSA.
- Fecha de vigencia desde/hasta.
- Versión de la fuente normativa.
- Estado activo/inactivo.

Ejemplo:

```text
ABERDEEN_ANGUS → AA
BRAFORD         → BF
```

No debe reemplazarse el código de negocio interno por el código SENASA. Se
mantiene un mapeo explícito para poder versionarlo cuando cambie el catálogo.

### 8.4 Operación SENASA

`senasa_operation` debería registrar:

- Tipo de operación.
- CUIT representado y RENSPA.
- Animales o lote involucrado.
- Payload generado y versión de esquema.
- Hash del contenido para deduplicación.
- Estado interno.
- Referencia externa o número de planilla.
- Cantidad de intentos.
- Último error y respuesta sanitizada.
- Usuario creador y timestamps de auditoría.

Estados sugeridos:

```text
DRAFT → READY → SUBMITTED → PENDING_CONFIRMATION → ACCEPTED
                                                ├→ REJECTED
                                                └→ REQUIRES_ACTION
```

Campo App debe aplicar su propia deduplicación y conciliación. No se puede
suponer que SIGSA ofrece idempotencia hasta que SENASA lo confirme. Una pérdida
de conexión después de enviar debe quedar en `PENDING_CONFIRMATION` o un estado
equivalente: primero se consulta o concilia el resultado y nunca se reenvía a
ciegas una operación potencialmente aceptada.

## 9. Validaciones mínimas del MVP

- Identificador electrónico numérico de exactamente 15 dígitos.
- Prefijo de país y especie válido para el alcance bovino (`03201`).
- Ausencia de duplicados dentro del archivo y en el establecimiento.
- Sexo convertido al código SIGSA permitido.
- Raza con mapeo SENASA vigente.
- Fecha de nacimiento en el formato requerido.
- RENSPA seleccionado y perteneciente a la representación activa.
- Stock/nacimiento previamente declarado cuando la normativa lo exija.
- Motivo y fecha de aplicación presentes.
- Dispositivo original presente para una reidentificación.
- Archivo TXT construido con separadores y codificación verificados.
- Bloqueo de envío si existe un error; advertencia explícita si falta una
  confirmación que debe completarse manualmente en SIGSA.

Estas validaciones deben tener tests unitarios con casos aceptados, rechazados,
duplicados y límites de formato.

## 10. Seguridad y protección de credenciales

- Nunca solicitar, almacenar ni registrar la Clave Fiscal del productor.
- El ingreso en ARCA/SIGSA y la delegación deben realizarlos el usuario en los
  canales oficiales.
- Cifrar el Token/QR en reposo mediante KMS, Vault o cifrado autenticado como
  AES-GCM con gestión segura de claves.
- Nunca mostrar el token completo después de su carga inicial.
- Redactar tokens, QR, CUIT sensibles y respuestas en logs, trazas y telemetría.
- Nunca enviar el Token/QR al mobile ni incluirlo en una respuesta de API.
- Aplicar mínimo privilegio por scope y por RENSPA.
- Registrar consentimiento explícito del titular y quién vinculó la cuenta.
- Permitir desvincular la cuenta y reflejar una revocación de SIGSA.
- Implementar rotación/expiración sin perder el historial de operaciones.
- Confirmar la vigencia real del token: su carácter temporal puede impedir una
  sincronización desatendida si SENASA no ofrece renovación apropiada.
- Limitar acceso administrativo y auditar toda lectura o uso de la credencial.
- No automatizar pantallas de ARCA, no resolver CAPTCHAs y no realizar scraping
  de portales oficiales como sustituto de una API autorizada.

La Clave Fiscal es personal e intransferible; los terceros deben operar mediante
delegación y su propia credencial. Véanse las
[preguntas frecuentes de DTe](https://www.argentina.gob.ar/senasa/micrositios/dt-e/preguntas-frecuentes)
y los [consejos de seguridad de ARCA](https://www.arca.gob.ar/clavefiscal/ayuda/Consejos-de-seguridad.asp).

## 11. Situación actual del repositorio

### 11.1 Exportación denominada SENASA

El controlador
[`TrazabilidadAnimalController.java`](backend/src/main/java/com/campoapp/ganaderia/controller/TrazabilidadAnimalController.java)
expone actualmente `/export/senasa`.

La implementación en
[`AnimalServiceImpl.java`](backend/src/main/java/com/campoapp/ganaderia/service/impl/AnimalServiceImpl.java)
genera un CSV con columnas internas similares a:

```text
caravana,rfid,qr,raza,sexo,estado,potrero_actual,...
```

Ese archivo no coincide con los formatos de importación oficiales de SIGSA.
Antes de agregar la nueva integración debe renombrarse en API y UI como
"exportación de trazabilidad interna" o una denominación equivalente. El nuevo
exportador SENASA debe generar los TXT específicos descriptos en este documento.

### 11.2 Entidad Animal

[`Animal.java`](backend/src/main/java/com/campoapp/ganaderia/entity/Animal.java)
posee caravana, RFID y QR, pero el modelo debe distinguir el RFID de uso interno
del identificador electrónico oficial y agregar, directa o relacionalmente:

- Semántica y validación del código oficial de 15 dígitos.
- Fecha de aplicación.
- Código de raza SENASA.
- Estado de declaración.
- Número de planilla/comprobante.
- Historial de reidentificación.

Los datos mock actuales contienen valores como `RFID-1257`. Por lo tanto, no se
debe aplicar retroactivamente la validación oficial de 15 dígitos sobre
`rfidCodigo`; corresponde crear un campo o entidad de identidad oficial
separada y migrar únicamente datos cuya naturaleza haya sido confirmada.

### 11.3 Usuario, productor y RENSPA

[`User.java`](backend/src/main/java/com/campoapp/auth/entity/User.java) modela el
usuario de la aplicación, pero no una representación de productor, CUIT y
RENSPA. Esta relación debe resolverse antes de habilitar múltiples productores
o almacenar autorizaciones SIGSA.

### 11.4 Movimiento interno y DTe

El modelo de movimiento ganadero actual representa movimientos dentro del
establecimiento. Debe permanecer separado del futuro modelo de DTe oficial.

### 11.5 Sincronización offline

[`syncUp.ts`](mobile/shared/sync/syncUp.ts) ya utiliza una cola FIFO e
`Idempotency-Key`. Es una buena base para la captura offline de lecturas RFID,
pero la operación sincronizada debe crear un evento en Campo App; no debe
enviar directamente el trámite a SENASA desde el dispositivo.

### 11.6 Feature existente

El alcance inicial ya está registrado en
[`features/30_ganaderia_integracion_senasa_rfid_offline.md`](features/30_ganaderia_integracion_senasa_rfid_offline.md).
Antes de implementar se debe revisar esa feature contra este documento y
actualizar su alcance si la definición funcional cambió.

## 12. Plan de implementación recomendado

### Fase 0: alta institucional y definición de alcance

- Enviar la solicitud técnica a SENASA.
- Confirmar si Campo App puede homologarse como aplicación privada.
- Definir un productor y RENSPA piloto con consentimiento expreso.
- Acordar qué operaciones están autorizadas; no asumir creación o cierre
  automático de DTe.
- Mantener el flujo TXT como fallback incluso después de habilitar una API.

### Fase 1: preparación del dominio

- Separar la exportación interna del concepto SENASA.
- Modelar productor/organización, CUIT representado y RENSPA.
- Modelar identidad electrónica oficial e historial de reidentificación.
- Crear catálogos versionados de raza, sexo y formatos.
- Crear la entidad de operación SENASA y su auditoría.

### Fase 2: MVP asistido

- Integrar lector RFID Bluetooth en mobile.
- Permitir captura offline y sincronización idempotente.
- Agregar validaciones oficiales.
- Generar TXT de declaración de dispositivos.
- Generar TXT de reidentificación.
- Generar TXT para TRI/cierre de DTe.
- Permitir compartir/descargar el archivo.
- Mostrar instrucciones para continuar en SIGSA.
- Registrar manualmente número de planilla, aceptación o rechazo.
- Incorporar tests de formato y documentación de usuario.
- Verificar al menos una importación real aceptada por SIGSA antes de declarar
  cada exportador listo para producción.

### Fase 3: gestión de autorización

- Pantalla backend/web para vincular Token/QR.
- Cifrado y control por scopes.
- Asociación a CUIT representado y RENSPA.
- Revocación, expiración y auditoría.
- Feature flag para cualquier llamada directa.

Esta fase puede preparar el almacenamiento seguro, pero no debe prometer una
conexión directa hasta conocer el protocolo oficial del token.

### Fase 4: API directa homologada

- Implementar `ApiSenasaAdapter` con el contrato provisto por SENASA.
- Conectar la cola de operaciones.
- Implementar reintentos únicamente para errores recuperables.
- Conciliar estados y referencias externas.
- Probar en homologación con un RENSPA piloto.
- Realizar revisión de seguridad y protección de datos.
- Habilitar producción gradualmente mediante feature flag.

### Estrategia de pruebas y aceptación

- Golden files para declaración, reidentificación y TRI; una modificación no
  intencional de bytes debe hacer fallar el test.
- Casos de 14, 15 y 16 dígitos, caracteres no numéricos y ceros iniciales.
- Duplicados dentro del lote y contra identificadores existentes.
- Sexo, raza y fecha válidos, ausentes y sin mapeo vigente.
- Animales legados con caravana, CUIG o RFID interno no oficial.
- Aislamiento estricto entre productores, CUIT representados y RENSPA.
- Verificación automática de que tokens y QR no aparecen en logs ni responses.
- Reinicio del backend, pérdida de red, timeout después del envío, respuesta
  perdida, reintento y revocación durante una operación.
- Pruebas físicas con lectores ISO 11784/11785 FDX-B/HDX y Bluetooth.
- Importación aceptada en SIGSA/homologación como criterio final; que el archivo
  coincida con un ejemplo local no alcanza.

## 13. Contacto con SENASA

Canales publicados para identificación electrónica y SIGSA:

- `desycg@senasa.gob.ar`
- `hacelafacil@senasa.gob.ar`
- [Mesa de ayuda SIGSA](https://www.argentina.gob.ar/senasa/mesa-de-ayuda-sistema-integrado-de-gestion-de-sanidad-animal-sigsa)
- Dirección de Tecnología de la Información: `+54 11 4121-5203 / 5266`, según el
  [directorio oficial](https://www.argentina.gob.ar/senasa/que-es/funcionarios)

### Correo sugerido

Asunto:

```text
Solicitud de documentación y alta de integración SIGSA por Token/QR - Campo App
```

Cuerpo:

```text
Somos [razón social/CUIT] y desarrollamos Campo App para productores con RENSPA.

El manual "Gestión de Token/QR", publicado por SENASA, indica que el token
permite a aplicaciones externas interactuar con SIGSA.

Solicitamos confirmar:

1. Si se habilitan aplicaciones privadas y el proceso de alta/homologación.
2. Documentación API y URLs de homologación y producción.
3. Requisitos de registro, client_id o whitelist de la aplicación.
4. Mecanismo de validación, vigencia, renovación y revocación del Token/QR.
5. Scopes para consultar RENSPA, existencias y movimientos, declarar RFID,
   generar TRI y participar del cierre del DTe.
6. Reglas de idempotencia, límites, auditoría, SLA y catálogo de errores.
7. Condiciones de tratamiento, conservación y eliminación de datos.

Campo App no almacenará Clave Fiscal ni automatizará el acceso de ARCA. La
solución utilizará consentimiento explícito, permisos mínimos, cifrado y
trazabilidad completa.

Empresa/CUIT: [...]
RENSPA piloto: [...]
Volumen estimado: [...]
Responsable técnico: [...]
```

Si los canales técnicos no responden, puede formalizarse la solicitud mediante
[TAD](https://www.argentina.gob.ar/tad) o mediante el procedimiento de
[acceso a información pública de SENASA](https://www.argentina.gob.ar/senasa/transparencia/pedirinformacion).

## 14. Vías investigadas que no sustituyen SIGSA

### TrazaAgro

TrazaAgro dispone de una API REST documentada, pero corresponde a la
trazabilidad de productos fitosanitarios y su cadena comercial. Sus endpoints y
credenciales no sirven para registrar animales, dispositivos RFID, TRI o DTe.

Fuente: [sistema de trazabilidad de productos fitosanitarios](https://www.argentina.gob.ar/senasa/nuevo-sistema-de-trazabilidad-de-productos/fitosanitarios).

### Datos abiertos

Los datasets públicos de existencias y movimientos bovinos son estadísticos o
agregados. Pueden servir para analítica con fecha y fuente visibles, pero no
permiten consultar ni actualizar el stock privado de un productor en tiempo
real.

- [Registros y datos abiertos de SENASA](https://www.argentina.gob.ar/senasa/registros-y-datos-abiertos)
- [Dataset de existencias bovinas](https://www.datos.gob.ar/dataset/agroindustria-senasa---existencias-bovinos)
- [Dataset de movimientos bovinos](https://datos.gob.ar/dataset/agroindustria-senasa---movimientos-bovinos)

### Consultas web y CAPTCHA

Las consultas públicas de establecimientos o RENSPA son interfaces para uso
humano y pueden incorporar CAPTCHA. No deben automatizarse ni usarse como API.

### ARCA y WSAA

ARCA sirve como identidad y mecanismo de delegación. WSAA otorga acceso a cada
web service que haya sido previamente publicado y autorizado; no transforma a
SIGSA en una API OAuth ni concede acceso implícito a sus operaciones.

### INTEROPER.AR, SIGICA y SIGCER

- INTEROPER.AR está orientado a organismos del sector público y nodos
  autorizados, no a un SaaS privado de alta automática.
- SIGICA y SIGCER atienden circuitos específicos de establecimientos regulados,
  frigoríficos y certificación. No son la API ganadera general de SIGSA.

### Intercambio de polígonos RENSPA

La Resolución 1332/2024 contempla un web service acotado para compartir
polígonos de establecimientos con entidades admitidas en esquemas de
diferenciación, consentimiento del productor y objetivos como trazabilidad
EUDR. No es una API general para animales, existencias o DTe.

Fuente: [Resolución SENASA 1332/2024](https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-1332-2024-406008/texto).

## 15. Checklist previa a producción

- [ ] SENASA confirmó por escrito la elegibilidad de Campo App.
- [ ] Se recibió contrato técnico oficial y versionado.
- [ ] Se dispone de ambiente de homologación.
- [ ] Existe un RENSPA piloto y consentimiento del titular.
- [ ] Clave Fiscal completamente fuera de Campo App.
- [ ] Token cifrado, redactado en logs y revocable.
- [ ] Scopes mínimos y representación verificados.
- [ ] Mapeos de raza/sexo/versiones validados con SENASA.
- [ ] Casos de error, reintento e idempotencia documentados.
- [ ] Conciliación y auditoría probadas.
- [ ] Flujo offline probado sin duplicar presentaciones.
- [ ] DTe separado de movimientos internos.
- [ ] Revisión legal y de protección de datos concluida.
- [ ] Feature flag y mecanismo de rollback disponibles.

## 16. Mantenimiento de este documento

Los reglamentos, manuales, catálogos y mecanismos de acceso pueden cambiar.
Antes de iniciar la implementación o habilitar producción se debe:

1. Reabrir todas las fuentes oficiales enlazadas.
2. Confirmar que las resoluciones continúan vigentes.
3. Descargar la última versión de los manuales de Token/QR, SIGBIOtraza y TXT.
4. Comparar códigos de raza, sexo y estructura de archivos.
5. Registrar en este documento la fecha de la nueva verificación.
6. No copiar ejemplos con errores tipográficos del manual sin contrastarlos con
   la especificación textual y una prueba en homologación.

Este documento describe la estrategia y la evidencia pública disponible. No es
una credencial, una autorización de SENASA ni un sustituto del contrato técnico
que el organismo entregue para la integración directa.
