# 25 - Agricultura: Control de Plagas y Enfermedades

## Descripción
Sistema integral de detección, registro y monitoreo de plagas y enfermedades en cultivos con geoposicionamiento fotográfico y recomendaciones de tratamiento.

## Funcionalidades Principales
- Mapa interactivo del campo por lote
- Captura de fotos geolocalizadas de plagas
- Catálogo de plagas/enfermedades identificables
- Identificación asistida por IA
- Recomendaciones de tratamiento
- Registro de aplicaciones de plaguicidas
- Alertas de plagas frecuentes en zona

## Tareas
1. **Mapa del Campo**: Visualización de lotes con layer de plagas detectadas
2. **Captura de Foto Geoposicionada**: 
   - Operario abre cámara en app móvil
   - Foto se toma con GPS del teléfono automáticamente
   - Se captura: Coordenadas (lat/lon), altitud, precisión GPS
3. **Descripción Técnica**: 
   - Campo de texto libre para detalles
   - Dropdown de severidad (leve, moderada, severa)
   - Dropdown de área afectada estimada
4. **Identificación de Plaga**:
   - Análisis de imagen (IA/ML opcional)
   - Sugerencias de plagas basadas en foto
   - Catálogo búsqueda manual
5. **Recomendaciones**: 
   - Tratamientos sugeridos según plaga
   - Dosis y momento de aplicación
   - Productos autorizados
   - Período de carencia
6. **Registro de Plagas**: Historial por lote, fecha, ubicación exacta
7. **Aplicación de Tratamiento**: Registro de qué se aplicó, cuándo, dosis
8. **Reportes de Plagas**: Mapas de presión, evolución temporal, alertas

## Servicios
- `PlagaService`: CRUD de registros de plagas
- `DeteccionService`: Análisis de fotos y geolocalización
- `IdentificacionService`: Búsqueda en catálogo y ML
- `TratamientoService`: Recomendaciones y registro de aplicaciones
- `AlertaService`: Notificaciones de plagas frecuentes

## Repositorios
- `PlagaRepository`
- `RegistroPlagaRepository`
- `FotoGeolocalizadaRepository`
- `TratamientoAplicadoRepository`
- `CatalogoPlagaRepository`
- `RecomendacionRepository`

## Requisitos Técnicos

### Captura y Geolocalización
- Integración con cámara del dispositivo
- GPS activado durante captura
- Metadata EXIF: lat/lon, timestamp, altitud
- UUID para cada registro de plaga
- Compresión de imagen (max 2MB)
- Almacenamiento en S3/nube

### Identificación
- Catálogo de plagas comunes por región/cultivo
- Búsqueda por síntomas (descripciones)
- API de IA para identificación (opcional: TensorFlow, AWS Rekognition)
- Base de datos de características visuales

### API REST
- `POST /api/v1/agricultura/plagas/capturar` - Sube foto con GPS
- `GET /api/v1/agricultura/plagas/mapa/{loteId}` - Mapa con puntos de plagas
- `GET /api/v1/agricultura/plagas/{plagaId}` - Recomendaciones
- `POST /api/v1/agricultura/plagas/{plagaId}/tratamiento` - Registra aplicación
- `GET /api/v1/agricultura/plagas/reporte/{loteId}` - Historial por lote

### Datos Capturados
```json
{
  "id": "uuid",
  "loteId": "uuid",
  "foto": {
    "url": "s3://...",
    "timestamp": "2026-05-16T14:30:00Z",
    "coordenadas": {
      "latitud": -34.6037,
      "longitud": -58.3816,
      "altitud": 25,
      "precision": 5.5
    }
  },
  "descripcion": "Manchas circulares en hojas, color marrón oscuro",
  "severidad": "moderada",
  "areaAfectada": 0.25,
  "plagaIdentificada": "Mancha foliar bacteriana",
  "confianzaIdentificacion": 0.87,
  "tratamientoAplicado": {
    "producto": "Cobre fungicida",
    "dosis": "2.5 L/ha",
    "aplicadoEn": "2026-05-17T08:00:00Z"
  }
}
```

### Offline-First
- Almacenamiento local de fotos y coordenadas
- Sincronización automática al tener conexión
- Queue de fotos pendientes de subir
- Catálogo de plagas descargable para uso offline

### Disponible en
- App móvil iOS/Android
- Dashboard web para revisión y reportes

## Dependencias
- **Lotes** (Feature 01): Ubicación de plagas
- **Geolocalización** (Feature 20): Mapa y cálculos
- **Clima** (Feature 02): Condiciones favorables para plagas
- **Inventario** (Feature 15): Stock de plaguicidas
- **Reportes Agrícola** (Feature 23): Análisis de presión
- **Sincronización Offline** (Feature 24): Almacenamiento local y sync

## Integraciones Externas
- Google Maps / Mapbox (visualización)
- AWS Rekognition / Google Vision (identificación IA)
- Bases de datos de plagas (INTA, CASAFE)
- API de clima local (predicción de condiciones favorables)

## Flujo Típico del Operario

1. **En el campo**: Abre app, selecciona lote
2. **Ve mapa**: Visualiza puntos rojos de plagas previas
3. **Detecta síntomas**: Toma foto con cámara
4. **Automático**: GPS registra ubicación exacta
5. **Describe**: Escribe síntomas y severidad
6. **Sistema sugiere**: IA propone plaga
7. **Confirma**: Operario valida o selecciona otra
8. **Recomendación**: Sistema sugiere tratamiento
9. **Registra**: Sistema guarda con todas las coordenadas
10. **Aplica**: Operario registra cuando aplicó el tratamiento

## Métricas de Valor
- Detección temprana de plagas (reducir daño 20-30%)
- Reducción de uso innecesario de plaguicidas (trazabilidad)
- Mapeo de presión de plagas por sector
- Seguimiento de evolución en el tiempo
- Información para alertar a vecinos de plagas cercanas

## Notas
- **Crítico para offline**: Operarios rurales sin conexión permanente
- **Auditoría obligatoria**: Todo registro de plaguicida debe estar trazable
- **Privacidad**: Coordenadas exactas de operarios + fotos sensibles
- **Regulación**: Control de venta de plaguicidas autorizados
- **IA opcional**: Puede mejorar con feedback (foto + plaga real confirmada)

## MVP de Feature
1. Captura de foto con GPS
2. Mapa con puntos de plagas
3. Catálogo de plagas búsqueda manual
4. Descripción técnica y severidad
5. Historial por lote
6. Sincronización offline

**Identificación IA**: Para Phase 2
