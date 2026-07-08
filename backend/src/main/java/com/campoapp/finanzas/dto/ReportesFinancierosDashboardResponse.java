package com.campoapp.finanzas.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ReportesFinancierosDashboardResponse(
        LocalDate fechaDesde,
        LocalDate fechaHasta,
        List<Kpi> kpis,
        List<PeriodoComparativo> ingresosEgresos,
        List<PeriodoComparativo> flujoCaja,
        List<RankingFinanciero> topClientes,
        List<RankingFinanciero> topProveedores,
        List<PendienteFinanciero> cuentasPorCobrar,
        List<PendienteFinanciero> cuentasPorPagar,
        List<VencimientoFinanciero> proximosVencimientos
) {
    public record Kpi(String codigo, String titulo, BigDecimal valor, String formato, String subtitulo, String tono, String tendencia) {}
    public record PeriodoComparativo(String periodo, BigDecimal ingresos, BigDecimal egresos, BigDecimal neto) {}
    public record RankingFinanciero(String nombre, long cantidad, BigDecimal total, BigDecimal porcentaje) {}
    public record PendienteFinanciero(String entidad, String comprobante, LocalDate vencimiento, BigDecimal saldo, String estado, String tipo) {}
    public record VencimientoFinanciero(String titulo, String entidad, LocalDate vencimiento, BigDecimal saldo, String prioridad, String tipo) {}
}
