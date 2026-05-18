package com.campoapp.agricultura;

import com.campoapp.agricultura.dto.EventoSiembraRequest;
import com.campoapp.agricultura.dto.EventoSiembraResponse;
import com.campoapp.agricultura.entity.EventoSiembra;
import com.campoapp.agricultura.entity.EventoSiembra.TipoEvento;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.EventoSiembraRepository;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.service.impl.SiembraServiceImpl;
import com.campoapp.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SiembraServiceTest {

    @Mock private EventoSiembraRepository eventoRepository;
    @Mock private LoteRepository loteRepository;

    @InjectMocks
    private SiembraServiceImpl siembraService;

    private Lote lote;
    private EventoSiembra evento;

    @BeforeEach
    void setUp() {
        lote = new Lote();
        lote.setNombre("Lote A");
        lote.setArea(new BigDecimal("100.0"));
        lote.setCultivo("SOJA");
        lote.setTemporada("2024/2025");

        evento = new EventoSiembra();
        evento.setLote(lote);
        evento.setTipoEvento(TipoEvento.SIEMBRA);
        evento.setFecha(LocalDate.of(2024, 10, 1));
        evento.setDescripcion("Siembra de soja en lote A");
    }

    @Test
    void shouldReturnEventos_whenListarPorLoteIsCalled() {
        when(eventoRepository.findByLoteId("lote-1")).thenReturn(List.of(evento));

        List<EventoSiembraResponse> result = siembraService.listarPorLote("lote-1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).tipoEvento()).isEqualTo(TipoEvento.SIEMBRA);
    }

    @Test
    void shouldRegisterEvento_whenValidRequestProvided() {
        EventoSiembraRequest request = new EventoSiembraRequest(
                "lote-1", TipoEvento.MONITOREO_FENOLOGICO, "V4",
                "Cultivo en estadio V4", LocalDate.now());

        when(loteRepository.findActiveById("lote-1")).thenReturn(Optional.of(lote));
        when(eventoRepository.save(any(EventoSiembra.class))).thenReturn(evento);

        EventoSiembraResponse result = siembraService.registrar(request);

        assertThat(result).isNotNull();
        verify(eventoRepository).save(any(EventoSiembra.class));
    }

    @Test
    void shouldThrowResourceNotFoundException_whenLoteNotFound() {
        EventoSiembraRequest request = new EventoSiembraRequest(
                "nonexistent", TipoEvento.SIEMBRA, null, null, LocalDate.now());

        when(loteRepository.findActiveById("nonexistent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> siembraService.registrar(request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void shouldSoftDeleteEvento_whenEliminarIsCalled() {
        when(eventoRepository.findActiveById("ev-1")).thenReturn(Optional.of(evento));
        when(eventoRepository.save(any())).thenReturn(evento);

        siembraService.eliminar("ev-1");

        assertThat(evento.getDeletedAt()).isNotNull();
        verify(eventoRepository).save(evento);
    }
}
