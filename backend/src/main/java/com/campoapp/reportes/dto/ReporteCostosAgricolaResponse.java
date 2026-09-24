package com.campoapp.reportes.dto;

import com.campoapp.reportes.dto.ReporteAgricolaDashboardResponse.CultivoDistribucion;
import com.campoapp.reportes.dto.ReporteAgricolaDashboardResponse.CultivoFenologico;
import com.campoapp.reportes.dto.ReporteAgricolaDashboardResponse.RendimientoComparativo;
import com.campoapp.reportes.dto.ReporteAgricolaDashboardResponse.ResumenCosecha;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

// Feature 84 - Parte 1 (estadisticas): costo total por hectarea del periodo/lotes/cultivos filtrados.
public record ReporteCostosAgricolaResponse(
        Periodo periodo,
        Kpis kpis,
        List<RankingLote> rankingLotes,
        List<ComposicionCosto> composicion,
        List<ReporteAgricolaDashboardResponse.SeriePunto> evolucionMensual,
        List<CostoCultivo> costoPorCultivo,
        List<LoteCostoMapa> lotesMapa,
        Contexto contexto,
        ActividadAplicaciones actividadAplicaciones,
        List<String> advertencias
) {
    public record Periodo(LocalDate desde, LocalDate hasta) {}

    public record Kpis(
            BigDecimal costoTotal,
            BigDecimal costoHectarea,
            BigDecimal costoInsumos,
            BigDecimal costoInsumosPct,
            BigDecimal costoComprobantes,
            BigDecimal costoComprobantesPct,
            BigDecimal costoPorTonelada,
            BigDecimal toneladas,
            BigDecimal hectareas,
            long lotesCount
    ) {}

    public record RankingLote(
            String loteId,
            String nombre,
            BigDecimal costoHa,
            BigDecimal costoTotal
    ) {}

    public record ComposicionCosto(
            String categoria,
            BigDecimal monto,
            BigDecimal porcentaje
    ) {}

    public record CostoCultivo(
            String cultivo,
            BigDecimal costoHa
    ) {}

    public record LoteCostoMapa(
            String loteId,
            String nombre,
            String cultivo,
            BigDecimal area,
            String poligono,
            String salud,
            String saludColor,
            BigDecimal costoHa
    ) {}

    public record Contexto(
            RendimientoComparativo rendimientoComparativo,
            BigDecimal indiceSalud,
            BigDecimal precipitacionMm,
            List<CultivoDistribucion> distribucionCultivos,
            List<CultivoFenologico> estadosFenologicos,
            ResumenCosecha resumenCosecha
    ) {}

    public record ActividadAplicaciones(
            long validadas,
            long pendientes,
            long rechazadas,
            List<DosisUnidad> dosisPorUnidad
    ) {}

    public record DosisUnidad(
            String unidad,
            BigDecimal total
    ) {}
}
