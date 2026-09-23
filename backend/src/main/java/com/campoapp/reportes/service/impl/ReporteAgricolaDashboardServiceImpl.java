package com.campoapp.reportes.service.impl;

import com.campoapp.agricultura.dto.insumos.InsumoAgricolaResponse;
import com.campoapp.agricultura.dto.insumos.InsumosDashboardResponse;
import com.campoapp.agricultura.dto.insumos.StockInsumoResponse;
import com.campoapp.agricultura.entity.EventoSiembra;
import com.campoapp.agricultura.entity.HistoricoCultivo;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.RegistroCosecha;
import com.campoapp.agricultura.entity.insumos.MovimientoInsumoAgricola;
import com.campoapp.agricultura.entity.insumos.TipoMovimientoInsumo;
import com.campoapp.agricultura.entity.plagas.DeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.EstadoDeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.EstadoOrdenAplicacion;
import com.campoapp.agricultura.entity.plagas.OrdenAplicacion;
import com.campoapp.agricultura.entity.plagas.OrdenAplicacionNumero;
import com.campoapp.agricultura.entity.plagas.SeguimientoPlaga;
import com.campoapp.agricultura.repository.EventoSiembraRepository;
import com.campoapp.agricultura.repository.HistoricoCultivoRepository;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.RegistroCosechaRepository;
import com.campoapp.agricultura.repository.insumos.MovimientoInsumoAgricolaRepository;
import com.campoapp.agricultura.repository.plagas.DeteccionPlagaRepository;
import com.campoapp.agricultura.repository.plagas.OrdenAplicacionNumeroRepository;
import com.campoapp.agricultura.repository.plagas.OrdenAplicacionRepository;
import com.campoapp.agricultura.repository.plagas.SeguimientoPlagaRepository;
import com.campoapp.agricultura.service.InsumoService;
import com.campoapp.clima.entity.AlertaClima;
import com.campoapp.clima.repository.AlertaClimaRepository;
import com.campoapp.clima.repository.PrecipitacionDiariaRepository;
import com.campoapp.finanzas.entity.CompraProveedor;
import com.campoapp.finanzas.repository.CompraProveedorRepository;
import com.campoapp.maquinaria.entity.MantenimientoProgramado;
import com.campoapp.maquinaria.repository.MantenimientoProgramadoRepository;
import com.campoapp.operarios.repository.OperarioRepository;
import com.campoapp.operarios.service.OrdenTrabajoService;
import com.campoapp.reportes.dto.ReporteAgricolaDashboardResponse;
import com.campoapp.reportes.dto.ReporteCostosAgricolaResponse;
import com.campoapp.reportes.dto.ReporteGestionAgricolaResponse;
import com.campoapp.reportes.service.ReporteAgricolaDashboardService;
import com.campoapp.utilidades.service.CatalogoUtilidadRegistry;
import com.campoapp.utilidades.service.UtilidadNombreResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Year;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ReporteAgricolaDashboardServiceImpl implements ReporteAgricolaDashboardService {
    private static final List<EstadoDeteccionPlaga> ESTADOS_ACTIVOS = List.of(EstadoDeteccionPlaga.ABIERTA, EstadoDeteccionPlaga.EN_TRATAMIENTO);
    private static final int PRECIPITACION_DIAS_FALLBACK = 14;

    private final LoteRepository loteRepository;
    private final RegistroCosechaRepository cosechaRepository;
    private final HistoricoCultivoRepository historicoRepository;
    private final EventoSiembraRepository eventoRepository;
    private final DeteccionPlagaRepository deteccionRepository;
    private final SeguimientoPlagaRepository seguimientoRepository;
    private final PrecipitacionDiariaRepository precipitacionDiariaRepository;
    private final MantenimientoProgramadoRepository mantenimientoRepository;
    private final UtilidadNombreResolver utilidadNombreResolver;
    // Feature 84: dependencias del modelo de costos y de la gestion.
    private final MovimientoInsumoAgricolaRepository movimientoInsumoRepository;
    private final CompraProveedorRepository compraRepository;
    private final OrdenAplicacionRepository ordenAplicacionRepository;
    private final OrdenAplicacionNumeroRepository ordenNumeroRepository;
    private final OperarioRepository operarioRepository;
    private final AlertaClimaRepository alertaClimaRepository;
    private final InsumoService insumoService;
    private final OrdenTrabajoService ordenTrabajoService;

    private static final List<TipoMovimientoInsumo> TIPOS_SALIDA = List.of(TipoMovimientoInsumo.SALIDA, TipoMovimientoInsumo.USO);
    private static final Locale ES_AR = Locale.forLanguageTag("es-AR");

    @Override
    @Transactional(readOnly = true)
    public ReporteAgricolaDashboardResponse dashboard() {
        List<Lote> lotes = loteRepository.findAllActive();
        List<RegistroCosecha> cosechas = cosechaRepository.findAllActive();
        List<HistoricoCultivo> historicos = historicoRepository.findAllActive();
        List<EventoSiembra> eventos = eventoRepository.findAllActive();
        List<DeteccionPlaga> detecciones = deteccionRepository.findAllActive();
        List<SeguimientoPlaga> seguimientos = seguimientoRepository.findAllActive();
        List<MantenimientoProgramado> mantenimientos = mantenimientoRepository.findFiltered(null, null);

        Map<String, List<DeteccionPlaga>> deteccionesPorLote = detecciones.stream().collect(Collectors.groupingBy(d -> d.getLote().getId()));
        Map<String, List<SeguimientoPlaga>> seguimientosPorDeteccion = seguimientos.stream().collect(Collectors.groupingBy(s -> s.getDeteccion().getId()));
        Map<String, SaludLote> saludPorLote = calcularSaludPorLote(lotes, deteccionesPorLote);

        String campania = lotes.stream().map(Lote::getTemporada).filter(Objects::nonNull).findFirst().orElse(String.valueOf(Year.now().getValue()));
        BigDecimal hectareas = lotes.stream().map(Lote::getArea).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        long alertasActivas = contarAlertasActivas(detecciones, eventos, mantenimientos);
        long monitoreoPendiente = contarMonitoreoPendiente(detecciones, seguimientosPorDeteccion);
        BigDecimal saludPromedio = promedioSalud(saludPorLote.values());
        PrecipitacionData precipitaciones = precipitacionesAcumuladas(lotes);
        RendimientoData rendimiento = rendimiento(cosechas, historicos);

        return new ReporteAgricolaDashboardResponse(
                campania,
                LocalDateTime.now(),
                List.of(
                        kpi("HECTAREAS_PRODUCCION", "Hectáreas en producción", formatHa(hectareas), lotes.size() + " lotes activos", "green", hectareas, List.of()),
                        kpi("RENDIMIENTO_PROYECTADO", "Rendimiento actual cosechado", rendimiento.actualTnHa() == null ? null : rendimiento.actualTnHa() + " tn/ha", "Promedio de cosechas del año actual", "green", rendimiento.actualTnHa(), rendimiento.actualSerie()),
                        kpi("ALERTAS_ACTIVAS", "Alertas activas", String.valueOf(alertasActivas), "Agricultura y maquinaria", "red", BigDecimal.valueOf(alertasActivas), List.of()),
                        kpi("LOTES_MONITOREO_PENDIENTE", "Lotes con monitoreo pendiente", String.valueOf(monitoreoPendiente), "Detecciones sin seguimiento últimos 10 días", "blue", BigDecimal.valueOf(monitoreoPendiente), List.of()),
                        kpi("INDICE_SALUD_CULTIVOS", "Índice de salud de cultivos", formatPct(saludPromedio), "Promedio de lotes activos", "green", saludPromedio, List.of()),
                        kpi("PRECIPITACION_ACUMULADA", "Precipitación acumulada", precipitaciones == null ? null : formatNumber(precipitaciones.promedioMm()) + " mm", precipitaciones == null ? "Sin datos disponibles" : "Últimos " + PRECIPITACION_DIAS_FALLBACK + " días · " + precipitaciones.lotesConsiderados() + " lotes", "blue", precipitaciones == null ? null : precipitaciones.promedioMm(), List.of()),
                        kpi("COSTO_HECTAREA", "Costo por hectárea", null, "Sin datos disponibles", "purple", null, List.of()),
                        kpi("MARGEN_BRUTO_PROYECTADO", "Margen bruto proyectado", null, "Sin datos disponibles", "green", null, List.of())
                ),
                estadosFenologicos(eventos),
                new ReporteAgricolaDashboardResponse.RendimientoComparativo(rendimiento.actualTnHa(), rendimiento.historicoTnHa(), rendimiento.actualSerie(), rendimiento.historicoSerie()),
                distribucion(lotes),
                lotesMapa(lotes, saludPorLote),
                List.of(),
                alertasRecientes(detecciones, eventos, mantenimientos),
                tareasRecomendadas(eventos, detecciones, mantenimientos),
                resumenCosecha(cosechas)
        );
    }

    // ===================== Feature 84 - Parte 1: costos =====================

    @Override
    @Transactional(readOnly = true)
    public ReporteCostosAgricolaResponse costos(LocalDate desde, LocalDate hasta, List<String> loteIds, List<String> cultivos) {
        LocalDate hoy = LocalDate.now();
        LocalDate h0 = hasta != null ? hasta : hoy;
        LocalDate d0 = desde != null ? desde : h0.minusYears(1);
        // Se normaliza el rango (por si viene invertido) en variables finales para usar en lambdas.
        final LocalDate desdeFinal = d0.isAfter(h0) ? h0 : d0;
        final LocalDate hastaFinal = d0.isAfter(h0) ? d0 : h0;
        LocalDateTime desdeTs = desdeFinal.atStartOfDay();
        LocalDateTime hastaTs = hastaFinal.atTime(LocalTime.MAX);

        Set<String> loteFilter = toSet(loteIds);
        Set<String> cultivoFilter = toSet(cultivos);
        List<Lote> lotes = loteRepository.findAllActive().stream()
                .filter(l -> loteFilter.isEmpty() || loteFilter.contains(l.getId()))
                .filter(l -> cultivoFilter.isEmpty() || cultivoFilter.contains(normalize(l.getCultivo())) || (l.getCultivo() != null && cultivoFilter.contains(l.getCultivo())))
                .toList();
        List<String> loteIdList = lotes.stream().map(Lote::getId).toList();
        Map<String, Lote> lotePorId = lotes.stream().collect(Collectors.toMap(Lote::getId, Function.identity(), (a, b) -> a));

        // (A) Costo de insumos aplicados por lote (movimientos SALIDA/USO en el periodo).
        Map<String, BigDecimal> costoInsumosPorLote = new HashMap<>();
        List<MovimientoInsumoAgricola> movimientos = loteIdList.isEmpty() ? List.of()
                : movimientoInsumoRepository.findSalidasPorLotesYRango(TIPOS_SALIDA, loteIdList, desdeTs, hastaTs);
        Set<String> insumosSinPrecio = new TreeSet<>();
        for (MovimientoInsumoAgricola m : movimientos) {
            if (m.getLote() == null) continue;
            BigDecimal costoUnitario = m.getCostoUnitario();
            BigDecimal cantidad = m.getCantidad() == null ? BigDecimal.ZERO : m.getCantidad();
            BigDecimal aporte = costoUnitario == null ? BigDecimal.ZERO : costoUnitario.multiply(cantidad);
            costoInsumosPorLote.merge(m.getLote().getId(), aporte, BigDecimal::add);
            if (costoUnitario == null && m.getInsumo() != null) {
                insumosSinPrecio.add(m.getInsumo().getNombre());
            }
        }

        // (B) Costo de comprobantes atribuidos por lote (prorrateo por hectarea).
        Map<String, BigDecimal> costoComprobantesPorLote = new HashMap<>();
        Map<String, BigDecimal> montoPorTipoComprobante = new LinkedHashMap<>();
        Map<YearMonth, BigDecimal> comprobantesPorMes = new HashMap<>();
        List<CompraProveedor> compras = loteIdList.isEmpty() ? List.of()
                : compraRepository.findConLoteEnRango(desdeFinal, hastaFinal, loteIdList);
        for (CompraProveedor compra : compras) {
            BigDecimal totalCompra = compra.getTotal() == null ? BigDecimal.ZERO : compra.getTotal();
            BigDecimal areaTotalCompra = compra.getLotes().stream()
                    .map(Lote::getArea).filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (areaTotalCompra.signum() == 0) continue;
            String tipo = compra.getTipoComprobante() == null ? "OTRO" : compra.getTipoComprobante().name();
            YearMonth mes = YearMonth.from(compra.getFechaEmision());
            for (Lote lote : compra.getLotes()) {
                if (!lotePorId.containsKey(lote.getId())) continue;
                BigDecimal area = lote.getArea() == null ? BigDecimal.ZERO : lote.getArea();
                BigDecimal atribuido = totalCompra.multiply(area).divide(areaTotalCompra, 2, RoundingMode.HALF_UP);
                costoComprobantesPorLote.merge(lote.getId(), atribuido, BigDecimal::add);
                montoPorTipoComprobante.merge(tipo, atribuido, BigDecimal::add);
                comprobantesPorMes.merge(mes, atribuido, BigDecimal::add);
            }
        }

        // Totales por lote y del conjunto.
        BigDecimal costoInsumos = sum(costoInsumosPorLote.values());
        BigDecimal costoComprobantes = sum(costoComprobantesPorLote.values());
        BigDecimal costoTotal = costoInsumos.add(costoComprobantes);
        BigDecimal hectareas = lotes.stream().map(Lote::getArea).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal costoHectarea = safeDivide(costoTotal, hectareas);

        // Toneladas cosechadas en el periodo (para costo/tonelada).
        List<RegistroCosecha> cosechasLotes = cosechaRepository.findAllActive().stream()
                .filter(c -> c.getLote() != null && lotePorId.containsKey(c.getLote().getId()))
                .toList();
        BigDecimal toneladas = cosechasLotes.stream()
                .filter(c -> c.getFecha() != null && !c.getFecha().isBefore(desdeFinal) && !c.getFecha().isAfter(hastaFinal))
                .map(RegistroCosecha::getToneladasTotal).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal costoPorTonelada = toneladas.signum() == 0 ? null : costoTotal.divide(toneladas, 2, RoundingMode.HALF_UP);

        // Salud por lote (para el mapa y el indice de salud), respetando el filtro.
        List<DeteccionPlaga> detecciones = deteccionRepository.findAllActive().stream()
                .filter(d -> d.getLote() != null && lotePorId.containsKey(d.getLote().getId()))
                .toList();
        Map<String, List<DeteccionPlaga>> deteccionesPorLote = detecciones.stream().collect(Collectors.groupingBy(d -> d.getLote().getId()));
        Map<String, SaludLote> saludPorLote = calcularSaludPorLote(lotes, deteccionesPorLote);

        ReporteCostosAgricolaResponse.Kpis kpis = new ReporteCostosAgricolaResponse.Kpis(
                scale2(costoTotal),
                scale2(costoHectarea),
                scale2(costoInsumos),
                porcentaje(costoInsumos, costoTotal),
                scale2(costoComprobantes),
                porcentaje(costoComprobantes, costoTotal),
                costoPorTonelada,
                scale2(toneladas),
                scale2(hectareas),
                lotes.size());

        // Ranking $/ha por lote (desc).
        List<ReporteCostosAgricolaResponse.RankingLote> ranking = lotes.stream()
                .map(l -> {
                    BigDecimal total = costoInsumosPorLote.getOrDefault(l.getId(), BigDecimal.ZERO)
                            .add(costoComprobantesPorLote.getOrDefault(l.getId(), BigDecimal.ZERO));
                    BigDecimal costoHa = safeDivide(total, l.getArea());
                    return new ReporteCostosAgricolaResponse.RankingLote(l.getId(), l.getNombre(), scale2(costoHa), scale2(total));
                })
                .sorted(Comparator.comparing(ReporteCostosAgricolaResponse.RankingLote::costoHa, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        // Composicion del costo: insumos + un item por tipo de comprobante presente.
        List<ReporteCostosAgricolaResponse.ComposicionCosto> composicion = new ArrayList<>();
        composicion.add(new ReporteCostosAgricolaResponse.ComposicionCosto("Insumos aplicados", scale2(costoInsumos), porcentaje(costoInsumos, costoTotal)));
        montoPorTipoComprobante.forEach((tipo, monto) ->
                composicion.add(new ReporteCostosAgricolaResponse.ComposicionCosto(tipo, scale2(monto), porcentaje(monto, costoTotal))));

        // Evolucion mensual del costo (insumos por mes de fecha + comprobantes por mes de emision).
        Map<YearMonth, BigDecimal> costoPorMes = new TreeMap<>();
        for (MovimientoInsumoAgricola m : movimientos) {
            if (m.getFecha() == null) continue;
            BigDecimal aporte = m.getCostoUnitario() == null ? BigDecimal.ZERO
                    : m.getCostoUnitario().multiply(m.getCantidad() == null ? BigDecimal.ZERO : m.getCantidad());
            costoPorMes.merge(YearMonth.from(m.getFecha()), aporte, BigDecimal::add);
        }
        comprobantesPorMes.forEach((mes, monto) -> costoPorMes.merge(mes, monto, BigDecimal::add));
        List<ReporteAgricolaDashboardResponse.SeriePunto> evolucionMensual = new ArrayList<>();
        YearMonth cursor = YearMonth.from(desdeFinal);
        YearMonth fin = YearMonth.from(hastaFinal);
        while (!cursor.isAfter(fin)) {
            BigDecimal valor = costoPorMes.getOrDefault(cursor, BigDecimal.ZERO);
            evolucionMensual.add(new ReporteAgricolaDashboardResponse.SeriePunto(etiquetaMes(cursor), scale2(valor)));
            cursor = cursor.plusMonths(1);
        }

        // Costo/ha por cultivo.
        Map<String, String> cultivosNombres = utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.CULTIVO, lotes.stream().map(Lote::getCultivo).toList());
        Map<String, List<Lote>> lotesPorCultivo = lotes.stream().collect(Collectors.groupingBy(l -> normalize(l.getCultivo())));
        List<ReporteCostosAgricolaResponse.CostoCultivo> costoPorCultivo = lotesPorCultivo.entrySet().stream()
                .map(e -> {
                    BigDecimal total = e.getValue().stream()
                            .map(l -> costoInsumosPorLote.getOrDefault(l.getId(), BigDecimal.ZERO).add(costoComprobantesPorLote.getOrDefault(l.getId(), BigDecimal.ZERO)))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal area = e.getValue().stream().map(Lote::getArea).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new ReporteCostosAgricolaResponse.CostoCultivo(utilidadNombreResolver.resolver(e.getKey(), cultivosNombres), scale2(safeDivide(total, area)));
                })
                .sorted(Comparator.comparing(ReporteCostosAgricolaResponse.CostoCultivo::costoHa, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        // Mapa de lotes con salud + costo/ha.
        List<ReporteCostosAgricolaResponse.LoteCostoMapa> lotesMapa = lotes.stream()
                .filter(l -> l.getPoligono() != null && !l.getPoligono().isBlank())
                .map(l -> {
                    SaludLote salud = saludPorLote.get(l.getId());
                    BigDecimal total = costoInsumosPorLote.getOrDefault(l.getId(), BigDecimal.ZERO).add(costoComprobantesPorLote.getOrDefault(l.getId(), BigDecimal.ZERO));
                    return new ReporteCostosAgricolaResponse.LoteCostoMapa(
                            l.getId(), l.getNombre(),
                            utilidadNombreResolver.resolver(l.getCultivo(), cultivosNombres),
                            l.getArea(), l.getPoligono(),
                            salud == null ? null : salud.label(),
                            salud == null ? null : salud.color(),
                            scale2(safeDivide(total, l.getArea())));
                })
                .toList();

        // Contexto productivo (respeta el filtro).
        List<HistoricoCultivo> historicos = historicoRepository.findAllActive().stream()
                .filter(h -> h.getLote() != null && lotePorId.containsKey(h.getLote().getId()))
                .toList();
        List<EventoSiembra> eventos = eventoRepository.findAllActive().stream()
                .filter(e -> e.getLote() != null && lotePorId.containsKey(e.getLote().getId()))
                .toList();
        RendimientoData rendimiento = rendimiento(cosechasLotes, historicos);
        BigDecimal indiceSalud = promedioSalud(saludPorLote.values());
        PrecipitacionData precipitaciones = precipitacionesAcumuladas(lotes);
        ReporteCostosAgricolaResponse.Contexto contexto = new ReporteCostosAgricolaResponse.Contexto(
                new ReporteAgricolaDashboardResponse.RendimientoComparativo(rendimiento.actualTnHa(), rendimiento.historicoTnHa(), rendimiento.actualSerie(), rendimiento.historicoSerie()),
                indiceSalud,
                precipitaciones == null ? null : precipitaciones.promedioMm(),
                distribucion(lotes),
                estadosFenologicos(eventos),
                resumenCosecha(cosechasLotes));

        // Actividad de aplicaciones en el periodo (ordenes filtradas por lote y fecha).
        List<OrdenAplicacion> ordenes = ordenAplicacionRepository.search(null, null, null, null).stream()
                .filter(o -> o.getLote() != null && lotePorId.containsKey(o.getLote().getId()))
                .filter(o -> o.getFechaAplicacion() != null && !o.getFechaAplicacion().isBefore(desdeTs) && !o.getFechaAplicacion().isAfter(hastaTs))
                .toList();
        long validadas = ordenes.stream().filter(o -> o.getEstado() == EstadoOrdenAplicacion.VALIDADA).count();
        long rechazadas = ordenes.stream().filter(o -> o.getEstado() == EstadoOrdenAplicacion.RECHAZADA).count();
        long pendientes = ordenes.stream().filter(o -> o.getEstado() == EstadoOrdenAplicacion.PENDIENTE || o.getEstado() == EstadoOrdenAplicacion.ACEPTADA).count();
        List<ReporteCostosAgricolaResponse.DosisUnidad> dosisPorUnidad = ordenes.stream()
                .filter(o -> o.getEstado() == EstadoOrdenAplicacion.VALIDADA && o.getDosis() != null)
                .collect(Collectors.groupingBy(o -> o.getUnidadDosis() == null ? "-" : o.getUnidadDosis(), TreeMap::new, Collectors.reducing(BigDecimal.ZERO, OrdenAplicacion::getDosis, BigDecimal::add)))
                .entrySet().stream()
                .map(e -> new ReporteCostosAgricolaResponse.DosisUnidad(e.getKey(), scale2(e.getValue())))
                .toList();
        ReporteCostosAgricolaResponse.ActividadAplicaciones actividad = new ReporteCostosAgricolaResponse.ActividadAplicaciones(validadas, pendientes, rechazadas, dosisPorUnidad);

        // Advertencias (insumos sin precio unitario cargado).
        List<String> advertencias = new ArrayList<>();
        if (!insumosSinPrecio.isEmpty()) {
            advertencias.add(insumosSinPrecio.size() + (insumosSinPrecio.size() == 1 ? " insumo" : " insumos")
                    + " sin precio unitario cargado (" + String.join(", ", insumosSinPrecio) + ") aporta 0 al costo del período.");
        }

        return new ReporteCostosAgricolaResponse(
                new ReporteCostosAgricolaResponse.Periodo(desdeFinal, hastaFinal),
                kpis, ranking, composicion, evolucionMensual, costoPorCultivo, lotesMapa, contexto, actividad, advertencias);
    }

    // ===================== Feature 84 - Parte 2: gestion =====================

    @Override
    @Transactional(readOnly = true)
    public ReporteGestionAgricolaResponse gestion() {
        List<ReporteGestionAgricolaResponse.AlertaGestion> alertas = new ArrayList<>();

        // Alertas de clima activas.
        for (AlertaClima a : alertaClimaRepository.findActivas()) {
            alertas.add(new ReporteGestionAgricolaResponse.AlertaGestion(
                    "CLIMA", a.getTipoAlerta().name(), a.getMensaje() != null ? a.getMensaje() : a.getLote().getNombre(),
                    a.getSeveridad().name(), a.getFecha(), "Clima"));
        }

        // Plagas activas (ABIERTA / EN_TRATAMIENTO).
        for (DeteccionPlaga d : deteccionRepository.findAllActive()) {
            if (!ESTADOS_ACTIVOS.contains(d.getEstado())) continue;
            alertas.add(new ReporteGestionAgricolaResponse.AlertaGestion(
                    "PLAGA", d.getCatalogoPlaga().getNombreComun(), d.getLote().getNombre(),
                    d.getSeveridad().name(), d.getFechaDeteccion(), "Agricultura"));
        }

        // Insumos: stock bajo/reorden y vencimientos proximos.
        InsumosDashboardResponse insumos = insumoService.dashboard();
        for (InsumoAgricolaResponse i : insumos.alertasReorden()) {
            alertas.add(new ReporteGestionAgricolaResponse.AlertaGestion(
                    "STOCK", "Reorden: " + i.nombre(), "Stock por debajo del minimo", "MEDIA", null, "Inventario"));
        }
        for (StockInsumoResponse s : insumos.vencimientosProximos()) {
            alertas.add(new ReporteGestionAgricolaResponse.AlertaGestion(
                    "VENCIMIENTO", "Vence: " + s.insumoNombre(),
                    s.fechaVencimiento() == null ? "Vencimiento proximo" : "Vence el " + s.fechaVencimiento(),
                    s.vencido() ? "ALTA" : "MEDIA",
                    s.fechaVencimiento() == null ? null : s.fechaVencimiento().atStartOfDay(), "Inventario"));
        }

        // Mantenimiento de maquinaria pendiente.
        for (MantenimientoProgramado m : mantenimientoRepository.findFiltered(null, null)) {
            if ("COMPLETADO".equalsIgnoreCase(m.getEstado())) continue;
            alertas.add(new ReporteGestionAgricolaResponse.AlertaGestion(
                    "MAQUINARIA", "Mantenimiento " + m.getEstado(), m.getMaquinaria().getCodigo(),
                    priorityFromDate(m.getFechaProgramada()),
                    m.getFechaProgramada() == null ? null : m.getFechaProgramada().atStartOfDay(), "Maquinaria"));
        }
        alertas.sort(Comparator.comparing(ReporteGestionAgricolaResponse.AlertaGestion::fecha, Comparator.nullsLast(Comparator.naturalOrder())).reversed());

        // Ordenes de aplicacion pendientes de validar (estado ACEPTADA).
        List<OrdenAplicacion> aceptadas = ordenAplicacionRepository.search(EstadoOrdenAplicacion.ACEPTADA, null, null, null);
        Map<String, Long> numeros = aceptadas.isEmpty() ? Map.of()
                : ordenNumeroRepository.findByOrdenAplicacionIdIn(aceptadas.stream().map(OrdenAplicacion::getId).toList()).stream()
                    .collect(Collectors.toMap(OrdenAplicacionNumero::getOrdenAplicacionId, OrdenAplicacionNumero::getNumero, (a, b) -> a));
        List<ReporteGestionAgricolaResponse.OrdenPorValidar> ordenesPorValidar = aceptadas.stream()
                .map(o -> new ReporteGestionAgricolaResponse.OrdenPorValidar(
                        o.getId(), numeros.get(o.getId()), o.getLote().getNombre(),
                        o.getInsumo() != null ? o.getInsumo().getNombre() : o.getProducto(),
                        o.getDosis(), o.getUnidadDosis(), o.getSuperficieTratadaHa(), operarioNombre(o.getOperarioId())))
                .toList();

        // Reusa los datos existentes.
        List<EventoSiembra> eventos = eventoRepository.findAllActive();
        List<DeteccionPlaga> detecciones = deteccionRepository.findAllActive();
        List<MantenimientoProgramado> mantenimientos = mantenimientoRepository.findFiltered(null, null);

        return new ReporteGestionAgricolaResponse(
                alertas,
                ordenesPorValidar,
                ordenTrabajoService.dashboard(),
                tareasRecomendadas(eventos, detecciones, mantenimientos));
    }

    // ---- Helpers feature 84 ----

    private Set<String> toSet(List<String> values) {
        if (values == null) return Set.of();
        return values.stream().filter(v -> v != null && !v.isBlank()).map(String::trim).collect(Collectors.toSet());
    }

    private BigDecimal sum(Collection<BigDecimal> values) {
        return values.stream().filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal safeDivide(BigDecimal total, BigDecimal divisor) {
        if (total == null || divisor == null || divisor.signum() == 0) return BigDecimal.ZERO;
        return total.divide(divisor, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal porcentaje(BigDecimal parte, BigDecimal total) {
        if (parte == null || total == null || total.signum() == 0) return BigDecimal.ZERO;
        return parte.multiply(BigDecimal.valueOf(100)).divide(total, 1, RoundingMode.HALF_UP);
    }

    private BigDecimal scale2(BigDecimal value) {
        return value == null ? null : value.setScale(2, RoundingMode.HALF_UP);
    }

    private String etiquetaMes(YearMonth mes) {
        return mes.getMonth().getDisplayName(TextStyle.SHORT, ES_AR) + " " + String.format("%02d", mes.getYear() % 100);
    }

    private String operarioNombre(String operarioId) {
        if (operarioId == null || operarioId.isBlank()) return null;
        return operarioRepository.findActiveById(operarioId)
                .map(o -> (o.getNombre() + " " + o.getApellido()).trim())
                .orElse(operarioId);
    }

    // Feature 60: consolida toneladas totales, perdida promedio y destino del grano.
    private ReporteAgricolaDashboardResponse.ResumenCosecha resumenCosecha(List<RegistroCosecha> cosechas) {
        BigDecimal toneladasTotales = cosechas.stream()
                .map(RegistroCosecha::getToneladasTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal perdidaPromedio = average(cosechas.stream().map(RegistroCosecha::getPerdidaKgHa));

        // Feature 72: destino se agrupa por id pero la etiqueta se muestra resuelta a valor.
        Map<String, String> destinoNombres = utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.DESTINO_COSECHA,
                cosechas.stream().map(RegistroCosecha::getDestino).toList());
        List<ReporteAgricolaDashboardResponse.DestinoResumen> destinos = cosechas.stream()
                .filter(c -> c.getDestino() != null && !c.getDestino().isBlank())
                .collect(Collectors.groupingBy(c -> c.getDestino().trim(), TreeMap::new, Collectors.toList()))
                .entrySet().stream()
                .map(e -> new ReporteAgricolaDashboardResponse.DestinoResumen(
                        utilidadNombreResolver.resolver(e.getKey(), destinoNombres),
                        e.getValue().stream().map(RegistroCosecha::getDestinoCantidadTn).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add),
                        e.getValue().size()))
                .toList();

        return new ReporteAgricolaDashboardResponse.ResumenCosecha(toneladasTotales, perdidaPromedio, destinos);
    }

    private ReporteAgricolaDashboardResponse.Kpi kpi(String codigo, String titulo, String valor, String subtitulo, String tono, BigDecimal valorNumerico, List<ReporteAgricolaDashboardResponse.SeriePunto> tendencia) {
        return new ReporteAgricolaDashboardResponse.Kpi(codigo, titulo, valor, subtitulo, tono, valorNumerico, tendencia);
    }

    private List<ReporteAgricolaDashboardResponse.CultivoFenologico> estadosFenologicos(List<EventoSiembra> eventos) {
        // Feature 72: la etiqueta del cultivo se resuelve del id al valor del catalogo.
        Map<String, String> cultivos = utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.CULTIVO,
                eventos.stream().map(e -> e.getLote().getCultivo()).toList());
        return eventos.stream()
                .filter(e -> e.getTipoEvento() == EventoSiembra.TipoEvento.MONITOREO_FENOLOGICO)
                .filter(e -> e.getEstadoFenologico() != null && !e.getEstadoFenologico().isBlank())
                .collect(Collectors.toMap(e -> normalize(e.getLote().getCultivo()), Function.identity(), (a, b) -> a.getFecha().isAfter(b.getFecha()) ? a : b))
                .values()
                .stream()
                .map(e -> new ReporteAgricolaDashboardResponse.CultivoFenologico(
                        utilidadNombreResolver.resolver(e.getLote().getCultivo(), cultivos), e.getEstadoFenologico(), e.getFecha()))
                .sorted(Comparator.comparing(ReporteAgricolaDashboardResponse.CultivoFenologico::cultivo, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private long contarAlertasActivas(List<DeteccionPlaga> detecciones, List<EventoSiembra> eventos, List<MantenimientoProgramado> mantenimientos) {
        long plagas = detecciones.stream().filter(d -> ESTADOS_ACTIVOS.contains(d.getEstado())).count();
        long alertasAgricolas = eventos.stream().filter(e -> e.getTipoEvento() == EventoSiembra.TipoEvento.ALERTA).count();
        long maquinaria = mantenimientos.stream().filter(m -> !"COMPLETADO".equalsIgnoreCase(m.getEstado())).count();
        return plagas + alertasAgricolas + maquinaria;
    }

    private long contarMonitoreoPendiente(List<DeteccionPlaga> detecciones, Map<String, List<SeguimientoPlaga>> seguimientosPorDeteccion) {
        LocalDateTime corte = LocalDateTime.now().minusDays(10);
        return detecciones.stream()
                .filter(d -> ESTADOS_ACTIVOS.contains(d.getEstado()))
                .filter(d -> seguimientosPorDeteccion.getOrDefault(d.getId(), List.of()).stream().noneMatch(s -> s.getFecha() != null && !s.getFecha().isBefore(corte)))
                .map(d -> d.getLote().getId())
                .distinct()
                .count();
    }

    private Map<String, SaludLote> calcularSaludPorLote(List<Lote> lotes, Map<String, List<DeteccionPlaga>> deteccionesPorLote) {
        return lotes.stream().collect(Collectors.toMap(Lote::getId, lote -> {
            List<DeteccionPlaga> detecciones = deteccionesPorLote.getOrDefault(lote.getId(), List.of()).stream()
                    .filter(d -> ESTADOS_ACTIVOS.contains(d.getEstado()))
                    .toList();
            if (detecciones.stream().anyMatch(d -> d.getSeveridad().name().equals("CRITICA"))) return new SaludLote("Malo", "#FF6B6B", BigDecimal.valueOf(20));
            if (detecciones.stream().anyMatch(d -> d.getSeveridad().name().equals("ALTA"))) return new SaludLote("Regular", "#FF8A4C", BigDecimal.valueOf(40));
            if (detecciones.stream().anyMatch(d -> d.getSeveridad().name().equals("MEDIA"))) return new SaludLote("Bueno", "#FFB84D", BigDecimal.valueOf(60));
            if (detecciones.stream().anyMatch(d -> d.getSeveridad().name().equals("BAJA"))) return new SaludLote("Muy Bueno", "#A3E635", BigDecimal.valueOf(80));
            return new SaludLote("Excelente", "#9FE870", BigDecimal.valueOf(100));
        }));
    }

    private BigDecimal promedioSalud(Collection<SaludLote> salud) {
        if (salud.isEmpty()) return null;
        BigDecimal total = salud.stream().map(SaludLote::score).reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(salud.size()), 1, RoundingMode.HALF_UP);
    }

    private PrecipitacionData precipitacionesAcumuladas(List<Lote> lotes) {
        BigDecimal total = BigDecimal.ZERO;
        int lotesConsiderados = 0;
        // La precipitacion diaria se sincroniza como ventana movil reciente (ver
        // ClimaScheduler), por lo que la acumulacion se calcula sobre los ultimos
        // dias disponibles. Atarla al ciclo del cultivo (siembra -> cosecha) dejaba
        // el KPI en null cuando la cosecha estimada quedaba fuera de esa ventana,
        // aunque estuviera lloviendo en los dias recientes.
        LocalDate hasta = LocalDate.now().minusDays(1);
        LocalDate desde = hasta.minusDays(PRECIPITACION_DIAS_FALLBACK - 1L);

        for (Lote lote : lotes) {
            if (precipitacionDiariaRepository.contarRegistros(lote.getId(), desde, hasta) == 0) continue;
            total = total.add(precipitacionDiariaRepository.sumarPrecipitaciones(lote.getId(), desde, hasta));
            lotesConsiderados++;
        }
        if (lotesConsiderados == 0) return null;
        BigDecimal promedio = total.divide(BigDecimal.valueOf(lotesConsiderados), 1, RoundingMode.HALF_UP);
        return new PrecipitacionData(promedio, lotesConsiderados);
    }

    private RendimientoData rendimiento(List<RegistroCosecha> cosechas, List<HistoricoCultivo> historicos) {
        int year = Year.now().getValue();
        List<RegistroCosecha> actuales = cosechas.stream().filter(c -> c.getFecha() != null && c.getFecha().getYear() == year).toList();
        BigDecimal actualKg = average(actuales.stream().map(RegistroCosecha::getRendimientoKgHa));
        BigDecimal historicoKg = average(historicos.stream()
                .filter(h -> h.getFechaCosecha() != null && h.getFechaCosecha().getYear() >= year - 5 && h.getFechaCosecha().getYear() < year)
                .map(HistoricoCultivo::getRendimientoKgHa));
        return new RendimientoData(toTn(actualKg), toTn(historicoKg), serieCosechas(actuales), serieHistorico(historicos, year));
    }

    private List<ReporteAgricolaDashboardResponse.SeriePunto> serieCosechas(List<RegistroCosecha> cosechas) {
        return cosechas.stream()
                .filter(c -> c.getFecha() != null && c.getRendimientoKgHa() != null)
                .collect(Collectors.groupingBy(c -> c.getFecha().getMonth(), TreeMap::new, Collectors.mapping(RegistroCosecha::getRendimientoKgHa, Collectors.toList())))
                .entrySet().stream()
                .map(e -> new ReporteAgricolaDashboardResponse.SeriePunto(e.getKey().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("es-AR")), toTn(average(e.getValue().stream()))))
                .toList();
    }

    private List<ReporteAgricolaDashboardResponse.SeriePunto> serieHistorico(List<HistoricoCultivo> historicos, int year) {
        return historicos.stream()
                .filter(h -> h.getFechaCosecha() != null && h.getFechaCosecha().getYear() >= year - 5 && h.getFechaCosecha().getYear() < year && h.getRendimientoKgHa() != null)
                .collect(Collectors.groupingBy(h -> h.getFechaCosecha().getMonth(), TreeMap::new, Collectors.mapping(HistoricoCultivo::getRendimientoKgHa, Collectors.toList())))
                .entrySet().stream()
                .map(e -> new ReporteAgricolaDashboardResponse.SeriePunto(e.getKey().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("es-AR")), toTn(average(e.getValue().stream()))))
                .toList();
    }

    private List<ReporteAgricolaDashboardResponse.CultivoDistribucion> distribucion(List<Lote> lotes) {
        BigDecimal total = lotes.stream().map(Lote::getArea).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        // Feature 72: se agrupa por id de cultivo pero la etiqueta se resuelve a valor.
        Map<String, String> cultivos = utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.CULTIVO, lotes.stream().map(Lote::getCultivo).toList());
        Map<String, List<Lote>> byCrop = lotes.stream().collect(Collectors.groupingBy(l -> normalize(l.getCultivo())));
        return byCrop.entrySet().stream()
                .map(entry -> {
                    BigDecimal area = entry.getValue().stream().map(Lote::getArea).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal pct = total.signum() == 0 ? BigDecimal.ZERO : area.multiply(BigDecimal.valueOf(100)).divide(total, 1, RoundingMode.HALF_UP);
                    return new ReporteAgricolaDashboardResponse.CultivoDistribucion(
                            utilidadNombreResolver.resolver(entry.getKey(), cultivos), entry.getValue().size(), area, pct);
                })
                .sorted(Comparator.comparing(ReporteAgricolaDashboardResponse.CultivoDistribucion::cultivo, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private List<ReporteAgricolaDashboardResponse.LoteMapa> lotesMapa(List<Lote> lotes, Map<String, SaludLote> saludPorLote) {
        // Feature 72: la etiqueta de cultivo del pin se resuelve del id al valor del catalogo.
        Map<String, String> cultivos = utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.CULTIVO, lotes.stream().map(Lote::getCultivo).toList());
        return lotes.stream()
                .filter(l -> l.getPoligono() != null && !l.getPoligono().isBlank())
                .map(l -> {
                    SaludLote salud = saludPorLote.get(l.getId());
                    return new ReporteAgricolaDashboardResponse.LoteMapa(l.getId(), l.getNombre(),
                            utilidadNombreResolver.resolver(l.getCultivo(), cultivos), l.getArea(), l.getPoligono(), salud.label(), salud.color());
                })
                .toList();
    }

    private List<ReporteAgricolaDashboardResponse.AlertaResumen> alertasRecientes(List<DeteccionPlaga> detecciones, List<EventoSiembra> eventos, List<MantenimientoProgramado> mantenimientos) {
        Stream<ReporteAgricolaDashboardResponse.AlertaResumen> plagas = detecciones.stream()
                .filter(d -> ESTADOS_ACTIVOS.contains(d.getEstado()))
                .map(d -> new ReporteAgricolaDashboardResponse.AlertaResumen("PLAGA", d.getCatalogoPlaga().getNombreComun(), d.getLote().getNombre(), d.getSeveridad().name(), d.getFechaDeteccion(), "Agricultura"));
        Stream<ReporteAgricolaDashboardResponse.AlertaResumen> agricultura = eventos.stream()
                .filter(e -> e.getTipoEvento() == EventoSiembra.TipoEvento.ALERTA)
                .map(e -> new ReporteAgricolaDashboardResponse.AlertaResumen("AGRICOLA", e.getDescripcion() != null ? e.getDescripcion() : "Alerta agrícola", e.getLote().getNombre(), "MEDIA", e.getFecha().atStartOfDay(), "Agricultura"));
        Stream<ReporteAgricolaDashboardResponse.AlertaResumen> maquinaria = mantenimientos.stream()
                .filter(m -> !"COMPLETADO".equalsIgnoreCase(m.getEstado()))
                .map(m -> new ReporteAgricolaDashboardResponse.AlertaResumen("MAQUINARIA", "Mantenimiento " + m.getEstado(), m.getMaquinaria().getCodigo(), priorityFromDate(m.getFechaProgramada()), m.getFechaProgramada().atStartOfDay(), "Maquinaria"));
        return Stream.of(plagas, agricultura, maquinaria).flatMap(Function.identity())
                .sorted(Comparator.comparing(ReporteAgricolaDashboardResponse.AlertaResumen::fecha, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(5)
                .toList();
    }

    private List<ReporteAgricolaDashboardResponse.TareaResumen> tareasRecomendadas(List<EventoSiembra> eventos, List<DeteccionPlaga> detecciones, List<MantenimientoProgramado> mantenimientos) {
        Stream<ReporteAgricolaDashboardResponse.TareaResumen> agricultura = eventos.stream()
                .filter(e -> e.getTipoEvento() == EventoSiembra.TipoEvento.TRATAMIENTO || e.getTipoEvento() == EventoSiembra.TipoEvento.MONITOREO_FENOLOGICO)
                .map(e -> new ReporteAgricolaDashboardResponse.TareaResumen(e.getTipoEvento().name(), e.getDescripcion() != null ? e.getDescripcion() : e.getTipoEvento().name(), e.getLote().getNombre(), e.getFecha(), "MEDIA", 1, "Agricultura"));
        Stream<ReporteAgricolaDashboardResponse.TareaResumen> plagas = detecciones.stream()
                .filter(d -> ESTADOS_ACTIVOS.contains(d.getEstado()))
                .map(d -> new ReporteAgricolaDashboardResponse.TareaResumen("SEGUIMIENTO_PLAGA", "Seguimiento de " + d.getCatalogoPlaga().getNombreComun(), d.getLote().getNombre(), d.getFechaDeteccion().toLocalDate().plusDays(10), d.getSeveridad().name(), 1, "Agricultura"));
        Stream<ReporteAgricolaDashboardResponse.TareaResumen> maquinaria = mantenimientos.stream()
                .filter(m -> !"COMPLETADO".equalsIgnoreCase(m.getEstado()))
                .map(m -> new ReporteAgricolaDashboardResponse.TareaResumen("MANTENIMIENTO", "Mantenimiento " + m.getMaquinaria().getCodigo(), m.getPlan() != null ? m.getPlan().getNombre() : m.getMaquinaria().getModelo(), m.getFechaProgramada(), priorityFromDate(m.getFechaProgramada()), 0, "Maquinaria"));
        return Stream.of(agricultura, plagas, maquinaria).flatMap(Function.identity())
                .sorted(Comparator.comparing(ReporteAgricolaDashboardResponse.TareaResumen::fechaSugerida, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(4)
                .toList();
    }

    private String priorityFromDate(LocalDate date) {
        if (date == null) return "MEDIA";
        if (!date.isAfter(LocalDate.now())) return "ALTA";
        if (!date.isAfter(LocalDate.now().plusDays(7))) return "MEDIA";
        return "BAJA";
    }

    private BigDecimal average(Stream<BigDecimal> values) {
        List<BigDecimal> list = values.filter(Objects::nonNull).toList();
        if (list.isEmpty()) return null;
        BigDecimal total = list.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(list.size()), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal toTn(BigDecimal kg) {
        return kg == null ? null : kg.divide(BigDecimal.valueOf(1000), 2, RoundingMode.HALF_UP);
    }

    private String formatHa(BigDecimal value) {
        return formatNumber(value) + " ha";
    }

    private String formatPct(BigDecimal value) {
        return value == null ? null : formatNumber(value) + "%";
    }

    private String formatNumber(BigDecimal value) {
        return value == null ? null : value.stripTrailingZeros().toPlainString();
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? "Sin cultivo" : value.trim();
    }

    private record SaludLote(String label, String color, BigDecimal score) {}
    private record RendimientoData(BigDecimal actualTnHa, BigDecimal historicoTnHa, List<ReporteAgricolaDashboardResponse.SeriePunto> actualSerie, List<ReporteAgricolaDashboardResponse.SeriePunto> historicoSerie) {}
    private record PrecipitacionData(BigDecimal promedioMm, int lotesConsiderados) {}
}
