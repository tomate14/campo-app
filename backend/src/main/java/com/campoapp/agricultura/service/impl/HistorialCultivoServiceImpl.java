package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.HistoricoCultivoRequest;
import com.campoapp.agricultura.dto.HistoricoCultivoResponse;
import com.campoapp.agricultura.dto.RotacionRecomendacionResponse;
import com.campoapp.agricultura.entity.HistoricoCultivo;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.HistoricoCultivoRepository;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.service.HistorialCultivoService;
import com.campoapp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HistorialCultivoServiceImpl implements HistorialCultivoService {

    private final HistoricoCultivoRepository historialRepository;
    private final LoteRepository loteRepository;

    /* Reglas básicas de rotación para la región pampeana */
    private static final Map<String, List<String>> ROTACION_RECOMENDADA = Map.of(
            "SOJA",    List.of("MAIZ", "TRIGO", "GIRASOL"),
            "MAIZ",    List.of("SOJA", "TRIGO", "SORGO"),
            "TRIGO",   List.of("SOJA", "GIRASOL", "MAIZ"),
            "GIRASOL", List.of("SOJA", "TRIGO", "MAIZ"),
            "SORGO",   List.of("SOJA", "MAIZ", "TRIGO")
    );

    private static final Map<String, String> RAZON_ROTACION = Map.of(
            "SOJA",    "Evitar monocultivo: reduce nematodos y enfermedades de raíz",
            "MAIZ",    "Romper ciclo de plagas; el trigo o la soja mejoran la estructura del suelo",
            "TRIGO",   "Introducir cultivo de verano para balance de materia orgánica",
            "GIRASOL", "Alternar con leguminosas para fijar nitrógeno",
            "SORGO",   "Rotar con soja para mejorar nitrógeno disponible"
    );

    @Override
    public List<HistoricoCultivoResponse> listarPorLote(String loteId) {
        return historialRepository.findByLoteId(loteId).stream().map(this::toResponse).toList();
    }

    @Override
    public HistoricoCultivoResponse buscarPorId(String id) {
        return toResponse(findActiveOrThrow(id));
    }

    @Override
    @Transactional
    public HistoricoCultivoResponse registrar(HistoricoCultivoRequest request) {
        Lote lote = loteRepository.findActiveById(request.loteId())
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado: " + request.loteId()));

        HistoricoCultivo historico = HistoricoCultivo.builder()
                .lote(lote)
                .cultivo(request.cultivo())
                .temporada(request.temporada())
                .fechaSiembra(request.fechaSiembra())
                .fechaCosecha(request.fechaCosecha())
                .rendimientoKgHa(request.rendimientoKgHa())
                .observaciones(request.observaciones())
                .build();

        return toResponse(historialRepository.save(historico));
    }

    @Override
    @Transactional
    public HistoricoCultivoResponse actualizar(String id, HistoricoCultivoRequest request) {
        HistoricoCultivo h = findActiveOrThrow(id);
        h.setCultivo(request.cultivo());
        h.setTemporada(request.temporada());
        h.setFechaSiembra(request.fechaSiembra());
        h.setFechaCosecha(request.fechaCosecha());
        h.setRendimientoKgHa(request.rendimientoKgHa());
        h.setObservaciones(request.observaciones());
        return toResponse(historialRepository.save(h));
    }

    @Override
    @Transactional
    public void eliminar(String id) {
        HistoricoCultivo h = findActiveOrThrow(id);
        h.softDelete();
        historialRepository.save(h);
    }

    @Override
    public RotacionRecomendacionResponse recomendarRotacion(String loteId) {
        Lote lote = loteRepository.findActiveById(loteId)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado: " + loteId));

        var ultimo = historialRepository.findUltimoCultivo(loteId);
        var cultivosUsados = historialRepository.findCultivosDistintos(loteId);

        if (ultimo.isEmpty()) {
            return new RotacionRecomendacionResponse(
                    loteId, lote.getNombre(), null, null,
                    List.of("SOJA", "MAIZ", "TRIGO"),
                    List.of(),
                    "Sin historial previo — cualquier cultivo es válido para iniciar rotación"
            );
        }

        String ultimoCultivo = ultimo.get().getCultivo().toUpperCase();
        List<String> recomendados = ROTACION_RECOMENDADA.getOrDefault(ultimoCultivo, List.of("SOJA", "MAIZ"));
        List<String> evitar = cultivosUsados.stream()
                .filter(c -> c.equalsIgnoreCase(ultimoCultivo))
                .toList();
        String razon = RAZON_ROTACION.getOrDefault(ultimoCultivo, "Consultar agrónomo para plan de rotación específico");

        return new RotacionRecomendacionResponse(
                loteId, lote.getNombre(),
                ultimo.get().getCultivo(), ultimo.get().getTemporada(),
                recomendados, evitar, razon
        );
    }

    private HistoricoCultivo findActiveOrThrow(String id) {
        return historialRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Histórico de cultivo no encontrado: " + id));
    }

    private HistoricoCultivoResponse toResponse(HistoricoCultivo h) {
        return new HistoricoCultivoResponse(
                h.getId(), h.getLote().getId(), h.getLote().getNombre(),
                h.getCultivo(), h.getTemporada(),
                h.getFechaSiembra(), h.getFechaCosecha(),
                h.getRendimientoKgHa(), h.getObservaciones(), h.getCreatedAt()
        );
    }
}
