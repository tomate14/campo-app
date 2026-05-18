package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.EventoSiembraRequest;
import com.campoapp.agricultura.dto.EventoSiembraResponse;
import com.campoapp.agricultura.entity.EventoSiembra;
import com.campoapp.agricultura.entity.EventoSiembra.TipoEvento;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.EventoSiembraRepository;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.service.SiembraService;
import com.campoapp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SiembraServiceImpl implements SiembraService {

    private final EventoSiembraRepository eventoRepository;
    private final LoteRepository loteRepository;

    @Override
    public List<EventoSiembraResponse> listarPorLote(String loteId) {
        return eventoRepository.findByLoteId(loteId).stream().map(this::toResponse).toList();
    }

    @Override
    public List<EventoSiembraResponse> listarPorLoteYTipo(String loteId, TipoEvento tipo) {
        return eventoRepository.findByLoteIdAndTipo(loteId, tipo).stream().map(this::toResponse).toList();
    }

    @Override
    public List<EventoSiembraResponse> listarPorRangoDeFechas(LocalDate desde, LocalDate hasta) {
        return eventoRepository.findByFechaBetween(desde, hasta).stream().map(this::toResponse).toList();
    }

    @Override
    public EventoSiembraResponse buscarPorId(String id) {
        return toResponse(findActiveOrThrow(id));
    }

    @Override
    @Transactional
    public EventoSiembraResponse registrar(EventoSiembraRequest request) {
        Lote lote = loteRepository.findActiveById(request.loteId())
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado con id: " + request.loteId()));

        EventoSiembra evento = EventoSiembra.builder()
                .lote(lote)
                .tipoEvento(request.tipoEvento())
                .estadoFenologico(request.estadoFenologico())
                .descripcion(request.descripcion())
                .fecha(request.fecha())
                .build();

        return toResponse(eventoRepository.save(evento));
    }

    @Override
    @Transactional
    public EventoSiembraResponse actualizar(String id, EventoSiembraRequest request) {
        EventoSiembra evento = findActiveOrThrow(id);
        evento.setTipoEvento(request.tipoEvento());
        evento.setEstadoFenologico(request.estadoFenologico());
        evento.setDescripcion(request.descripcion());
        evento.setFecha(request.fecha());
        return toResponse(eventoRepository.save(evento));
    }

    @Override
    @Transactional
    public void eliminar(String id) {
        EventoSiembra evento = findActiveOrThrow(id);
        evento.softDelete();
        eventoRepository.save(evento);
    }

    private EventoSiembra findActiveOrThrow(String id) {
        return eventoRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento de siembra no encontrado con id: " + id));
    }

    private EventoSiembraResponse toResponse(EventoSiembra e) {
        return new EventoSiembraResponse(
                e.getId(),
                e.getLote().getId(),
                e.getLote().getNombre(),
                e.getTipoEvento(),
                e.getEstadoFenologico(),
                e.getDescripcion(),
                e.getFecha(),
                e.getCreatedAt()
        );
    }
}
