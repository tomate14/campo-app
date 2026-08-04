package com.campoapp.reportes.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ReporteAgricolaDashboardResponse(
        String campania,
        LocalDateTime ultimaActualizacion,
        List<Kpi> kpis,
        List<CultivoFenologico> estadosFenologicos,
        RendimientoComparativo rendimientoComparativo,
        List<CultivoDistribucion> distribucionCultivos,
        List<LoteMapa> lotesMapa,
        List<SeriePunto> evolucionSalud,
        List<AlertaResumen> alertasRecientes,
        List<TareaResumen> tareasRecomendadas,
        ResumenCosecha resumenCosecha
) {
    // Feature 60: consolidado de destino y perdidas de cosecha.
    public record ResumenCosecha(
            BigDecimal toneladasTotales,
            BigDecimal perdidaPromedioKgHa,
            List<DestinoResumen> destinos
    ) {}

    public record DestinoResumen(
            String destino,
            BigDecimal cantidadTn,
            long registros
    ) {}

    public record Kpi(
            String codigo,
            String titulo,
            String valor,
            String subtitulo,
            String tono,
            BigDecimal valorNumerico,
            List<SeriePunto> tendencia
    ) {}

    public record CultivoFenologico(
            String cultivo,
            String estadoFenologico,
            LocalDate fecha
    ) {}

    public record RendimientoComparativo(
            BigDecimal actualTnHa,
            BigDecimal historicoTnHa,
            List<SeriePunto> actual,
            List<SeriePunto> historico
    ) {}

    public record CultivoDistribucion(
            String cultivo,
            long lotes,
            BigDecimal hectareas,
            BigDecimal porcentaje
    ) {}

    public record LoteMapa(
            String loteId,
            String nombre,
            String cultivo,
            BigDecimal area,
            String poligono,
            String salud,
            String color
    ) {}

    public record SeriePunto(
            String etiqueta,
            BigDecimal valor
    ) {}

    public record AlertaResumen(
            String tipo,
            String titulo,
            String detalle,
            String prioridad,
            LocalDateTime fecha,
            String origen
    ) {}

    public record TareaResumen(
            String tipo,
            String titulo,
            String detalle,
            LocalDate fechaSugerida,
            String prioridad,
            long lotesAfectados,
            String origen
    ) {}
}
