package com.campoapp.reportes.service.impl;

import com.campoapp.agricultura.entity.EventoSiembra;
import com.campoapp.agricultura.entity.HistoricoCultivo;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.RegistroCosecha;
import com.campoapp.agricultura.entity.plagas.DeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.EstadoDeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.SeguimientoPlaga;
import com.campoapp.agricultura.repository.EventoSiembraRepository;
import com.campoapp.agricultura.repository.HistoricoCultivoRepository;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.RegistroCosechaRepository;
import com.campoapp.agricultura.repository.plagas.DeteccionPlagaRepository;
import com.campoapp.agricultura.repository.plagas.SeguimientoPlagaRepository;
import com.campoapp.clima.repository.PrecipitacionDiariaRepository;
import com.campoapp.maquinaria.entity.MantenimientoProgramado;
import com.campoapp.maquinaria.repository.MantenimientoProgramadoRepository;
import com.campoapp.reportes.dto.ReporteAgricolaDashboardResponse;
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
import java.time.Year;
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
