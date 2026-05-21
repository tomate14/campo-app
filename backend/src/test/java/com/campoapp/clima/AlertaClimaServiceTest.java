package com.campoapp.clima;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.clima.dto.AlertaClimaResponse;
import com.campoapp.clima.entity.AlertaClima;
import com.campoapp.clima.entity.AlertaClima.Severidad;
import com.campoapp.clima.entity.AlertaClima.TipoAlerta;
import com.campoapp.clima.entity.DatoClima;
import com.campoapp.clima.entity.Pronostico;
import com.campoapp.clima.repository.AlertaClimaRepository;
import com.campoapp.clima.service.impl.AlertaClimaServiceImpl;
import com.campoapp.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertaClimaServiceTest {

    @Mock private AlertaClimaRepository alertaRepository;

    @InjectMocks
    private AlertaClimaServiceImpl alertaService;

    private Lote lote;
    private DatoClima dato;

    @BeforeEach
    void setUp() {
        lote = new Lote();
        lote.setNombre("Lote Test");
        setId(lote, "lote-001");

        dato = DatoClima.builder()
                .lote(lote)
                .timestampUtc(LocalDateTime.now())
                .temperatura(new BigDecimal("22.0"))
                .humedadPct(65)
                .velocidadViento(new BigDecimal("3.0"))
                .condicionCodigo(800)
                .build();
        setId(dato, "dato-001");
        setCreatedAt(dato, LocalDateTime.now());
    }

    // ── generarAlertas — helada ──────────────────────────────────────────

    @Test
    void generarAlertas_conHelada_deberiaCrearAlertaMedia() {
        dato.setTemperatura(new BigDecimal("1.5"));
        when(alertaRepository.findActivaByTipoDesde(eq("lote-001"), eq(TipoAlerta.HELADA), any()))
                .thenReturn(List.of());

        alertaService.generarAlertas(lote, dato, List.of());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<AlertaClima>> captor = ArgumentCaptor.forClass(List.class);
        verify(alertaRepository).saveAll(captor.capture());

        List<AlertaClima> guardadas = captor.getValue();
        assertThat(guardadas).anyMatch(a ->
                a.getTipoAlerta() == TipoAlerta.HELADA && a.getSeveridad() == Severidad.MEDIA);
    }

    @Test
    void generarAlertas_conHeladaCritica_deberiaCrearAlertaCritica() {
        dato.setTemperatura(new BigDecimal("-3.0"));
        when(alertaRepository.findActivaByTipoDesde(eq("lote-001"), eq(TipoAlerta.HELADA), any()))
                .thenReturn(List.of());

        alertaService.generarAlertas(lote, dato, List.of());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<AlertaClima>> captor = ArgumentCaptor.forClass(List.class);
        verify(alertaRepository).saveAll(captor.capture());

        assertThat(captor.getValue()).anyMatch(a ->
                a.getTipoAlerta() == TipoAlerta.HELADA && a.getSeveridad() == Severidad.CRITICA);
    }

    @Test
    void generarAlertas_heladaYaExiste_noDeberiaCrearDuplicado() {
        dato.setTemperatura(new BigDecimal("1.0"));
        AlertaClima existente = AlertaClima.builder().lote(lote).tipoAlerta(TipoAlerta.HELADA)
                .severidad(Severidad.MEDIA).mensaje("test").fecha(LocalDateTime.now()).build();
        when(alertaRepository.findActivaByTipoDesde(eq("lote-001"), eq(TipoAlerta.HELADA), any()))
                .thenReturn(List.of(existente));

        alertaService.generarAlertas(lote, dato, List.of());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<AlertaClima>> captor = ArgumentCaptor.forClass(List.class);
        verify(alertaRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).noneMatch(a -> a.getTipoAlerta() == TipoAlerta.HELADA);
    }

    // ── generarAlertas — viento ──────────────────────────────────────────

    @Test
    void generarAlertas_conVientoFuerte_deberiaCrearAlerta() {
        dato.setVelocidadViento(new BigDecimal("15.0"));
        when(alertaRepository.findActivaByTipoDesde(eq("lote-001"), eq(TipoAlerta.VIENTO_FUERTE), any()))
                .thenReturn(List.of());

        alertaService.generarAlertas(lote, dato, List.of());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<AlertaClima>> captor = ArgumentCaptor.forClass(List.class);
        verify(alertaRepository).saveAll(captor.capture());

        assertThat(captor.getValue()).anyMatch(a -> a.getTipoAlerta() == TipoAlerta.VIENTO_FUERTE);
    }

    // ── generarAlertas — granizo/tormenta ────────────────────────────────

    @Test
    void generarAlertas_conGranizo_deberiaCrearAlertaCritica() {
        dato.setCondicionCodigo(906);
        when(alertaRepository.findActivaByTipoDesde(eq("lote-001"), eq(TipoAlerta.GRANIZO), any()))
                .thenReturn(List.of());

        alertaService.generarAlertas(lote, dato, List.of());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<AlertaClima>> captor = ArgumentCaptor.forClass(List.class);
        verify(alertaRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).anyMatch(a ->
                a.getTipoAlerta() == TipoAlerta.GRANIZO && a.getSeveridad() == Severidad.CRITICA);
    }

    // ── generarAlertas — lluvia excesiva en pronóstico ───────────────────

    @Test
    void generarAlertas_lluviaExcesivaEnPronostico_deberiaCrearAlerta() {
        Pronostico pron = Pronostico.builder()
                .lote(lote)
                .fecha(LocalDate.now().plusDays(1))
                .precipitacionMm(new BigDecimal("45.0"))
                .probabilidadLluvia(new BigDecimal("80.0"))
                .build();
        setId(pron, "pron-001");
        setCreatedAt(pron, LocalDateTime.now());

        when(alertaRepository.findActivaByTipoDesde(eq("lote-001"), eq(TipoAlerta.LLUVIA_EXCESIVA), any()))
                .thenReturn(List.of());

        alertaService.generarAlertas(lote, dato, List.of(pron));

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<AlertaClima>> captor = ArgumentCaptor.forClass(List.class);
        verify(alertaRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).anyMatch(a -> a.getTipoAlerta() == TipoAlerta.LLUVIA_EXCESIVA);
    }

    // ── generarAlertas — condiciones normales ────────────────────────────

    @Test
    void generarAlertas_condicionesNormales_noDeberiaCrearAlertas() {
        // temperatura normal, viento bajo, sin granizo
        alertaService.generarAlertas(lote, dato, List.of());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<AlertaClima>> captor = ArgumentCaptor.forClass(List.class);
        verify(alertaRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).isEmpty();
    }

    // ── marcarLeida ──────────────────────────────────────────────────────

    @Test
    void marcarLeida_cuandoExiste_deberiaDesactivarYMarcar() {
        AlertaClima alerta = AlertaClima.builder()
                .lote(lote).tipoAlerta(TipoAlerta.HELADA)
                .severidad(Severidad.MEDIA).mensaje("test")
                .fecha(LocalDateTime.now()).build();
        setId(alerta, "alerta-001");
        setCreatedAt(alerta, LocalDateTime.now());

        when(alertaRepository.findActiveById("alerta-001")).thenReturn(Optional.of(alerta));
        when(alertaRepository.save(any())).thenReturn(alerta);

        alertaService.marcarLeida("alerta-001");

        assertThat(alerta.isLeida()).isTrue();
        assertThat(alerta.isActiva()).isFalse();
        verify(alertaRepository).save(alerta);
    }

    @Test
    void marcarLeida_alertaInexistente_deberiaLanzarException() {
        when(alertaRepository.findActiveById("no-existe")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> alertaService.marcarLeida("no-existe"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── listarActivas ────────────────────────────────────────────────────

    @Test
    void listarActivas_deberiaRetornarSoloActivasDelLote() {
        AlertaClima activa = AlertaClima.builder()
                .lote(lote).tipoAlerta(TipoAlerta.VIENTO_FUERTE)
                .severidad(Severidad.MEDIA).mensaje("viento").fecha(LocalDateTime.now()).build();
        setId(activa, "a-001");
        setCreatedAt(activa, LocalDateTime.now());

        when(alertaRepository.findActivasByLoteId("lote-001")).thenReturn(List.of(activa));

        List<AlertaClimaResponse> resultado = alertaService.listarActivas("lote-001");

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).tipoAlerta()).isEqualTo(TipoAlerta.VIENTO_FUERTE);
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
