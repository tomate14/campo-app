package com.campoapp.agricultura;

import com.campoapp.agricultura.dto.PropiedadSueloRequest;
import com.campoapp.agricultura.dto.PropiedadSueloResponse;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.PropiedadSuelo;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.PropiedadSueloRepository;
import com.campoapp.agricultura.service.impl.SueloServiceImpl;
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
class SueloServiceTest {

    @Mock
    private PropiedadSueloRepository sueloRepository;

    @Mock
    private LoteRepository loteRepository;

    @InjectMocks
    private SueloServiceImpl sueloService;

    private Lote lote;
    private PropiedadSuelo suelo;
    private PropiedadSueloRequest request;

    @BeforeEach
    void setUp() {
        lote = new Lote();
        lote.setNombre("Lote Sur");
        lote.setArea(new BigDecimal("85.0"));
        lote.setCultivo("MAIZ");
        lote.setTemporada("2023/24");

        setIdViaReflection(lote, "lote-abc");

        suelo = PropiedadSuelo.builder()
                .lote(lote)
                .fecha(LocalDate.of(2024, 3, 10))
                .ph(new BigDecimal("6.8"))
                .nitrogenoKgHa(new BigDecimal("42.0"))
                .fosforoKgHa(new BigDecimal("18.5"))
                .potasioKgHa(new BigDecimal("210.0"))
                .materiaOrganicaPct(new BigDecimal("3.2"))
                .conductividadElectrica(new BigDecimal("0.45"))
                .observaciones("Análisis previo a siembra")
                .build();

        setIdViaReflection(suelo, "suelo-xyz");
        setCreatedAtViaReflection(suelo, LocalDateTime.now());

        request = new PropiedadSueloRequest(
                "lote-abc",
                LocalDate.of(2024, 3, 10),
                new BigDecimal("6.8"),
                new BigDecimal("42.0"),
                new BigDecimal("18.5"),
                new BigDecimal("210.0"),
                new BigDecimal("3.2"),
                new BigDecimal("0.45"),
                "Análisis previo a siembra"
        );
    }

    // ── listarPorLote ────────────────────────────────────────────────────

    @Test
    void listarPorLote_deberiaRetornarListaDeAnalisis() {
        when(sueloRepository.findByLoteId("lote-abc")).thenReturn(List.of(suelo));

        List<PropiedadSueloResponse> resultado = sueloService.listarPorLote("lote-abc");

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).ph()).isEqualByComparingTo("6.8");
        assertThat(resultado.get(0).loteNombre()).isEqualTo("Lote Sur");
    }

    @Test
    void listarPorLote_sinAnalisis_deberiaRetornarListaVacia() {
        when(sueloRepository.findByLoteId("lote-abc")).thenReturn(List.of());

        assertThat(sueloService.listarPorLote("lote-abc")).isEmpty();
    }

    // ── ultimoAnalisis ───────────────────────────────────────────────────

    @Test
    void ultimoAnalisis_cuandoExiste_deberiaRetornarOptionalConDatos() {
        when(sueloRepository.findUltimoAnalisis("lote-abc")).thenReturn(Optional.of(suelo));

        var resultado = sueloService.ultimoAnalisis("lote-abc");

        assertThat(resultado).isPresent();
        assertThat(resultado.get().nitrogenoKgHa()).isEqualByComparingTo("42.0");
    }

    @Test
    void ultimoAnalisis_sinHistorial_deberiaRetornarVacio() {
        when(sueloRepository.findUltimoAnalisis("lote-abc")).thenReturn(Optional.empty());

        assertThat(sueloService.ultimoAnalisis("lote-abc")).isEmpty();
    }

    // ── buscarPorId ──────────────────────────────────────────────────────

    @Test
    void buscarPorId_cuandoExiste_deberiaRetornarResponse() {
        when(sueloRepository.findActiveById("suelo-xyz")).thenReturn(Optional.of(suelo));

        PropiedadSueloResponse response = sueloService.buscarPorId("suelo-xyz");

        assertThat(response.id()).isEqualTo("suelo-xyz");
        assertThat(response.ph()).isEqualByComparingTo("6.8");
    }

    @Test
    void buscarPorId_cuandoNoExiste_deberiaLanzarException() {
        when(sueloRepository.findActiveById("inexistente")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sueloService.buscarPorId("inexistente"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("inexistente");
    }

    // ── registrar ────────────────────────────────────────────────────────

    @Test
    void registrar_conDatosValidos_deberiaGuardarYRetornarResponse() {
        when(loteRepository.findActiveById("lote-abc")).thenReturn(Optional.of(lote));
        when(sueloRepository.save(any(PropiedadSuelo.class))).thenReturn(suelo);

        PropiedadSueloResponse response = sueloService.registrar(request);

        assertThat(response.loteId()).isEqualTo("lote-abc");
        assertThat(response.ph()).isEqualByComparingTo("6.8");
        verify(sueloRepository).save(any(PropiedadSuelo.class));
    }

    @Test
    void registrar_conLoteInexistente_deberiaLanzarException() {
        when(loteRepository.findActiveById("lote-abc")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sueloService.registrar(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("lote-abc");

        verify(sueloRepository, never()).save(any());
    }

    // ── actualizar ───────────────────────────────────────────────────────

    @Test
    void actualizar_cuandoExiste_deberiaActualizarCampos() {
        PropiedadSueloRequest requestActualizado = new PropiedadSueloRequest(
                "lote-abc",
                LocalDate.of(2024, 6, 1),
                new BigDecimal("7.1"),
                new BigDecimal("50.0"),
                null, null, null, null,
                "Segunda muestra"
        );
        when(sueloRepository.findActiveById("suelo-xyz")).thenReturn(Optional.of(suelo));
        when(sueloRepository.save(any(PropiedadSuelo.class))).thenReturn(suelo);

        sueloService.actualizar("suelo-xyz", requestActualizado);

        assertThat(suelo.getPh()).isEqualByComparingTo("7.1");
        assertThat(suelo.getNitrogenoKgHa()).isEqualByComparingTo("50.0");
        verify(sueloRepository).save(suelo);
    }

    // ── eliminar (soft delete) ───────────────────────────────────────────

    @Test
    void eliminar_cuandoExiste_deberiaMarcarSoftDelete() {
        when(sueloRepository.findActiveById("suelo-xyz")).thenReturn(Optional.of(suelo));
        when(sueloRepository.save(any())).thenReturn(suelo);

        sueloService.eliminar("suelo-xyz");

        assertThat(suelo.getDeletedAt()).isNotNull();
        verify(sueloRepository).save(suelo);
    }

    @Test
    void eliminar_cuandoNoExiste_deberiaLanzarException() {
        when(sueloRepository.findActiveById("fantasma")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sueloService.eliminar("fantasma"))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(sueloRepository, never()).save(any());
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
