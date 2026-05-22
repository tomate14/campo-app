package com.campoapp.agricultura.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AgriculturaAnalyticsResponse(
        Filtros filtros,
        Kpis kpis,
        List<LoteMetric> lotes,
        List<CultivoMetric> cultivos,
        List<TemporadaMetric> temporadas,
        List<SerieTemporal> series,
        List<Outlier> outliers,
        Prediccion prediccion,
        ResumenClima clima
) {
    public record Filtros(
            String loteId,
            String cultivo,
            String temporada,
            LocalDate desde,
            LocalDate hasta,
            String granularidad
    ) {}

    public record Kpis(
            long totalCosechas,
            long totalLotes,
            BigDecimal toneladasTotales,
            BigDecimal rendimientoPromedioKgHa,
            BigDecimal humedadPromedio,
            BigDecimal tasaPremiumPct,
            BigDecimal desviacionEstandarKgHa
    ) {}

    public record LoteMetric(
            String loteId,
            String loteNombre,
            String cultivo,
            String temporada,
            BigDecimal areaHa,
            BigDecimal rendimientoPromedioKgHa,
            BigDecimal toneladasTotales,
            long cosechas,
            String calidadDominante
    ) {}

    public record CultivoMetric(
            String cultivo,
            BigDecimal rendimientoPromedioKgHa,
            BigDecimal toneladasTotales,
            long cosechas
    ) {}

    public record TemporadaMetric(
            String temporada,
            BigDecimal rendimientoPromedioKgHa,
            BigDecimal toneladasTotales,
            long cosechas
    ) {}

    public record SerieTemporal(
            String periodo,
            BigDecimal rendimientoPromedioKgHa,
            BigDecimal toneladasTotales,
            long cosechas
    ) {}

    public record Outlier(
            String loteId,
            String loteNombre,
            BigDecimal rendimientoPromedioKgHa,
            BigDecimal desviacionSobreMediaKgHa,
            String tipo
    ) {}

    public record Prediccion(
            String proximoPeriodo,
            BigDecimal rendimientoEstimadoKgHa,
            String confianza,
            String metodo
    ) {}

    public record ResumenClima(
            BigDecimal temperaturaPromedio,
            BigDecimal precipitacionPromedioMm,
            BigDecimal humedadPromedioPct
    ) {}
}
