package com.campoapp.agricultura;

import com.campoapp.agricultura.dto.insumos.MovimientoInsumoResponse;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.insumos.InsumoAgricola;
import com.campoapp.agricultura.entity.insumos.MovimientoInsumoAgricola;
import com.campoapp.agricultura.entity.insumos.StockInsumoAgricola;
import com.campoapp.agricultura.entity.insumos.TipoMovimientoInsumo;
import com.campoapp.agricultura.entity.plagas.OrdenAplicacion;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.insumos.InsumoAgricolaRepository;
import com.campoapp.agricultura.repository.insumos.MovimientoInsumoAgricolaRepository;
import com.campoapp.agricultura.repository.insumos.StockInsumoAgricolaRepository;
import com.campoapp.agricultura.service.impl.InsumoServiceImpl;
import com.campoapp.finanzas.repository.ProveedorFinancieroRepository;
import com.campoapp.operarios.repository.OperarioRepository;
import com.campoapp.utilidades.service.UtilidadNombreResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Feature 84: InsumoServiceImpl.generarSalidaPorOrden.
 * Al validar una orden se crea un movimiento SALIDA con cantidad = dosis x superficie tratada,
 * costoUnitario = precio del insumo del catalogo, ligado a la orden. Es idempotente por orden y
 * descuenta el stock disponible (FEFO) cuando existe.
 */
@ExtendWith(MockitoExtension.class)
class InsumoServiceGenerarSalidaTest {

    @Mock private InsumoAgricolaRepository insumoRepository;
    @Mock private StockInsumoAgricolaRepository stockRepository;
    @Mock private MovimientoInsumoAgricolaRepository movimientoRepository;
    @Mock private LoteRepository loteRepository;
    @Mock private OperarioRepository operarioRepository;
    @Mock private ProveedorFinancieroRepository proveedorRepository;
    @Mock private UtilidadNombreResolver utilidadNombreResolver;

    private InsumoServiceImpl service;

    private Lote lote;

    @BeforeEach
    void setUp() {
        service = new InsumoServiceImpl(insumoRepository, stockRepository, movimientoRepository,
                loteRepository, operarioRepository, proveedorRepository, utilidadNombreResolver);
        lote = new Lote();
        lote.setId("lote-1");
        lote.setNombre("Lote Norte");
    }

    private OrdenAplicacion orden(InsumoAgricola insumo, BigDecimal dosis, BigDecimal superficie) {
        OrdenAplicacion orden = OrdenAplicacion.builder()
                .lote(lote)
                .insumo(insumo)
                .fechaAplicacion(LocalDateTime.of(2026, 3, 1, 8, 0))
                .dosis(dosis)
                .unidadDosis("L/ha")
                .superficieTratadaHa(superficie)
                .build();
        orden.setId("oa-1");
        return orden;
    }

    private InsumoAgricola insumo(BigDecimal precio) {
        InsumoAgricola insumo = InsumoAgricola.builder()
                .codigo("URE").nombre("Urea").tipo("FERT").unidadMedida("KG").precioUnitario(precio).build();
        insumo.setId("ins-1");
        return insumo;
    }

    @Test
    void shouldCreateSalidaMovement_withCantidadDosisPorSuperficie_andCostoFromInsumo() {
        InsumoAgricola insumo = insumo(new BigDecimal("15"));
        OrdenAplicacion orden = orden(insumo, new BigDecimal("2"), new BigDecimal("10"));
        when(movimientoRepository.findFirstByOrdenAplicacionIdAndDeletedAtIsNull("oa-1")).thenReturn(null);
        when(stockRepository.findByInsumoIdAndDeletedAtIsNullOrderByFechaVencimientoAsc("ins-1")).thenReturn(List.of());
        when(movimientoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.generarSalidaPorOrden(orden, 5L);

        ArgumentCaptor<MovimientoInsumoAgricola> captor = ArgumentCaptor.forClass(MovimientoInsumoAgricola.class);
        verify(movimientoRepository).save(captor.capture());
        MovimientoInsumoAgricola movimiento = captor.getValue();
        assertThat(movimiento.getTipoMovimiento()).isEqualTo(TipoMovimientoInsumo.SALIDA);
        assertThat(movimiento.getCantidad()).isEqualByComparingTo("20"); // 2 x 10
        assertThat(movimiento.getCostoUnitario()).isEqualByComparingTo("15");
        assertThat(movimiento.getOrdenAplicacion()).isSameAs(orden);
        assertThat(movimiento.getLote()).isSameAs(lote);
        assertThat(movimiento.getInsumo()).isSameAs(insumo);
    }

    @Test
    void shouldKeepCostoUnitarioNull_whenInsumoHasNoPrice() {
        InsumoAgricola insumo = insumo(null);
        OrdenAplicacion orden = orden(insumo, new BigDecimal("3"), new BigDecimal("4"));
        when(movimientoRepository.findFirstByOrdenAplicacionIdAndDeletedAtIsNull("oa-1")).thenReturn(null);
        when(stockRepository.findByInsumoIdAndDeletedAtIsNullOrderByFechaVencimientoAsc("ins-1")).thenReturn(List.of());
        when(movimientoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.generarSalidaPorOrden(orden, 1L);

        ArgumentCaptor<MovimientoInsumoAgricola> captor = ArgumentCaptor.forClass(MovimientoInsumoAgricola.class);
        verify(movimientoRepository).save(captor.capture());
        assertThat(captor.getValue().getCostoUnitario()).isNull();
        assertThat(captor.getValue().getCantidad()).isEqualByComparingTo("12"); // 3 x 4
    }

    @Test
    void shouldBeIdempotent_whenMovementForOrdenAlreadyExists() {
        InsumoAgricola insumo = insumo(new BigDecimal("15"));
        OrdenAplicacion orden = orden(insumo, new BigDecimal("2"), new BigDecimal("10"));
        MovimientoInsumoAgricola existente = MovimientoInsumoAgricola.builder()
                .insumo(insumo).lote(lote).fecha(LocalDateTime.now())
                .tipoMovimiento(TipoMovimientoInsumo.SALIDA).cantidad(new BigDecimal("20")).costoUnitario(new BigDecimal("15"))
                .ordenAplicacion(orden).build();
        when(movimientoRepository.findFirstByOrdenAplicacionIdAndDeletedAtIsNull("oa-1")).thenReturn(existente);

        MovimientoInsumoResponse response = service.generarSalidaPorOrden(orden, 5L);

        assertThat(response.cantidad()).isEqualByComparingTo("20");
        verify(movimientoRepository, never()).save(any());
    }

    @Test
    void shouldDiscountAvailableStock_whenStockExists() {
        InsumoAgricola insumo = insumo(new BigDecimal("15"));
        OrdenAplicacion orden = orden(insumo, new BigDecimal("2"), new BigDecimal("10"));
        StockInsumoAgricola stock = StockInsumoAgricola.builder()
                .insumo(insumo).cantidadDisponible(new BigDecimal("100")).build();
        stock.setId("stock-1");
        when(movimientoRepository.findFirstByOrdenAplicacionIdAndDeletedAtIsNull("oa-1")).thenReturn(null);
        when(stockRepository.findByInsumoIdAndDeletedAtIsNullOrderByFechaVencimientoAsc("ins-1")).thenReturn(List.of(stock));
        when(movimientoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.generarSalidaPorOrden(orden, 5L);

        verify(stockRepository).save(stock);
        assertThat(stock.getCantidadDisponible()).isEqualByComparingTo("80"); // 100 - 20
    }
}
