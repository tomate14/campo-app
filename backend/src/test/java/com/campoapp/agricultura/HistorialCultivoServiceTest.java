package com.campoapp.agricultura;

import com.campoapp.agricultura.dto.HistoricoCultivoRequest;
import com.campoapp.agricultura.dto.HistoricoCultivoResponse;
import com.campoapp.agricultura.dto.RotacionRecomendacionResponse;
import com.campoapp.agricultura.entity.HistoricoCultivo;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.HistoricoCultivoRepository;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.service.impl.HistorialCultivoServiceImpl;
import com.campoapp.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HistorialCultivoServiceTest {

    @Mock
    private HistoricoCultivoRepository historialRepository;

    @Mock
    private LoteRepository loteRepository;

    @InjectMocks
    private HistorialCultivoServiceImpl historialService;

    private Lote lote;
    private HistoricoCultivo historico;
    private HistoricoCultivoRequest request;

    @BeforeEach
    void setUp() {
        lote = new Lote();
        lote.setNombre("Lote Este");
        lote.setArea(new BigDecimal("200.0"));
        lote.setCultivo("SOJA");
        lote.setTemporada("2023/24");
        setIdViaReflection(lote, "lote-001");

        historico = HistoricoCultivo.builder()
                .lote(lote)
                .cultivo("SOJA")
                .temporada("2023/24")
                .fechaSiembra(LocalDate.of(2023, 11, 1))
                .fechaCosecha(LocalDate.of(2024, 4, 15))
                .rendimientoKgHa(new BigDecimal("3800.0"))
                .observaciones("Buen ciclo")
                .build();
        setIdViaReflection(historico, "hist-001");
        setCreatedAtViaReflection(historico, LocalDateTime.now());

        request = new HistoricoCultivoRequest(
                "lote-001", "SOJA", "2023/24",
                LocalDate.of(2023, 11, 1),
                LocalDate.of(2024, 4, 15),
                new BigDecimal("3800.0"),
                "Buen ciclo"
        );
    }

    // ── listarPorLote ────────────────────────────────────────────────────

    @Test
    void listarPorLote_deberiaRetornarHistorialDelLote() {
        when(historialRepository.findByLoteId("lote-001")).thenReturn(List.of(historico));

        List<HistoricoCultivoResponse> resultado = historialService.listarPorLote("lote-001");

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).cultivo()).isEqualTo("SOJA");
        assertThat(resultado.get(0).temporada()).isEqualTo("2023/24");
    }

    @Test
    void listarPorLote_sinRegistros_deberiaRetornarVacio() {
        when(historialRepository.findByLoteId("lote-vacío")).thenReturn(List.of());

        assertThat(historialService.listarPorLote("lote-vacío")).isEmpty();
    }

    // ── buscarPorId ──────────────────────────────────────────────────────

    @Test
    void buscarPorId_cuandoExiste_deberiaRetornarResponse() {
        when(historialRepository.findActiveById("hist-001")).thenReturn(Optional.of(historico));

        HistoricoCultivoResponse response = historialService.buscarPorId("hist-001");

        assertThat(response.id()).isEqualTo("hist-001");
        assertThat(response.rendimientoKgHa()).isEqualByComparingTo("3800.0");
    }

    @Test
    void buscarPorId_cuandoNoExiste_deberiaLanzarException() {
        when(historialRepository.findActiveById("no-existe")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> historialService.buscarPorId("no-existe"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("no-existe");
    }

    // ── registrar ────────────────────────────────────────────────────────

    @Test
    void registrar_conDatosValidos_deberiaGuardarYRetornarResponse() {
        when(loteRepository.findActiveById("lote-001")).thenReturn(Optional.of(lote));
        when(historialRepository.save(any(HistoricoCultivo.class))).thenReturn(historico);

        HistoricoCultivoResponse response = historialService.registrar(request);

        assertThat(response.cultivo()).isEqualTo("SOJA");
        assertThat(response.loteId()).isEqualTo("lote-001");
        verify(historialRepository).save(any(HistoricoCultivo.class));
    }

    @Test
    void registrar_conLoteInexistente_deberiaLanzarException() {
        when(loteRepository.findActiveById("lote-001")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> historialService.registrar(request))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(historialRepository, never()).save(any());
    }

    // ── actualizar ───────────────────────────────────────────────────────

    @Test
    void actualizar_cuandoExiste_deberiaModificarCampos() {
        HistoricoCultivoRequest actualizado = new HistoricoCultivoRequest(
                "lote-001", "MAIZ", "2024/25",
                LocalDate.of(2024, 10, 1), null,
                new BigDecimal("9000.0"), null
        );
        when(historialRepository.findActiveById("hist-001")).thenReturn(Optional.of(historico));
        when(historialRepository.save(any(HistoricoCultivo.class))).thenReturn(historico);

        historialService.actualizar("hist-001", actualizado);

        assertThat(historico.getCultivo()).isEqualTo("MAIZ");
        assertThat(historico.getTemporada()).isEqualTo("2024/25");
        assertThat(historico.getRendimientoKgHa()).isEqualByComparingTo("9000.0");
        verify(historialRepository).save(historico);
    }

    // ── eliminar ─────────────────────────────────────────────────────────

    @Test
    void eliminar_cuandoExiste_deberiaMarcarSoftDelete() {
        when(historialRepository.findActiveById("hist-001")).thenReturn(Optional.of(historico));
        when(historialRepository.save(any())).thenReturn(historico);

        historialService.eliminar("hist-001");

        assertThat(historico.getDeletedAt()).isNotNull();
        verify(historialRepository).save(historico);
    }

    // ── recomendarRotacion ───────────────────────────────────────────────

    @Test
    void recomendarRotacion_conUltimoCultivoSoja_deberiaRecomendarMaizTrigoGirasol() {
        when(loteRepository.findActiveById("lote-001")).thenReturn(Optional.of(lote));
        when(historialRepository.findUltimoCultivo("lote-001")).thenReturn(Optional.of(historico));
        when(historialRepository.findCultivosDistintos("lote-001")).thenReturn(List.of("SOJA"));

        RotacionRecomendacionResponse rotacion = historialService.recomendarRotacion("lote-001");

        assertThat(rotacion.ultimoCultivo()).isEqualTo("SOJA");
        assertThat(rotacion.cultivosRecomendados()).containsExactlyInAnyOrder("MAIZ", "TRIGO", "GIRASOL");
        assertThat(rotacion.razon()).isNotBlank();
    }

    @Test
    void recomendarRotacion_sinHistorial_deberiaRetornarTodoPermitido() {
        when(loteRepository.findActiveById("lote-001")).thenReturn(Optional.of(lote));
        when(historialRepository.findUltimoCultivo("lote-001")).thenReturn(Optional.empty());
        when(historialRepository.findCultivosDistintos("lote-001")).thenReturn(List.of());

        RotacionRecomendacionResponse rotacion = historialService.recomendarRotacion("lote-001");

        assertThat(rotacion.ultimoCultivo()).isNull();
        assertThat(rotacion.cultivosRecomendados()).isNotEmpty();
        assertThat(rotacion.razon()).contains("Sin historial");
    }

    @Test
    void recomendarRotacion_conLoteInexistente_deberiaLanzarException() {
        when(loteRepository.findActiveById("no-lote")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> historialService.recomendarRotacion("no-lote"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void recomendarRotacion_conUltimoCultivoMaiz_deberiaRecomendarSojaTrigoSorgo() {
        HistoricoCultivo historicoMaiz = HistoricoCultivo.builder()
                .lote(lote)
                .cultivo("MAIZ")
                .temporada("2023/24")
                .build();
        setIdViaReflection(historicoMaiz, "hist-maiz");
        setCreatedAtViaReflection(historicoMaiz, LocalDateTime.now());

        when(loteRepository.findActiveById("lote-001")).thenReturn(Optional.of(lote));
        when(historialRepository.findUltimoCultivo("lote-001")).thenReturn(Optional.of(historicoMaiz));
        when(historialRepository.findCultivosDistintos("lote-001")).thenReturn(List.of("MAIZ"));

        RotacionRecomendacionResponse rotacion = historialService.recomendarRotacion("lote-001");

        assertThat(rotacion.ultimoCultivo()).isEqualTo("MAIZ");
        assertThat(rotacion.cultivosRecomendados()).containsExactlyInAnyOrder("SOJA", "TRIGO", "SORGO");
    }

    // ── helpers ──────────────────────────────────────────────────────────

    private void setIdViaReflection(Object entity, String id) {
        try {
            var field = com.campoapp.common.entity.AuditableEntity.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void setCreatedAtViaReflection(Object entity, LocalDateTime value) {
        try {
            var field = com.campoapp.common.entity.AuditableEntity.class.getDeclaredField("createdAt");
            field.setAccessible(true);
            field.set(entity, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
