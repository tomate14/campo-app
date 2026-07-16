# 49 - Dashboard Ganadero: Integrar Alertas de Potrero

## Estado
Realizada.

## Origen
Pedido del usuario (2026-07-16): la seccion "Alertas Operativas" del Dashboard Ganadero Ejecutivo (feature 42) quedo desactualizada tras la feature [47](47_COMPLETA_ganaderia_alertas_potreros.md) — las alertas georreferenciadas de potreros (tabla `alertas_potrero`) no aparecen en el dashboard, que hoy solo calcula 5 tipos de alerta al vuelo (vacunas proximas/vencidas, casos criticos abiertos, sobreocupacion de potreros, partos proximos y animales sin pesaje).

## Alcance
Agregar un sexto generador de alertas operativas en `ReporteGanaderoDashboardServiceImpl.alertasOperativas(...)`:
- Fuente: `AlertaPotreroRepository.search(null, "ABIERTA")` (solo alertas abiertas).
- Item: tipo `"Potreros"`, titulo `"Alerta en <potreroNombre>"`, detalle = observacion, `fechaGeneracion` = `createdAt` real de la alerta (a diferencia de las derivadas, esta tiene timestamp propio).
- Mapeo gravedad -> prioridad del dashboard (que solo distingue ALTA/MEDIA/BAJA): `CRITICA` y `ALTA` -> `ALTA`, `MEDIA` -> `MEDIA`, `BAJA` -> `BAJA`. Ordenadas por gravedad descendente, `limit(3)` (consistente con los limites de los otros generadores; el total ya se recorta a 8).
- Frontend: la timeline es generica y no requiere cambios estructurales, pero se agrega la regla CSS `.timeline-row.baja i` explicita (hoy BAJA caia al color por defecto de casualidad, porque ningun generador emitia BAJA).

## Fuera de alcance
- Persistir o unificar los otros 5 tipos de alerta calculados al vuelo.
- Accion "resolver" desde el dashboard (se resuelve desde los mapas de potreros, feature 47).

## Referencias Tecnicas
- `backend/src/main/java/com/campoapp/reportes/service/impl/ReporteGanaderoDashboardServiceImpl.java` (`alertasOperativas`, lineas ~323-356; `priorityRank` ALTA=3/MEDIA=2/BAJA=1).
- `backend/src/main/java/com/campoapp/ganaderia/repository/AlertaPotreroRepository.java` (`search(potreroId, estado)`).
- `backend/src/main/java/com/campoapp/reportes/dto/ReporteGanaderoDashboardResponse.java` (record `AlertaOperativa(tipo, titulo, detalle, prioridad, fechaGeneracion)`).
- `frontend/src/app/pages/reportes-ganaderia-page/reportes-ganaderia-page.component.{html,css}` (timeline `alert-panel`, clases `.timeline-row.alta/.media`).

## Implementado
- `ReporteGanaderoDashboardServiceImpl`: inyectado `AlertaPotreroRepository`; `dashboard()` carga `search(null, ESTADO_ABIERTA)` y lo pasa a `alertasOperativas(...)`, que suma el sexto generador: tipo "Potreros", titulo `"Alerta en <potreroNombre>"`, detalle = observacion, prioridad mapeada (`prioridadFromGravedad`: CRITICA/ALTA -> ALTA, MEDIA -> MEDIA, resto -> BAJA), ordenado por gravedad descendente (`gravedadRank`, CRITICA=4) y `limit(3)`. `fechaGeneracion` usa el `createdAt` real de la alerta.
- `reportes-ganaderia-page.component.css`: regla explicita `.timeline-row.baja i` (verde `#9fe870`), porque BAJA ahora puede emitirse de verdad (antes ningun generador la producia y caia al default por casualidad).
- Test nuevo `backend/src/test/java/com/campoapp/reportes/ReporteGanaderoDashboardAlertasTest.java`: dashboard completo con repos vacios (mock con default answer de colecciones vacias, simula base recien creada) + alertas abiertas stubbeadas; verifica que se consulta `search(null, "ABIERTA")`, el mapeo CRITICA->ALTA, la emision de BAJA, el titulo/detalle y que `fechaGeneracion` es el `createdAt` persistido. Segundo test: sin alertas, la seccion queda vacia.

## Validacion Tecnica
- `mvn -q compile` limpio; `ReporteGanaderoDashboardAlertasTest` 2/2 verde.
- `npm run type-check` del frontend limpio.
- Verificacion visual del dashboard pendiente: Docker Desktop no esta corriendo en el entorno (sin MySQL/backend no hay datos que renderizar). Probar manualmente: crear una alerta de potrero desde el mapa y verificar que aparece en "Alertas Operativas" con el color de su gravedad, y que al resolverla desaparece.
