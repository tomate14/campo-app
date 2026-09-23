package com.campoapp.reportes;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.RegistroCosecha;
import com.campoapp.agricultura.entity.insumos.InsumoAgricola;
import com.campoapp.agricultura.entity.insumos.MovimientoInsumoAgricola;
import com.campoapp.agricultura.entity.insumos.TipoMovimientoInsumo;
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
import com.campoapp.clima.repository.AlertaClimaRepository;
import com.campoapp.clima.repository.PrecipitacionDiariaRepository;
import com.campoapp.finanzas.entity.CompraProveedor;
import com.campoapp.finanzas.entity.TipoComprobanteCompra;
import com.campoapp.finanzas.repository.CompraProveedorRepository;
import com.campoapp.maquinaria.repository.MantenimientoProgramadoRepository;
import com.campoapp.operarios.repository.OperarioRepository;
import com.campoapp.operarios.service.OrdenTrabajoService;
import com.campoapp.reportes.dto.ReporteCostosAgricolaResponse;
import com.campoapp.reportes.service.impl.ReporteAgricolaDashboardServiceImpl;
import com.campoapp.utilidades.service.UtilidadNombreResolver;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Feature 84 - Parte 1: modelo de costos (ReporteAgricolaDashboardServiceImpl.costos).
 * Cubre el prorrateo de comprobantes por hectarea, el costo de insumos aplicados (con advertencia
 * cuando falta el precio), costo/ha, costo/tonelada (null sin toneladas) y los filtros por
 * periodo, lote y cultivo.
 */
class ReporteCostosAgricolaServiceTest {

    // Todos los mocks devuelven colecciones vacias por defecto: el reporte debe calcularse sin datos.
    private static <T> T emptyRepo(Class<T> type) {
        return Mockito.mock(type, invocation -> {
            Class<?> returnType = invocation.getMethod().getReturnType();
            if (List.class.isAssignableFrom(returnType)) return List.of();
            if (Set.class.isAssignableFrom(returnType)) return Set.of();
            if (Map.class.isAssignableFrom(returnType)) return Map.of();
            if (Optional.class.isAssignableFrom(returnType)) return Optional.empty();
            return Mockito.RETURNS_DEFAULTS.answer(invocation);
        });
    }

    private final LoteRepository loteRepository = emptyRepo(LoteRepository.class);
    private final RegistroCosechaRepository cosechaRepository = emptyRepo(RegistroCosechaRepository.class);
    private final MovimientoInsumoAgricolaRepository movimientoInsumoRepository = emptyRepo(MovimientoInsumoAgricolaRepository.class);
    private final CompraProveedorRepository compraRepository = emptyRepo(CompraProveedorRepository.class);

    private final ReporteAgricolaDashboardServiceImpl service = new ReporteAgricolaDashboardServiceImpl(
            loteRepository,
            cosechaRepository,
            emptyRepo(HistoricoCultivoRepository.class),
            emptyRepo(EventoSiembraRepository.class),
            emptyRepo(DeteccionPlagaRepository.class),
            emptyRepo(SeguimientoPlagaRepository.class),
            emptyRepo(PrecipitacionDiariaRepository.class),
            emptyRepo(MantenimientoProgramadoRepository.class),
            emptyRepo(UtilidadNombreResolver.class),
            movimientoInsumoRepository,
            compraRepository,
            emptyRepo(OrdenAplicacionRepository.class),
            emptyRepo(OrdenAplicacionNumeroRepository.class),
            emptyRepo(OperarioRepository.class),
            emptyRepo(AlertaClimaRepository.class),
            emptyRepo(InsumoService.class),
            emptyRepo(OrdenTrabajoService.class)
    );

    private final LocalDate desde = LocalDate.of(2026, 1, 1);
    private final LocalDate hasta = LocalDate.of(2026, 12, 31);

    private Lote lote(String id, String nombre, String cultivo, String area) {
        Lote lote = new Lote();
        lote.setId(id);
        lote.setNombre(nombre);
        lote.setCultivo(cultivo);
        lote.setArea(new BigDecimal(area));
        return lote;
    }

    @Test
    void shouldProrateCompraByHectare_whenCompraSpansSeveralLotes() {
        Lote loteA = lote("lote-1", "Norte", "SOJA", "100");
        Lote loteB = lote("lote-2", "Sur", "SOJA", "300");
        CompraProveedor compra = CompraProveedor.builder()
                .tipoComprobante(TipoComprobanteCompra.FACTURA_A)
                .fechaEmision(LocalDate.of(2026, 6, 15))
                .total(new BigDecimal("400"))
                .lotes(Set.of(loteA, loteB))
                .build();
        when(loteRepository.findAllActive()).thenReturn(List.of(loteA, loteB));
        when(compraRepository.findConLoteEnRango(any(), any(), any())).thenReturn(List.of(compra));

        ReporteCostosAgricolaResponse response = service.costos(desde, hasta, null, null);

        // 400 se reparte 100/400 y 300/400 -> 100 y 300 (proporcional al area).
        assertThat(response.kpis().costoComprobantes()).isEqualByComparingTo("400.00");
        assertThat(response.kpis().costoInsumos()).isEqualByComparingTo("0.00");
        assertThat(response.kpis().costoTotal()).isEqualByComparingTo("400.00");
        assertThat(response.kpis().hectareas()).isEqualByComparingTo("400.00");
        assertThat(response.kpis().costoHectarea()).isEqualByComparingTo("1.00");
        assertThat(response.kpis().costoPorTonelada()).isNull();

        ReporteCostosAgricolaResponse.RankingLote a = ranking(response, "lote-1");
        ReporteCostosAgricolaResponse.RankingLote b = ranking(response, "lote-2");
        assertThat(a.costoTotal()).isEqualByComparingTo("100.00");
        assertThat(b.costoTotal()).isEqualByComparingTo("300.00");
    }

    @Test
    void shouldSumInsumoCostPerLote_andWarnWhenCostoUnitarioIsNull() {
        Lote loteA = lote("lote-1", "Norte", "SOJA", "100");
        when(loteRepository.findAllActive()).thenReturn(List.of(loteA));
        when(movimientoInsumoRepository.findSalidasPorLotesYRango(any(), any(), any(), any()))
                .thenReturn(List.of(
                        movimiento(loteA, "10", "5", "Urea"),      // 50
                        movimiento(loteA, "4", null, "Fosfato")     // 0 + advertencia
                ));

        ReporteCostosAgricolaResponse response = service.costos(desde, hasta, null, null);

        assertThat(response.kpis().costoInsumos()).isEqualByComparingTo("50.00");
        assertThat(response.kpis().costoTotal()).isEqualByComparingTo("50.00");
        assertThat(response.advertencias()).isNotEmpty();
        assertThat(response.advertencias().get(0)).contains("Fosfato").contains("sin precio unitario");
    }

    @Test
    void shouldComputeCostoPorTonelada_andExcludeCosechaOutsidePeriod() {
        Lote loteA = lote("lote-1", "Norte", "SOJA", "100");
        when(loteRepository.findAllActive()).thenReturn(List.of(loteA));
        when(movimientoInsumoRepository.findSalidasPorLotesYRango(any(), any(), any(), any()))
                .thenReturn(List.of(movimiento(loteA, "10", "5", "Urea"))); // costo total 50
        when(cosechaRepository.findAllActive()).thenReturn(List.of(
                cosecha(loteA, LocalDate.of(2026, 6, 1), "10"),   // dentro del periodo
                cosecha(loteA, LocalDate.of(2020, 6, 1), "999")   // fuera del periodo -> excluida
        ));

        ReporteCostosAgricolaResponse response = service.costos(desde, hasta, null, null);

        assertThat(response.kpis().toneladas()).isEqualByComparingTo("10.00");
        assertThat(response.kpis().costoPorTonelada()).isEqualByComparingTo("5.00"); // 50 / 10
    }

    @Test
    void shouldFilterByLoteIds() {
        Lote loteA = lote("lote-1", "Norte", "SOJA", "100");
        Lote loteB = lote("lote-2", "Sur", "MAIZ", "300");
        when(loteRepository.findAllActive()).thenReturn(List.of(loteA, loteB));

        ReporteCostosAgricolaResponse response = service.costos(desde, hasta, List.of("lote-1"), null);

        assertThat(response.kpis().lotesCount()).isEqualTo(1);
        assertThat(response.kpis().hectareas()).isEqualByComparingTo("100.00");
    }

    @Test
    void shouldFilterByCultivo() {
        Lote loteA = lote("lote-1", "Norte", "SOJA", "100");
        Lote loteB = lote("lote-2", "Sur", "MAIZ", "300");
        when(loteRepository.findAllActive()).thenReturn(List.of(loteA, loteB));

        ReporteCostosAgricolaResponse response = service.costos(desde, hasta, null, List.of("SOJA"));

        assertThat(response.kpis().lotesCount()).isEqualTo(1);
        assertThat(response.kpis().hectareas()).isEqualByComparingTo("100.00");
    }

    @Test
    void shouldQueryRepositoriesWithRequestedPeriod() {
        Lote loteA = lote("lote-1", "Norte", "SOJA", "100");
        when(loteRepository.findAllActive()).thenReturn(List.of(loteA));
        LocalDate d = LocalDate.of(2026, 2, 1);
        LocalDate h = LocalDate.of(2026, 8, 31);

        service.costos(d, h, null, null);

        verify(compraRepository).findConLoteEnRango(eq(d), eq(h), any());
        verify(movimientoInsumoRepository).findSalidasPorLotesYRango(
                any(), any(), eq(d.atStartOfDay()), eq(h.atTime(LocalTime.MAX)));
    }

    private ReporteCostosAgricolaResponse.RankingLote ranking(ReporteCostosAgricolaResponse response, String loteId) {
        return response.rankingLotes().stream().filter(r -> r.loteId().equals(loteId)).findFirst().orElseThrow();
    }

    private MovimientoInsumoAgricola movimiento(Lote lote, String cantidad, String costoUnitario, String insumoNombre) {
        InsumoAgricola insumo = InsumoAgricola.builder().codigo("C").nombre(insumoNombre).tipo("T").unidadMedida("U").build();
        return MovimientoInsumoAgricola.builder()
                .insumo(insumo)
                .lote(lote)
                .fecha(LocalDateTime.of(2026, 6, 10, 10, 0))
                .tipoMovimiento(TipoMovimientoInsumo.SALIDA)
                .cantidad(new BigDecimal(cantidad))
                .costoUnitario(costoUnitario == null ? null : new BigDecimal(costoUnitario))
                .build();
    }

    private RegistroCosecha cosecha(Lote lote, LocalDate fecha, String toneladas) {
        return RegistroCosecha.builder()
                .lote(lote)
                .fecha(fecha)
                .rendimientoKgHa(new BigDecimal("1000"))
                .toneladasTotal(new BigDecimal(toneladas))
                .build();
    }
}
