package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.PropiedadSueloRequest;
import com.campoapp.agricultura.dto.PropiedadSueloResponse;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.PropiedadSuelo;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.PropiedadSueloRepository;
import com.campoapp.agricultura.service.SueloService;
import com.campoapp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SueloServiceImpl implements SueloService {

    private final PropiedadSueloRepository sueloRepository;
    private final LoteRepository loteRepository;

    @Override
    public List<PropiedadSueloResponse> listarPorLote(String loteId) {
        return sueloRepository.findByLoteId(loteId).stream().map(this::toResponse).toList();
    }

    @Override
    public Optional<PropiedadSueloResponse> ultimoAnalisis(String loteId) {
        return sueloRepository.findUltimoAnalisis(loteId).map(this::toResponse);
    }

    @Override
    public PropiedadSueloResponse buscarPorId(String id) {
        return toResponse(findActiveOrThrow(id));
    }

    @Override
    @Transactional
    public PropiedadSueloResponse registrar(PropiedadSueloRequest request) {
        Lote lote = loteRepository.findActiveById(request.loteId())
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado: " + request.loteId()));

        PropiedadSuelo suelo = PropiedadSuelo.builder()
                .lote(lote)
                .fecha(request.fecha())
                .ph(request.ph())
                .nitrogenoKgHa(request.nitrogenoKgHa())
                .fosforoKgHa(request.fosforoKgHa())
                .potasioKgHa(request.potasioKgHa())
                .materiaOrganicaPct(request.materiaOrganicaPct())
                .conductividadElectrica(request.conductividadElectrica())
                .observaciones(request.observaciones())
                .build();

        return toResponse(sueloRepository.save(suelo));
    }

    @Override
    @Transactional
    public PropiedadSueloResponse actualizar(String id, PropiedadSueloRequest request) {
        PropiedadSuelo suelo = findActiveOrThrow(id);
        suelo.setFecha(request.fecha());
        suelo.setPh(request.ph());
        suelo.setNitrogenoKgHa(request.nitrogenoKgHa());
        suelo.setFosforoKgHa(request.fosforoKgHa());
        suelo.setPotasioKgHa(request.potasioKgHa());
        suelo.setMateriaOrganicaPct(request.materiaOrganicaPct());
        suelo.setConductividadElectrica(request.conductividadElectrica());
        suelo.setObservaciones(request.observaciones());
        return toResponse(sueloRepository.save(suelo));
    }

    @Override
    @Transactional
    public void eliminar(String id) {
        PropiedadSuelo suelo = findActiveOrThrow(id);
        suelo.softDelete();
        sueloRepository.save(suelo);
    }

    private PropiedadSuelo findActiveOrThrow(String id) {
        return sueloRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Análisis de suelo no encontrado: " + id));
    }

    private PropiedadSueloResponse toResponse(PropiedadSuelo s) {
        return new PropiedadSueloResponse(
                s.getId(), s.getLote().getId(), s.getLote().getNombre(),
                s.getFecha(), s.getPh(), s.getNitrogenoKgHa(), s.getFosforoKgHa(),
                s.getPotasioKgHa(), s.getMateriaOrganicaPct(), s.getConductividadElectrica(),
                s.getObservaciones(), s.getCreatedAt()
        );
    }
}
