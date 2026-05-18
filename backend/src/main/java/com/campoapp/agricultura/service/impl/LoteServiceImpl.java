package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.LoteRequest;
import com.campoapp.agricultura.dto.LoteResponse;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.service.LoteService;
import com.campoapp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LoteServiceImpl implements LoteService {

    private final LoteRepository loteRepository;

    @Override
    public List<LoteResponse> listarTodos() {
        return loteRepository.findAllActive().stream().map(this::toResponse).toList();
    }

    @Override
    public List<LoteResponse> listarPorTemporada(String temporada) {
        return loteRepository.findByTemporada(temporada).stream().map(this::toResponse).toList();
    }

    @Override
    public List<LoteResponse> listarPorCultivo(String cultivo) {
        return loteRepository.findByCultivo(cultivo).stream().map(this::toResponse).toList();
    }

    @Override
    public LoteResponse buscarPorId(String id) {
        return toResponse(findActiveOrThrow(id));
    }

    @Override
    @Transactional
    public LoteResponse crear(LoteRequest request) {
        Lote lote = Lote.builder()
                .nombre(request.nombre())
                .area(request.area())
                .cultivo(request.cultivo())
                .latitud(request.latitud())
                .longitud(request.longitud())
                .temporada(request.temporada())
                .poligono(request.poligono())
                .build();
        return toResponse(loteRepository.save(lote));
    }

    @Override
    @Transactional
    public LoteResponse actualizar(String id, LoteRequest request) {
        Lote lote = findActiveOrThrow(id);
        lote.setNombre(request.nombre());
        lote.setArea(request.area());
        lote.setCultivo(request.cultivo());
        lote.setLatitud(request.latitud());
        lote.setLongitud(request.longitud());
        lote.setTemporada(request.temporada());
        lote.setPoligono(request.poligono());
        return toResponse(loteRepository.save(lote));
    }

    @Override
    @Transactional
    public void eliminar(String id) {
        Lote lote = findActiveOrThrow(id);
        lote.softDelete();
        loteRepository.save(lote);
    }

    private Lote findActiveOrThrow(String id) {
        return loteRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado con id: " + id));
    }

    private LoteResponse toResponse(Lote lote) {
        return new LoteResponse(
                lote.getId(),
                lote.getNombre(),
                lote.getArea(),
                lote.getCultivo(),
                lote.getLatitud(),
                lote.getLongitud(),
                lote.getTemporada(),
                lote.getPoligono(),
                lote.getCreatedAt(),
                lote.getUpdatedAt()
        );
    }
}
