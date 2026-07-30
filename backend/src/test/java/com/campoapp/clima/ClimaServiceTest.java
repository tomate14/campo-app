package com.campoapp.clima;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.clima.config.ClimaProperties;
import com.campoapp.clima.dto.DatoClimaResponse;
import com.campoapp.clima.dto.PronosticoResponse;
import com.campoapp.clima.entity.DatoClima;
import com.campoapp.clima.entity.Pronostico;
import com.campoapp.clima.repository.DatoClimaRepository;
import com.campoapp.clima.repository.PronosticoRepository;
import com.campoapp.clima.service.AlertaClimaService;
import com.campoapp.clima.service.impl.ClimaServiceImpl;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClimaServiceTest {

    @Mock private DatoClimaRepository datoClimaRepository;
    @Mock private PronosticoRepository pronosticoRepository;
    @Mock private LoteRepository loteRepository;
    @Mock private AlertaClimaService alertaClimaService;
    @Mock private ClimaProperties properties;
    @Mock private RestClient restClient;

    @InjectMocks
    private ClimaServiceImpl climaService;

    private Lote lote;
    private DatoClima dato;
    private Pronostico pronostico;

    @BeforeEach
    void setUp() {
        lote = new Lote();
        lote.setNombre("Campo Norte");
        lote.setLatitud(new BigDecimal("-34.6037"));
        lote.setLongitud(new BigDecimal("-58.3816"));
        lote.setCultivo("SOJA");
        lote.setTemporada("2024/25");
        setId(lote, "lote-001");

        dato = DatoClima.builder()
                .lote(lote)
                .timestampUtc(LocalDateTime.now())
                .temperatura(new BigDecimal("22.5"))
                .sensacionTermica(new BigDecimal("21.0"))
                .tempMin(new BigDecimal("18.0"))
                .tempMax(new BigDecimal("26.0"))
                .humedadPct(65)
                .presionHpa(1013)
                .velocidadViento(new BigDecimal("3.5"))
                .descripcion("cielo claro")
                .iconoCodigo("01d")
                .condicionCodigo(800)
                .build();
        setId(dato, "dato-001");
        setCreatedAt(dato, LocalDateTime.now());

        pronostico = Pronostico.builder()
                .lote(lote)
                .fecha(LocalDate.now().plusDays(1))
                .tempMax(new BigDecimal("28.0"))
                .tempMin(new BigDecimal("16.0"))
                .humedadPct(55)
                .probabilidadLluvia(new BigDecimal("20.0"))
                .precipitacionMm(new BigDecimal("0.0"))
                .descripcion("parcialmente nublado")
                .iconoCodigo("02d")
                .build();
        setId(pronostico, "pron-001");
        setCreatedAt(pronostico, LocalDateTime.now());
    }

    // ── sincronizarLote ──────────────────────────────────────────────────

    @Test
    void sincronizarLote_sinProveedorConfigurado_deberiaLanzarBusinessException() {
        when(properties.isConfigured()).thenReturn(false);

        assertThatThrownBy(() -> climaService.sincronizarLote("lote-001"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Open-Meteo");
    }

    @Test
    void sincronizarLote_conLoteInexistente_deberiaLanzarResourceNotFoundException() {
        when(properties.isConfigured()).thenReturn(true);
        when(loteRepository.findActiveById("no-existe")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> climaService.sincronizarLote("no-existe"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void sincronizarLote_sinCoordenadas_deberiaLanzarBusinessException() {
        lote.setLatitud(null);
        lote.setLongitud(null);
        when(properties.isConfigured()).thenReturn(true);
        when(loteRepository.findActiveById("lote-001")).thenReturn(Optional.of(lote));

        assertThatThrownBy(() -> climaService.sincronizarLote("lote-001"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("coordenadas");
    }

    // ── obtenerActual ────────────────────────────────────────────────────

    @Test
    void obtenerActual_cuandoExisteDato_deberiaRetornarResponse() {
        when(datoClimaRepository.findUltimoByLoteId("lote-001")).thenReturn(Optional.of(dato));

        Optional<DatoClimaResponse> resultado = climaService.obtenerActual("lote-001");

        assertThat(resultado).isPresent();
        assertThat(resultado.get().temperatura()).isEqualByComparingTo("22.5");
        assertThat(resultado.get().descripcion()).isEqualTo("cielo claro");
    }

    @Test
    void obtenerActual_sinDatos_deberiaRetornarVacio() {
        when(datoClimaRepository.findUltimoByLoteId("lote-001")).thenReturn(Optional.empty());

        assertThat(climaService.obtenerActual("lote-001")).isEmpty();
    }

    // ── obtenerPronostico ─────────────────────────────────────────────────

    @Test
    void obtenerPronostico_deberiaRetornarListaOrdenada() {
        when(pronosticoRepository.findByLoteIdDesde(eq("lote-001"), any(LocalDate.class)))
                .thenReturn(List.of(pronostico));

        List<PronosticoResponse> resultado = climaService.obtenerPronostico("lote-001");

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).tempMax()).isEqualByComparingTo("28.0");
    }

    @Test
    void obtenerPronostico_sinDatos_deberiaRetornarVacio() {
        when(pronosticoRepository.findByLoteIdDesde(eq("lote-001"), any())).thenReturn(List.of());

        assertThat(climaService.obtenerPronostico("lote-001")).isEmpty();
    }

    // ── obtenerHistorico ──────────────────────────────────────────────────

    @Test
    void obtenerHistorico_deberiaRespetar_limiteRetencion() {
        when(datoClimaRepository.findHistorico(eq("lote-001"), any(LocalDateTime.class)))
                .thenReturn(List.of(dato));

        // Con días > retencion, se usa el límite de retención
        List<DatoClimaResponse> resultado = climaService.obtenerHistorico("lote-001", 7);

        assertThat(resultado).isNotEmpty();
    }

    // ── sincronizarTodosLotes ─────────────────────────────────────────────

    @Test
    void sincronizarTodosLotes_sinProveedorConfigurado_deberiaOmitirSinExcepcion() {
        when(properties.isConfigured()).thenReturn(false);

        assertThatNoException().isThrownBy(() -> climaService.sincronizarTodosLotes());
        verify(loteRepository, never()).findAllActive();
    }

    @Test
    void sincronizarTodosLotes_sinCoordenadas_deberiaFiltrarLotes() {
        Lote loteSinCoords = new Lote();
        loteSinCoords.setNombre("Sin coords");
        setId(loteSinCoords, "lote-sin-coords");

        when(properties.isConfigured()).thenReturn(true);
        when(loteRepository.findAllActive()).thenReturn(List.of(loteSinCoords));

        // No debe hacer ninguna llamada HTTP (el lote sin coords se filtra)
        climaService.sincronizarTodosLotes();

        verify(datoClimaRepository, never()).save(any());
    }

    // ── helpers ──────────────────────────────────────────────────────────

    private void setId(Object entity, String id) {
        try {
            var field = com.campoapp.common.entity.AuditableEntity.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) { throw new RuntimeException(e); }
    }

    private void setCreatedAt(Object entity, LocalDateTime value) {
        try {
            var field = com.campoapp.common.entity.AuditableEntity.class.getDeclaredField("createdAt");
            field.setAccessible(true);
            field.set(entity, value);
        } catch (Exception e) { throw new RuntimeException(e); }
    }
}
