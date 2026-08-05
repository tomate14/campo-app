package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.AgriculturaAnalyticsResponse;
import com.campoapp.agricultura.entity.RegistroCosecha;
import com.campoapp.agricultura.repository.AnalisisRepository;
import com.campoapp.agricultura.repository.MetricaRepository;
import com.campoapp.agricultura.repository.RendimientoRepository;
import com.campoapp.agricultura.service.AnalyticsService;
import com.campoapp.agricultura.service.PredictorService;
import com.campoapp.clima.entity.DatoClima;
import com.campoapp.utilidades.service.CatalogoUtilidadRegistry;
import com.campoapp.utilidades.service.UtilidadNombreResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.WeekFields;
import java.util.Comparator;
import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final RendimientoRepository rendimientoRepository;
    private final AnalisisRepository analisisRepository;
    private final MetricaRepository metricaRepository;
    private final PredictorService predictorService;
    private final UtilidadNombreResolver utilidadNombreResolver;

    @Override
    public AgriculturaAnalyticsResponse obtenerAnalytics(
            String loteId,
            String cultivo,
            String temporada,
            LocalDate desde,
            LocalDate hasta,
            String granularidad
    ) {
        String resolvedGranularity = normalizeGranularity(granularidad);
        List<RegistroCosecha> cosechas = rendimientoRepository.findFiltered(loteId, cultivo, temporada, desde, hasta);
        List<DatoClima> clima = metricaRepository.findFiltered(
                loteId, cultivo, temporada,
                desde != null ? desde.atStartOfDay() : null,
                hasta != null ? hasta.atTime(23, 59, 59) : null
        );
        analisisRepository.findFiltered(loteId, cultivo, temporada, desde, hasta);

        AgriculturaAnalyticsResponse.Kpis kpis = buildKpis(cosechas);
        List<AgriculturaAnalyticsResponse.LoteMetric> lotes = buildLoteMetrics(cosechas);
        List<AgriculturaAnalyticsResponse.CultivoMetric> cultivos = buildCultivoMetrics(cosechas);
        List<AgriculturaAnalyticsResponse.TemporadaMetric> temporadas = buildTemporadaMetrics(cosechas);
        List<AgriculturaAnalyticsResponse.SerieTemporal> series = buildSeries(cosechas, resolvedGranularity);
        List<AgriculturaAnalyticsResponse.Outlier> outliers = buildOutliers(lotes, kpis.rendimientoPromedioKgHa(), kpis.desviacionEstandarKgHa());
        AgriculturaAnalyticsResponse.Prediccion prediccion = predictorService.estimarSiguientePeriodo(series, resolvedGranularity);
        AgriculturaAnalyticsResponse.ResumenClima climaResumen = buildClimaSummary(clima);

        return new AgriculturaAnalyticsResponse(
                new AgriculturaAnalyticsResponse.Filtros(loteId, cultivo, temporada, desde, hasta, resolvedGranularity),
                kpis,
                lotes,
                cultivos,
                temporadas,
                series,
                outliers,
                prediccion,
                climaResumen
        );
    }

    private AgriculturaAnalyticsResponse.Kpis buildKpis(List<RegistroCosecha> cosechas) {
        long totalLotes = cosechas.stream().map(c -> c.getLote().getId()).distinct().count();
        BigDecimal toneladasTotales = sum(cosechas.stream().map(RegistroCosecha::getToneladasTotal).toList());
        BigDecimal rendimientoPromedio = average(cosechas.stream().map(RegistroCosecha::getRendimientoKgHa).toList());
        BigDecimal humedadPromedio = average(cosechas.stream().map(RegistroCosecha::getHumedad).filter(Objects::nonNull).toList());
        BigDecimal premiumPct = percentage(
                cosechas.stream().filter(c -> c.getCalidadGrano() == RegistroCosecha.CalidadGrano.PREMIUM).count(),
                cosechas.size()
        );
        BigDecimal desviacion = stdDev(cosechas.stream().map(RegistroCosecha::getRendimientoKgHa).toList());

        return new AgriculturaAnalyticsResponse.Kpis(
                cosechas.size(),
                totalLotes,
                toneladasTotales,
                rendimientoPromedio,
                humedadPromedio,
                premiumPct,
                desviacion
        );
    }

    private List<AgriculturaAnalyticsResponse.LoteMetric> buildLoteMetrics(List<RegistroCosecha> cosechas) {
        // Feature 72: la etiqueta de cultivo se resuelve del id al valor del catalogo.
        Map<String, String> cultivos = utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.CULTIVO,
                cosechas.stream().map(c -> c.getLote().getCultivo()).toList());
        return cosechas.stream()
                .collect(Collectors.groupingBy(c -> c.getLote().getId()))
                .values().stream()
                .map(items -> {
                    RegistroCosecha first = items.get(0);
                    return new AgriculturaAnalyticsResponse.LoteMetric(
                            first.getLote().getId(),
                            first.getLote().getNombre(),
                            utilidadNombreResolver.resolver(first.getLote().getCultivo(), cultivos),
                            first.getLote().getTemporada(),
                            first.getLote().getArea(),
                            average(items.stream().map(RegistroCosecha::getRendimientoKgHa).toList()),
                            sum(items.stream().map(RegistroCosecha::getToneladasTotal).toList()),
                            items.size(),
                            dominantQuality(items)
                    );
                })
                .sorted(Comparator.comparing(AgriculturaAnalyticsResponse.LoteMetric::rendimientoPromedioKgHa).reversed())
                .toList();
    }

    private List<AgriculturaAnalyticsResponse.CultivoMetric> buildCultivoMetrics(List<RegistroCosecha> cosechas) {
        // Feature 72: se agrupa por id de cultivo pero la etiqueta se resuelve a valor.
        Map<String, String> cultivos = utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.CULTIVO,
                cosechas.stream().map(c -> c.getLote().getCultivo()).toList());
        return cosechas.stream()
                .collect(Collectors.groupingBy(c -> c.getLote().getCultivo()))
                .entrySet().stream()
                .map(entry -> new AgriculturaAnalyticsResponse.CultivoMetric(
                        utilidadNombreResolver.resolver(entry.getKey(), cultivos),
                        average(entry.getValue().stream().map(RegistroCosecha::getRendimientoKgHa).toList()),
                        sum(entry.getValue().stream().map(RegistroCosecha::getToneladasTotal).toList()),
                        entry.getValue().size()
                ))
                .sorted(Comparator.comparing(AgriculturaAnalyticsResponse.CultivoMetric::rendimientoPromedioKgHa).reversed())
                .toList();
    }

    private List<AgriculturaAnalyticsResponse.TemporadaMetric> buildTemporadaMetrics(List<RegistroCosecha> cosechas) {
        return cosechas.stream()
                .collect(Collectors.groupingBy(c -> c.getLote().getTemporada()))
                .entrySet().stream()
                .map(entry -> new AgriculturaAnalyticsResponse.TemporadaMetric(
                        entry.getKey(),
                        average(entry.getValue().stream().map(RegistroCosecha::getRendimientoKgHa).toList()),
                        sum(entry.getValue().stream().map(RegistroCosecha::getToneladasTotal).toList()),
                        entry.getValue().size()
                ))
                .sorted(Comparator.comparing(AgriculturaAnalyticsResponse.TemporadaMetric::temporada))
                .toList();
    }

    private List<AgriculturaAnalyticsResponse.SerieTemporal> buildSeries(List<RegistroCosecha> cosechas, String granularidad) {
        Function<RegistroCosecha, String> keyExtractor = switch (granularidad) {
            case "SEMANAL" -> cosecha -> {
                var week = cosecha.getFecha().get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());
                return cosecha.getFecha().getYear() + "-W" + String.format("%02d", week);
            };
            case "MENSUAL" -> cosecha -> YearMonth.from(cosecha.getFecha()).toString();
            default -> cosecha -> String.valueOf(cosecha.getFecha().getYear());
        };

        return cosechas.stream()
                .collect(Collectors.groupingBy(keyExtractor))
                .entrySet().stream()
                .map(entry -> new AgriculturaAnalyticsResponse.SerieTemporal(
                        entry.getKey(),
                        average(entry.getValue().stream().map(RegistroCosecha::getRendimientoKgHa).toList()),
                        sum(entry.getValue().stream().map(RegistroCosecha::getToneladasTotal).toList()),
                        entry.getValue().size()
                ))
                .sorted(Comparator.comparing(AgriculturaAnalyticsResponse.SerieTemporal::periodo))
                .toList();
    }

    private List<AgriculturaAnalyticsResponse.Outlier> buildOutliers(
            List<AgriculturaAnalyticsResponse.LoteMetric> lotes,
            BigDecimal mean,
            BigDecimal stddev
    ) {
        double avg = mean.doubleValue();
        double sigma = stddev.doubleValue();
        if (sigma == 0) {
            return List.of();
        }

        return lotes.stream()
                .map(lote -> {
                    double deviation = lote.rendimientoPromedioKgHa().doubleValue() - avg;
                    if (Math.abs(deviation) < sigma) {
                        return null;
                    }

                    return new AgriculturaAnalyticsResponse.Outlier(
                            lote.loteId(),
                            lote.loteNombre(),
                            lote.rendimientoPromedioKgHa(),
                            BigDecimal.valueOf(deviation).setScale(2, RoundingMode.HALF_UP),
                            deviation > 0 ? "ALTO" : "BAJO"
                    );
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing((AgriculturaAnalyticsResponse.Outlier item) -> item.desviacionSobreMediaKgHa().abs()).reversed())
                .toList();
    }

    private AgriculturaAnalyticsResponse.ResumenClima buildClimaSummary(List<DatoClima> clima) {
        return new AgriculturaAnalyticsResponse.ResumenClima(
                average(clima.stream().map(DatoClima::getTemperatura).filter(Objects::nonNull).toList()),
                average(clima.stream().map(DatoClima::getPrecipitacionesMm).filter(Objects::nonNull).toList()),
                averageInt(clima.stream().map(DatoClima::getHumedadPct).filter(Objects::nonNull).toList())
        );
    }

    private String dominantQuality(List<RegistroCosecha> cosechas) {
        return cosechas.stream()
                .filter(c -> c.getCalidadGrano() != null)
                .collect(Collectors.groupingBy(c -> c.getCalidadGrano().name(), Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("SIN_DATO");
    }

    private String normalizeGranularity(String granularidad) {
        if (granularidad == null || granularidad.isBlank()) {
            return "MENSUAL";
        }
        return switch (granularidad.toUpperCase(Locale.ROOT)) {
            case "SEMANAL", "ANUAL" -> granularidad.toUpperCase(Locale.ROOT);
            default -> "MENSUAL";
        };
    }

    private BigDecimal sum(List<BigDecimal> values) {
        return values.stream()
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal average(List<BigDecimal> values) {
        List<BigDecimal> filtered = values.stream().filter(Objects::nonNull).toList();
        if (filtered.isEmpty()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal total = filtered.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(filtered.size()), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal averageInt(List<Integer> values) {
        if (values.isEmpty()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        DoubleSummaryStatistics stats = values.stream().mapToDouble(Integer::doubleValue).summaryStatistics();
        return BigDecimal.valueOf(stats.getAverage()).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal stdDev(List<BigDecimal> values) {
        List<Double> filtered = values.stream().filter(Objects::nonNull).map(BigDecimal::doubleValue).toList();
        if (filtered.size() < 2) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        double avg = filtered.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double variance = filtered.stream()
                .mapToDouble(value -> Math.pow(value - avg, 2))
                .average()
                .orElse(0);
        return BigDecimal.valueOf(Math.sqrt(variance)).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal percentage(long numerator, long denominator) {
        if (denominator == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf((numerator * 100.0) / denominator).setScale(2, RoundingMode.HALF_UP);
    }
}
