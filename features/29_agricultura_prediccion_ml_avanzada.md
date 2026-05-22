# 29 - Agricultura: Prediccion ML Avanzada

## Descripcion
Evolucion del modulo de analytics agricola para reemplazar la prediccion heuristica actual por un enfoque de machine learning real, trazable y validable.

## Objetivo
Cerrar el pendiente tecnico de la Feature 03, incorporando un modelo predictivo real para estimar rendimiento futuro por lote, cultivo y temporada.

## Alcance
- Dataset de entrenamiento construido desde cosecha, siembra, clima, suelo e historico de cultivos.
- Feature engineering de variables agronomicas y climaticas.
- Entrenamiento de modelo predictivo reproducible.
- Endpoint de prediccion con explicacion basica del resultado.
- Metricas de error y confianza del modelo.
- Integracion visual en dashboard Angular.

## Tareas
1. **Dataset Unificado**: consolidar datos historicos de rendimiento, clima, suelo y manejo agronomico.
2. **Feature Engineering**: generar variables derivadas relevantes para el modelo.
3. **Modelo Predictivo Real**: implementar un modelo ML reproducible para estimar rendimiento futuro.
4. **Metricas del Modelo**: exponer MAE, RMSE, cobertura y confianza.
5. **Versionado del Modelo**: registrar metodo, version y fecha de entrenamiento.
6. **Prediccion Explicable**: mostrar factores mas influyentes o contexto de la prediccion.
7. **Dashboard de Prediccion**: integrar resultados en la vista de analytics.

## Requisitos Tecnicos
- Prediccion desacoplada del servicio de analytics tradicional.
- Pipeline reproducible de entrenamiento/evaluacion.
- Contrato REST estable para consumo web y mobile.
- Fallback seguro cuando no haya datos suficientes.

## Dependencias
- 03_agricultura_rendimiento_analytics
- 02_clima_monitoreo_e_integracion
- 00_agricultura_monitoreo_siembra_cosecha
- 01_agricultura_gestion_lotes
