package com.campoapp.agricultura;

import com.campoapp.agricultura.dto.plagas.AplicacionFitosanitariaResponse;
import com.campoapp.agricultura.dto.plagas.OrdenAplicacionRequest;
import com.campoapp.agricultura.dto.plagas.OrdenAplicacionResponse;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.insumos.InsumoAgricola;
import com.campoapp.agricultura.entity.plagas.CatalogoPlaga;
import com.campoapp.agricultura.entity.plagas.DeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.EstadoOrdenAplicacion;
import com.campoapp.agricultura.entity.plagas.OrdenAplicacion;
import com.campoapp.agricultura.entity.plagas.OrdenAplicacionNumero;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.insumos.InsumoAgricolaRepository;
import com.campoapp.agricultura.repository.plagas.DeteccionPlagaRepository;
import com.campoapp.agricultura.repository.plagas.OrdenAplicacionNumeroRepository;
import com.campoapp.agricultura.repository.plagas.OrdenAplicacionRepository;
import com.campoapp.agricultura.service.InsumoService;
import com.campoapp.agricultura.service.PlagasService;
import com.campoapp.agricultura.service.impl.OrdenAplicacionServiceImpl;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.repository.OperarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Feature 84: orden de aplicacion.
 * - crear() valida el insumo del catalogo (requerido, 404 si no existe) y lo asocia a la orden.
 * - validar() delega en InsumoService.generarSalidaPorOrden y pasa la orden a VALIDADA.
 * - validar() es idempotente: re-validar una orden VALIDADA no genera un segundo movimiento.
 */
@ExtendWith(MockitoExtension.class)
class OrdenAplicacionServiceImplTest {

    @Mock private OrdenAplicacionRepository ordenRepository;
    @Mock private OrdenAplicacionNumeroRepository numeroRepository;
    @Mock private DeteccionPlagaRepository deteccionRepository;
    @Mock private LoteRepository loteRepository;
    @Mock private OperarioRepository operarioRepository;
    @Mock private InsumoAgricolaRepository insumoRepository;
    @Mock private PlagasService plagasService;
    @Mock private InsumoService insumoService;

    private OrdenAplicacionServiceImpl service;

    private Lote lote;
    private DeteccionPlaga deteccion;

    @BeforeEach
    void setUp() {
        service = new OrdenAplicacionServiceImpl(
                ordenRepository, numeroRepository, deteccionRepository, loteRepository,
                operarioRepository, insumoRepository, plagasService, insumoService);

        lote = new Lote();
        lote.setId("lote-1");
        lote.setNombre("Lote Norte");
        lote.setCultivo("SOJA");
        lote.setArea(new BigDecimal("100"));

        deteccion = new DeteccionPlaga();
        deteccion.setId("det-1");
        deteccion.setLote(lote);
        deteccion.setCatalogoPlaga(CatalogoPlaga.builder().nombreComun("Oruga").build());
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAsAdmin() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin-user", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
    }

    // request con responsableId == operarioId == "op-1" para reutilizar el mismo operario.
    private OrdenAplicacionRequest request(String insumoId) {
        return new OrdenAplicacionRequest(
                "lote-1", "det-1", LocalDateTime.of(2026, 3, 1, 8, 0),
                "Producto X", "Principio", new BigDecimal("2"), "L/ha",
                new BigDecimal("100"), new BigDecimal("10"), null, null,
                "op-1", "op-1", insumoId);
    }

    private OrdenAplicacion ordenAceptada(InsumoAgricola insumo) {
        return OrdenAplicacion.builder()
                .lote(lote)
                .deteccion(deteccion)
                .insumo(insumo)
                .fechaAplicacion(LocalDateTime.of(2026, 3, 1, 8, 0))
                .producto("Producto X")
                .dosis(new BigDecimal("2"))
                .unidadDosis("L/ha")
                .superficieTratadaHa(new BigDecimal("10"))
                .responsableId("op-1")
                .operarioId("op-1")
                .estado(EstadoOrdenAplicacion.ACEPTADA)
                .build();
    }

    // ---- crear() ----

    @Test
    void shouldThrowBusinessException_whenInsumoIdIsNullOnCreate() {
        when(loteRepository.findActiveById("lote-1")).thenReturn(Optional.of(lote));
        when(deteccionRepository.findActiveById("det-1")).thenReturn(Optional.of(deteccion));
        when(operarioRepository.findActiveById("op-1")).thenReturn(Optional.of(new Operario()));

        assertThatThrownBy(() -> service.crear(request(null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("insumo");
    }

    @Test
    void shouldThrowBusinessException_whenInsumoIdIsBlankOnCreate() {
        when(loteRepository.findActiveById("lote-1")).thenReturn(Optional.of(lote));
        when(deteccionRepository.findActiveById("det-1")).thenReturn(Optional.of(deteccion));
        when(operarioRepository.findActiveById("op-1")).thenReturn(Optional.of(new Operario()));

        assertThatThrownBy(() -> service.crear(request("   ")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("insumo");
    }

    @Test
    void shouldThrowResourceNotFound_whenInsumoDoesNotExistOnCreate() {
        when(loteRepository.findActiveById("lote-1")).thenReturn(Optional.of(lote));
        when(deteccionRepository.findActiveById("det-1")).thenReturn(Optional.of(deteccion));
        when(operarioRepository.findActiveById("op-1")).thenReturn(Optional.of(new Operario()));
        when(insumoRepository.findByIdAndDeletedAtIsNull("ins-x")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.crear(request("ins-x")))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("ins-x");
    }

    @Test
    void shouldAttachInsumoToOrden_whenInsumoExistsOnCreate() {
        InsumoAgricola insumo = InsumoAgricola.builder().codigo("URE").nombre("Urea").tipo("FERT").unidadMedida("KG").build();
        insumo.setId("ins-1");
        when(loteRepository.findActiveById("lote-1")).thenReturn(Optional.of(lote));
        when(deteccionRepository.findActiveById("det-1")).thenReturn(Optional.of(deteccion));
        when(operarioRepository.findActiveById("op-1")).thenReturn(Optional.of(new Operario()));
        when(insumoRepository.findByIdAndDeletedAtIsNull("ins-1")).thenReturn(Optional.of(insumo));
        when(ordenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(numeroRepository.save(any())).thenReturn(OrdenAplicacionNumero.builder().numero(7L).build());

        OrdenAplicacionResponse response = service.crear(request("ins-1"));

        ArgumentCaptor<OrdenAplicacion> captor = ArgumentCaptor.forClass(OrdenAplicacion.class);
        verify(ordenRepository).save(captor.capture());
        assertThat(captor.getValue().getInsumo()).isSameAs(insumo);
        assertThat(captor.getValue().getEstado()).isEqualTo(EstadoOrdenAplicacion.PENDIENTE);
        assertThat(response.insumoId()).isEqualTo("ins-1");
        assertThat(response.numero()).isEqualTo(7L);
    }

    // ---- validar() ----

    @Test
    void shouldGenerateSalidaAndValidate_whenOrdenIsAccepted() {
        authenticateAsAdmin();
        InsumoAgricola insumo = InsumoAgricola.builder().codigo("URE").nombre("Urea").tipo("FERT").unidadMedida("KG").precioUnitario(new BigDecimal("15")).build();
        insumo.setId("ins-1");
        OrdenAplicacion orden = ordenAceptada(insumo);
        orden.setId("oa-1");

        when(ordenRepository.findActiveById("oa-1")).thenReturn(Optional.of(orden));
        when(numeroRepository.findByOrdenAplicacionId("oa-1"))
                .thenReturn(Optional.of(OrdenAplicacionNumero.builder().numero(3L).ordenAplicacionId("oa-1").build()));
        when(plagasService.crearAplicacion(eq("det-1"), any())).thenReturn(aplicacionResponse("apl-1"));
        when(ordenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrdenAplicacionResponse response = service.validar("oa-1");

        assertThat(response.estado()).isEqualTo(EstadoOrdenAplicacion.VALIDADA);
        assertThat(orden.getAplicacionId()).isEqualTo("apl-1");
        verify(insumoService).generarSalidaPorOrden(orden, 3L);
    }

    @Test
    void shouldBeIdempotent_whenRevalidatingAlreadyValidatedOrden() {
        authenticateAsAdmin();
        InsumoAgricola insumo = InsumoAgricola.builder().codigo("URE").nombre("Urea").tipo("FERT").unidadMedida("KG").build();
        insumo.setId("ins-1");
        OrdenAplicacion orden = ordenAceptada(insumo);
        orden.setId("oa-1");
        orden.setEstado(EstadoOrdenAplicacion.VALIDADA);
        orden.setAplicacionId("apl-1");

        when(ordenRepository.findActiveById("oa-1")).thenReturn(Optional.of(orden));
        when(numeroRepository.findByOrdenAplicacionId("oa-1"))
                .thenReturn(Optional.of(OrdenAplicacionNumero.builder().numero(3L).ordenAplicacionId("oa-1").build()));

        OrdenAplicacionResponse response = service.validar("oa-1");

        assertThat(response.estado()).isEqualTo(EstadoOrdenAplicacion.VALIDADA);
        verify(insumoService, never()).generarSalidaPorOrden(any(), any());
        verify(plagasService, never()).crearAplicacion(any(), any());
        verify(ordenRepository, never()).save(any());
    }

    private AplicacionFitosanitariaResponse aplicacionResponse(String id) {
        return new AplicacionFitosanitariaResponse(
                id, "det-1", "lote-1", "Lote Norte", LocalDateTime.now(),
                "Producto X", "Principio", new BigDecimal("2"), "L/ha",
                new BigDecimal("100"), new BigDecimal("10"), null, null, null, null,
                null, "op-1", "Operario", null, null, LocalDateTime.now());
    }
}
