package com.campoapp.agricultura;

import com.campoapp.agricultura.dto.plagas.DeteccionPlagaRequest;
import com.campoapp.agricultura.dto.plagas.ResolverLoteRequest;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.plagas.CatalogoPlaga;
import com.campoapp.agricultura.entity.plagas.SeveridadPlaga;
import com.campoapp.agricultura.entity.plagas.TipoPlaga;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.plagas.AplicacionFitosanitariaRepository;
import com.campoapp.agricultura.repository.plagas.CatalogoPlagaRepository;
import com.campoapp.agricultura.repository.plagas.DeteccionPlagaRepository;
import com.campoapp.agricultura.repository.plagas.SeguimientoPlagaRepository;
import com.campoapp.agricultura.service.impl.PlagasServiceImpl;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlagasServiceTest {
    @Mock private CatalogoPlagaRepository catalogoRepository;
    @Mock private DeteccionPlagaRepository deteccionRepository;
    @Mock private AplicacionFitosanitariaRepository aplicacionRepository;
    @Mock private SeguimientoPlagaRepository seguimientoRepository;
    @Mock private LoteRepository loteRepository;

    private PlagasServiceImpl service;
    private Lote lote;

    @BeforeEach
    void setUp() {
        service = new PlagasServiceImpl(catalogoRepository, deteccionRepository, aplicacionRepository, seguimientoRepository, loteRepository, new ObjectMapper());
        lote = new Lote();
        lote.setNombre("Lote Norte");
        lote.setCultivo("MAIZ");
        lote.setPoligono("{\"type\":\"Polygon\",\"coordinates\":[[[-60.0,-36.0],[-59.0,-36.0],[-59.0,-35.0],[-60.0,-35.0],[-60.0,-36.0]]]}");
    }

    @Test
    void shouldResolveLote_whenPointIsInsidePolygon() {
        when(loteRepository.findAllActive()).thenReturn(List.of(lote));

        var result = service.resolverLote(new ResolverLoteRequest(new BigDecimal("-35.5"), new BigDecimal("-59.5")));

        assertThat(result.encontrado()).isTrue();
        assertThat(result.loteNombre()).isEqualTo("Lote Norte");
    }

    @Test
    void shouldThrowResourceNotFound_whenLoteDoesNotExistForDetection() {
        var request = new DeteccionPlagaRequest("missing", "catalogo-1", null, "MAIZ", SeveridadPlaga.MEDIA, null, null, null, null, null, null, null, null, null, null, null, null, "Operario");
        when(loteRepository.findActiveById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.crearDeteccion(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("missing");
    }

    @Test
    void shouldCreateDetectionWithDefaultState_whenDataIsValid() {
        CatalogoPlaga catalogo = CatalogoPlaga.builder().nombreComun("Oruga cogollera").tipo(TipoPlaga.PLAGA).activo(true).build();
        var request = new DeteccionPlagaRequest(lote.getId(), "catalogo-1", null, "MAIZ", SeveridadPlaga.ALTA, null, null, null, new BigDecimal("-35.5"), new BigDecimal("-59.5"), null, null, null, null, null, null, "Dano en hojas", "Operario");
        when(loteRepository.findActiveById(lote.getId())).thenReturn(Optional.of(lote));
        when(catalogoRepository.findActiveById("catalogo-1")).thenReturn(Optional.of(catalogo));
        when(deteccionRepository.save(org.mockito.ArgumentMatchers.any())).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.crearDeteccion(request);

        assertThat(result.plagaNombre()).isEqualTo("Oruga cogollera");
        assertThat(result.estado().name()).isEqualTo("ABIERTA");
    }
}
