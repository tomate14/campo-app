package com.campoapp.agricultura;

import com.campoapp.agricultura.dto.LoteRequest;
import com.campoapp.agricultura.dto.LoteResponse;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.service.impl.LoteServiceImpl;
import com.campoapp.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoteServiceTest {

    @Mock
    private LoteRepository loteRepository;

    @InjectMocks
    private LoteServiceImpl loteService;

    private Lote loteEjemplo;

    @BeforeEach
    void setUp() {
        loteEjemplo = new Lote();
        loteEjemplo.setNombre("Lote Norte");
        loteEjemplo.setArea(new BigDecimal("120.50"));
        loteEjemplo.setCultivo("SOJA");
        loteEjemplo.setTemporada("2024/2025");
    }

    @Test
    void shouldReturnAllActiveLotes_whenListarTodosIsCalled() {
        when(loteRepository.findAllActive()).thenReturn(List.of(loteEjemplo));

        List<LoteResponse> result = loteService.listarTodos();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).nombre()).isEqualTo("Lote Norte");
        verify(loteRepository).findAllActive();
    }

    @Test
    void shouldReturnLote_whenValidIdProvided() {
        when(loteRepository.findActiveById("abc-123")).thenReturn(Optional.of(loteEjemplo));

        LoteResponse result = loteService.buscarPorId("abc-123");

        assertThat(result.nombre()).isEqualTo("Lote Norte");
        assertThat(result.cultivo()).isEqualTo("SOJA");
    }

    @Test
    void shouldThrowResourceNotFoundException_whenLoteDoesNotExist() {
        when(loteRepository.findActiveById("nonexistent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loteService.buscarPorId("nonexistent"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("nonexistent");
    }

    @Test
    void shouldCreateLote_whenValidRequestProvided() {
        LoteRequest request = new LoteRequest("Lote Sur", new BigDecimal("80.00"), "MAIZ",
                new BigDecimal("-34.5"), new BigDecimal("-58.3"), "2024/2025");

        when(loteRepository.save(any(Lote.class))).thenReturn(loteEjemplo);

        LoteResponse result = loteService.crear(request);

        assertThat(result).isNotNull();
        verify(loteRepository).save(any(Lote.class));
    }

    @Test
    void shouldSoftDeleteLote_whenEliminarIsCalled() {
        when(loteRepository.findActiveById("abc-123")).thenReturn(Optional.of(loteEjemplo));
        when(loteRepository.save(any(Lote.class))).thenReturn(loteEjemplo);

        loteService.eliminar("abc-123");

        assertThat(loteEjemplo.getDeletedAt()).isNotNull();
        verify(loteRepository).save(loteEjemplo);
    }
}
