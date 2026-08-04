package com.campoapp.utilidades.service.impl;

import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.utilidades.dto.UtilidadOpcionRequest;
import com.campoapp.utilidades.dto.UtilidadOpcionResponse;
import com.campoapp.utilidades.entity.UtilidadOpcion;
import com.campoapp.utilidades.repository.UtilidadOpcionRepository;
import com.campoapp.utilidades.service.UtilidadOpcionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UtilidadOpcionServiceImpl implements UtilidadOpcionService {

    private final UtilidadOpcionRepository repository;

    @Override
    public List<UtilidadOpcionResponse> listarPorCategoria(String categoria) {
        return repository.findByCategoriaAndActivoTrueAndDeletedAtIsNullOrderByValorAsc(categoria)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public UtilidadOpcionResponse crear(UtilidadOpcionRequest request) {
        String categoria = request.categoria().trim();
        String valor = request.valor().trim();

        // Evita duplicados por categoria + valor (mismo criterio que la constraint unica).
        if (repository.existsByCategoriaAndValorAndDeletedAtIsNull(categoria, valor)) {
            throw new BusinessException("Ya existe una opción '" + valor + "' en la categoría " + categoria);
        }

        Integer maxOrden = repository.findMaxOrden(categoria);
        int orden = (maxOrden == null ? 0 : maxOrden) + 1;

        UtilidadOpcion opcion = UtilidadOpcion.builder()
                .categoria(categoria)
                .valor(valor)
                .activo(true)
                .orden(orden)
                .build();

        return toResponse(repository.save(opcion));
    }

    @Override
    @Transactional
    public void eliminar(String id) {
        UtilidadOpcion opcion = repository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opción de utilidad no encontrada con id: " + id));
        opcion.softDelete();
        repository.save(opcion);
    }

    private UtilidadOpcionResponse toResponse(UtilidadOpcion o) {
        return new UtilidadOpcionResponse(o.getId(), o.getCategoria(), o.getValor(), o.isActivo(), o.getOrden());
    }
}
