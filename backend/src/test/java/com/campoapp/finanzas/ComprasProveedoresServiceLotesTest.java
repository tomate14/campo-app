package com.campoapp.finanzas;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.insumos.InsumoAgricolaRepository;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.finanzas.dto.CompraItemRequest;
import com.campoapp.finanzas.dto.CompraLoteRef;
import com.campoapp.finanzas.dto.CompraRequest;
import com.campoapp.finanzas.dto.CompraResponse;
import com.campoapp.finanzas.entity.CompraProveedor;
import com.campoapp.finanzas.entity.ProveedorFinanciero;
import com.campoapp.finanzas.entity.TipoComprobanteCompra;
import com.campoapp.finanzas.repository.CompraProveedorRepository;
import com.campoapp.finanzas.repository.PagoProveedorRepository;
import com.campoapp.finanzas.repository.ProveedorFinancieroRepository;
import com.campoapp.finanzas.service.impl.ComprasProveedoresServiceImpl;
import com.campoapp.operarios.repository.OperarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Feature 84: ComprasProveedoresServiceImpl persiste y mapea los lotes atribuidos a la compra.
 * loteIds del request -> Set<Lote> de la entidad; y en la respuesta -> List<CompraLoteRef> con area.
 */
@ExtendWith(MockitoExtension.class)
class ComprasProveedoresServiceLotesTest {

    @Mock private ProveedorFinancieroRepository proveedorRepository;
    @Mock private CompraProveedorRepository compraRepository;
    @Mock private PagoProveedorRepository pagoRepository;
    @Mock private InsumoAgricolaRepository insumoRepository;
    @Mock private LoteRepository loteRepository;
    @Mock private OperarioRepository operarioRepository;

    private ComprasProveedoresServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ComprasProveedoresServiceImpl(
                proveedorRepository, compraRepository, pagoRepository,
                insumoRepository, loteRepository, operarioRepository);
    }

    private Lote lote(String id, String nombre, String area) {
        Lote lote = new Lote();
        lote.setId(id);
        lote.setNombre(nombre);
        lote.setArea(new BigDecimal(area));
        return lote;
    }

    private CompraRequest request(List<String> loteIds) {
        return new CompraRequest(
                "prov-1", null, TipoComprobanteCompra.FACTURA_A, "0001-0001",
                LocalDate.of(2026, 6, 15), LocalDate.of(2026, 7, 15), null,
                List.of(new CompraItemRequest(null, "Semilla", new BigDecimal("10"), "KG", new BigDecimal("5"), new BigDecimal("21"))),
                loteIds);
    }

    @Test
    void shouldPersistAndMapLotes_whenLoteIdsProvided() {
        ProveedorFinanciero proveedor = ProveedorFinanciero.builder().razonSocial("Proveedor SA").cuit("30-1-2").build();
        proveedor.setId("prov-1");
        Lote loteA = lote("lote-1", "Norte", "100");
        Lote loteB = lote("lote-2", "Sur", "300");
        when(proveedorRepository.findByIdAndDeletedAtIsNull("prov-1")).thenReturn(Optional.of(proveedor));
        when(loteRepository.findActiveById("lote-1")).thenReturn(Optional.of(loteA));
        when(loteRepository.findActiveById("lote-2")).thenReturn(Optional.of(loteB));
        when(compraRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CompraResponse response = service.crearCompra(request(List.of("lote-1", "lote-2")));

        ArgumentCaptor<CompraProveedor> captor = ArgumentCaptor.forClass(CompraProveedor.class);
        org.mockito.Mockito.verify(compraRepository).save(captor.capture());
        assertThat(captor.getValue().getLotes()).containsExactlyInAnyOrder(loteA, loteB);

        assertThat(response.lotes()).extracting(CompraLoteRef::loteId).containsExactlyInAnyOrder("lote-1", "lote-2");
        CompraLoteRef refA = response.lotes().stream().filter(r -> r.loteId().equals("lote-1")).findFirst().orElseThrow();
        assertThat(refA.loteNombre()).isEqualTo("Norte");
        assertThat(refA.area()).isEqualByComparingTo("100");
    }

    @Test
    void shouldThrowResourceNotFound_whenLoteDoesNotExist() {
        ProveedorFinanciero proveedor = ProveedorFinanciero.builder().razonSocial("Proveedor SA").cuit("30-1-2").build();
        proveedor.setId("prov-1");
        when(proveedorRepository.findByIdAndDeletedAtIsNull("prov-1")).thenReturn(Optional.of(proveedor));
        when(loteRepository.findActiveById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.crearCompra(request(List.of("missing"))))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("missing");
    }

    @Test
    void shouldMapEmptyLotes_whenNoLoteIdsProvided() {
        ProveedorFinanciero proveedor = ProveedorFinanciero.builder().razonSocial("Proveedor SA").cuit("30-1-2").build();
        proveedor.setId("prov-1");
        when(proveedorRepository.findByIdAndDeletedAtIsNull("prov-1")).thenReturn(Optional.of(proveedor));
        when(compraRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CompraResponse response = service.crearCompra(request(null));

        assertThat(response.lotes()).isEmpty();
    }
}
