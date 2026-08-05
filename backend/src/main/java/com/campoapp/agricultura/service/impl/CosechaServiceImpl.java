package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.RegistroCosechaRequest;
import com.campoapp.agricultura.dto.RegistroCosechaResponse;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.RegistroCosecha;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.RegistroCosechaRepository;
import com.campoapp.agricultura.service.CosechaService;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.utilidades.service.CatalogoUtilidadRegistry;
import com.campoapp.utilidades.service.UtilidadNombreResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CosechaServiceImpl implements CosechaService {

    private final RegistroCosechaRepository cosechaRepository;
    private final LoteRepository loteRepository;
    private final UtilidadNombreResolver utilidadNombreResolver;

    @Override
    public List<RegistroCosechaResponse> listarPorLote(String loteId) {
        List<RegistroCosecha> cosechas = cosechaRepository.findByLoteId(loteId);
        // Batch de destinos y tipos de perdida para evitar N+1 en el listado por lote.
        Map<String, String> destinos = utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.DESTINO_COSECHA,
                cosechas.stream().map(RegistroCosecha::getDestino).toList());
        Map<String, String> tiposPerdida = utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.TIPO_PERDIDA_COSECHA,
                cosechas.stream().map(RegistroCosecha::getTipoPerdida).toList());
        return cosechas.stream().map(c -> toResponse(c, destinos, tiposPerdida)).toList();
    }

    @Override
    public RegistroCosechaResponse buscarPorId(String id) {
        return toResponse(findActiveOrThrow(id));
    }

    @Override
    @Transactional
    public RegistroCosechaResponse registrar(RegistroCosechaRequest request) {
        Lote lote = loteRepository.findActiveById(request.loteId())
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado con id: " + request.loteId()));

        RegistroCosecha cosecha = RegistroCosecha.builder()
                .lote(lote)
                .fecha(request.fecha())
                .rendimientoKgHa(request.rendimientoKgHa())
                .toneladasTotal(request.toneladasTotal())
                .calidadGrano(request.calidadGrano())
                .humedad(request.humedad())
                .observaciones(request.observaciones())
                .areaRealCosechadaPct(request.areaRealCosechadaPct())
                .hectareasCosechadas(request.hectareasCosechadas())
                .perdidaKgHa(request.perdidaKgHa())
                .granosPerdidosKg(request.granosPerdidosKg())
                .tipoPerdida(request.tipoPerdida())
                .destino(request.destino())
                .destinoCantidadTn(request.destinoCantidadTn())
                .build();

        return toResponse(cosechaRepository.save(cosecha));
    }

    @Override
    @Transactional
    public RegistroCosechaResponse actualizar(String id, RegistroCosechaRequest request) {
        RegistroCosecha cosecha = findActiveOrThrow(id);
        cosecha.setFecha(request.fecha());
        cosecha.setRendimientoKgHa(request.rendimientoKgHa());
        cosecha.setToneladasTotal(request.toneladasTotal());
        cosecha.setCalidadGrano(request.calidadGrano());
        cosecha.setHumedad(request.humedad());
        cosecha.setObservaciones(request.observaciones());
        cosecha.setAreaRealCosechadaPct(request.areaRealCosechadaPct());
        cosecha.setHectareasCosechadas(request.hectareasCosechadas());
        cosecha.setPerdidaKgHa(request.perdidaKgHa());
        cosecha.setGranosPerdidosKg(request.granosPerdidosKg());
        cosecha.setTipoPerdida(request.tipoPerdida());
        cosecha.setDestino(request.destino());
        cosecha.setDestinoCantidadTn(request.destinoCantidadTn());
        return toResponse(cosechaRepository.save(cosecha));
    }

    @Override
    @Transactional
    public void eliminar(String id) {
        RegistroCosecha cosecha = findActiveOrThrow(id);
        cosecha.softDelete();
        cosechaRepository.save(cosecha);
    }

    @Override
    public Double calcularRendimientoPromedio(String loteId) {
        return cosechaRepository.calcularRendimientoPromedio(loteId);
    }

    private RegistroCosecha findActiveOrThrow(String id) {
        return cosechaRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de cosecha no encontrado con id: " + id));
    }

    private RegistroCosechaResponse toResponse(RegistroCosecha r) {
        return toResponse(r, Map.of(), Map.of());
    }

    private RegistroCosechaResponse toResponse(RegistroCosecha r, Map<String, String> destinos, Map<String, String> tiposPerdida) {
        return new RegistroCosechaResponse(
                r.getId(),
                r.getLote().getId(),
                r.getLote().getNombre(),
                r.getFecha(),
                r.getRendimientoKgHa(),
                r.getToneladasTotal(),
                r.getCalidadGrano(),
                r.getHumedad(),
                r.getObservaciones(),
                r.getCreatedAt(),
                r.getAreaRealCosechadaPct(),
                r.getHectareasCosechadas(),
                r.getPerdidaKgHa(),
                r.getGranosPerdidosKg(),
                r.getTipoPerdida(),
                resolver(CatalogoUtilidadRegistry.TIPO_PERDIDA_COSECHA, r.getTipoPerdida(), tiposPerdida),
                r.getDestino(),
                resolver(CatalogoUtilidadRegistry.DESTINO_COSECHA, r.getDestino(), destinos),
                r.getDestinoCantidadTn()
        );
    }

    // Usa el mapa batch si el id esta presente; si no, hace el lookup individual (paths de un solo registro).
    private String resolver(String categoria, String id, Map<String, String> nombres) {
        if (id != null && nombres.containsKey(id)) {
            return nombres.get(id);
        }
        return utilidadNombreResolver.resolver(categoria, id);
    }
}
