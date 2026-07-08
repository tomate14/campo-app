package com.campoapp.finanzas.service.impl;

import com.campoapp.agricultura.repository.insumos.StockInsumoAgricolaRepository;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.finanzas.dto.ReportesFinancierosDashboardResponse;
import com.campoapp.finanzas.repository.CobroVentaRepository;
import com.campoapp.finanzas.repository.CompraProveedorRepository;
import com.campoapp.finanzas.repository.FacturaVentaRepository;
import com.campoapp.finanzas.repository.PagoProveedorRepository;
import com.campoapp.finanzas.service.ReportesFinancierosService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportesFinancierosServiceImpl implements ReportesFinancierosService {
    private static final DateTimeFormatter PERIOD_KEY = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final Locale ES_AR = Locale.forLanguageTag("es-AR");

    private final FacturaVentaRepository facturaRepository;
    private final CompraProveedorRepository compraRepository;
    private final CobroVentaRepository cobroRepository;
    private final PagoProveedorRepository pagoRepository;
    private final StockInsumoAgricolaRepository stockRepository;

    @Override
    public ReportesFinancierosDashboardResponse dashboard(LocalDate fechaDesde, LocalDate fechaHasta, Integer topClientesLimit, Integer topProveedoresLimit) {
        LocalDate hasta = fechaHasta == null ? LocalDate.now() : fechaHasta;
        LocalDate desde = fechaDesde == null ? hasta.withDayOfMonth(1) : fechaDesde;
        if (hasta.isBefore(desde)) {
            throw new BusinessException("La fecha hasta no puede ser anterior a la fecha desde");
        }

        LocalDate periodStart = YearMonth.from(hasta).minusMonths(11).atDay(1);
        LocalDate periodEnd = YearMonth.from(hasta).atEndOfMonth();
        int clientesLimit = limit(topClientesLimit);
        int proveedoresLimit = limit(topProveedoresLimit);

        BigDecimal ventas = money(facturaRepository.ventasEntre(desde, hasta));
        BigDecimal compras = money(compraRepository.comprasEntre(desde, hasta));
        BigDecimal cobros = money(cobroRepository.cobrosEntre(desde, hasta));
        BigDecimal pagos = money(pagoRepository.pagosEntre(desde, hasta));
        BigDecimal porCobrar = money(facturaRepository.cuentasPorCobrarEntre(desde, hasta));
        BigDecimal porPagar = money(compraRepository.cuentasPorPagarEntre(desde, hasta));
        BigDecimal stockValorizado = money(stockRepository.stockValorizado());
        BigDecimal margen = ventas.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : ventas.subtract(compras).multiply(BigDecimal.valueOf(100)).divide(ventas, 1, RoundingMode.HALF_UP);
        BigDecimal flujoNeto = cobros.subtract(pagos);
        long vencimientos = facturaRepository.vencimientosPendientesEntre(LocalDate.now(), LocalDate.now().plusDays(30))
                + compraRepository.vencimientosPendientesEntre(LocalDate.now(), LocalDate.now().plusDays(30));

        List<ReportesFinancierosDashboardResponse.Kpi> kpis = List.of(
                kpi("ventas", "Ventas del periodo", ventas, "currency", "Facturas emitidas en rango", "green", null),
                kpi("compras", "Compras del periodo", compras, "currency", "Compras registradas en rango", "blue", null),
                kpi("margen", "Margen bruto", margen, "percent", "Ventas menos compras", margen.signum() >= 0 ? "green" : "danger", null),
                kpi("cobrar", "Cuentas por cobrar", porCobrar, "currency", "Saldo pendiente en rango", "warning", null),
                kpi("pagar", "Cuentas por pagar", porPagar, "currency", "Saldo pendiente en rango", "orange", null),
                kpi("flujo", "Flujo neto", flujoNeto, "currency", "Cobros menos pagos", flujoNeto.signum() >= 0 ? "green" : "danger", null),
                kpi("stock", "Stock valorizado", stockValorizado, "currency", "Inventario agricola disponible", "violet", null),
                kpi("vencimientos", "Vencimientos proximos", BigDecimal.valueOf(vencimientos), "number", "Proximos 30 dias", vencimientos > 0 ? "warning" : "green", null)
        );

        return new ReportesFinancierosDashboardResponse(
                desde,
                hasta,
                kpis,
                comparativa(periodStart, periodEnd, facturaRepository.ventasPorPeriodo(periodStart, periodEnd), compraRepository.comprasPorPeriodo(periodStart, periodEnd)),
                comparativa(periodStart, periodEnd, cobroRepository.cobrosPorPeriodo(periodStart, periodEnd), pagoRepository.pagosPorPeriodo(periodStart, periodEnd)),
                ranking(facturaRepository.topClientes(desde, hasta, clientesLimit)),
                ranking(compraRepository.topProveedores(desde, hasta, proveedoresLimit)),
                pendientes(facturaRepository.cuentasPorCobrarPendientes(8), "COBRAR"),
                pendientes(compraRepository.cuentasPorPagarPendientes(8), "PAGAR"),
                vencimientos(facturaRepository.cuentasPorCobrarPendientes(5), compraRepository.cuentasPorPagarPendientes(5))
        );
    }

    private ReportesFinancierosDashboardResponse.Kpi kpi(String codigo, String titulo, BigDecimal valor, String formato, String subtitulo, String tono, String tendencia) {
        return new ReportesFinancierosDashboardResponse.Kpi(codigo, titulo, money(valor), formato, subtitulo, tono, tendencia);
    }

    private List<ReportesFinancierosDashboardResponse.PeriodoComparativo> comparativa(LocalDate desde, LocalDate hasta, List<Object[]> ingresosRows, List<Object[]> egresosRows) {
        Map<String, BigDecimal> ingresos = rowsToPeriodMap(ingresosRows);
        Map<String, BigDecimal> egresos = rowsToPeriodMap(egresosRows);
        List<ReportesFinancierosDashboardResponse.PeriodoComparativo> result = new ArrayList<>();
        YearMonth cursor = YearMonth.from(desde);
        YearMonth end = YearMonth.from(hasta);
        while (!cursor.isAfter(end)) {
            String key = cursor.format(PERIOD_KEY);
            BigDecimal in = money(ingresos.get(key));
            BigDecimal out = money(egresos.get(key));
            result.add(new ReportesFinancierosDashboardResponse.PeriodoComparativo(monthLabel(cursor), in, out, in.subtract(out)));
            cursor = cursor.plusMonths(1);
        }
        return result;
    }

    private Map<String, BigDecimal> rowsToPeriodMap(List<Object[]> rows) {
        Map<String, BigDecimal> result = new HashMap<>();
        for (Object[] row : rows) {
            result.put(String.valueOf(row[0]), money(row[1]));
        }
        return result;
    }

    private List<ReportesFinancierosDashboardResponse.RankingFinanciero> ranking(List<Object[]> rows) {
        BigDecimal total = rows.stream().map(row -> money(row[2])).reduce(BigDecimal.ZERO, BigDecimal::add);
        return rows.stream()
                .map(row -> new ReportesFinancierosDashboardResponse.RankingFinanciero(
                        String.valueOf(row[0]),
                        ((Number) row[1]).longValue(),
                        money(row[2]),
                        pct(money(row[2]), total)))
                .toList();
    }

    private List<ReportesFinancierosDashboardResponse.PendienteFinanciero> pendientes(List<Object[]> rows, String tipo) {
        return rows.stream()
                .map(row -> new ReportesFinancierosDashboardResponse.PendienteFinanciero(
                        String.valueOf(row[0]),
                        String.valueOf(row[1]),
                        toLocalDate(row[2]),
                        money(row[3]),
                        String.valueOf(row[4]),
                        tipo))
                .toList();
    }

    private List<ReportesFinancierosDashboardResponse.VencimientoFinanciero> vencimientos(List<Object[]> cobros, List<Object[]> pagos) {
        List<ReportesFinancierosDashboardResponse.VencimientoFinanciero> result = new ArrayList<>();
        pendientes(cobros, "COBRAR").forEach(p -> result.add(new ReportesFinancierosDashboardResponse.VencimientoFinanciero(
                "Cobro pendiente", p.entidad(), p.vencimiento(), p.saldo(), priority(p.vencimiento()), "COBRAR")));
        pendientes(pagos, "PAGAR").forEach(p -> result.add(new ReportesFinancierosDashboardResponse.VencimientoFinanciero(
                "Pago pendiente", p.entidad(), p.vencimiento(), p.saldo(), priority(p.vencimiento()), "PAGAR")));
        return result.stream()
                .sorted(Comparator.comparing(ReportesFinancierosDashboardResponse.VencimientoFinanciero::vencimiento, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(8)
                .toList();
    }

    private String priority(LocalDate date) {
        if (date == null) return "MEDIA";
        if (!date.isAfter(LocalDate.now())) return "ALTA";
        if (!date.isAfter(LocalDate.now().plusDays(7))) return "MEDIA";
        return "BAJA";
    }

    private BigDecimal pct(BigDecimal value, BigDecimal total) {
        if (total == null || total.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return value.multiply(BigDecimal.valueOf(100)).divide(total, 1, RoundingMode.HALF_UP);
    }

    private BigDecimal money(Object value) {
        if (value == null) return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (value instanceof BigDecimal decimal) return decimal.setScale(2, RoundingMode.HALF_UP);
        if (value instanceof Number number) return BigDecimal.valueOf(number.doubleValue()).setScale(2, RoundingMode.HALF_UP);
        return new BigDecimal(String.valueOf(value)).setScale(2, RoundingMode.HALF_UP);
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof LocalDate localDate) return localDate;
        if (value instanceof Date date) return date.toLocalDate();
        return value == null ? null : LocalDate.parse(String.valueOf(value));
    }

    private String monthLabel(YearMonth month) {
        return month.getMonth().getDisplayName(TextStyle.SHORT, ES_AR).replace(".", "") + " " + String.valueOf(month.getYear()).substring(2);
    }

    private int limit(Integer value) {
        if (value == null) return 5;
        return Math.max(1, Math.min(value, 20));
    }
}
