package com.campoapp.ganaderia.service.impl;

import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.repository.OperarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Helper compartido para resolver referencias a operarios en los historiales de ganaderia.
 *
 * Los campos responsable/operario/veterinario guardan historicamente el id del operario
 * (formularios de las features 45/46) o texto libre (registros viejos). Este resolver hace
 * el lookup en batch (un solo findAllById por lista, nunca un query por fila) y devuelve
 * el nombre completo cuando el valor matchea un operario por id; si no matchea, el caller
 * debe devolver el valor crudo tal cual (ver {@link #resolver(String, Map)}).
 *
 * Se incluyen operarios soft-deleted a proposito: un historial viejo debe seguir mostrando
 * el nombre del operario aunque haya sido dado de baja.
 */
@Component
@RequiredArgsConstructor
public class OperarioNombreResolver {

    private final OperarioRepository operarioRepository;

    /**
     * Resuelve en batch una coleccion de valores crudos (ids de operario o texto libre)
     * al mapa id -> nombre completo. Los valores nulos/vacios y los que no matchean
     * ningun operario simplemente no aparecen en el mapa.
     */
    public Map<String, String> resolverNombres(Collection<String> valoresCrudos) {
        List<String> ids = valoresCrudos.stream()
                .filter(valor -> valor != null && !valor.isBlank())
                .distinct()
                .toList();
        if (ids.isEmpty()) {
            return Map.of();
        }
        return operarioRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Operario::getId, this::nombreCompleto, (left, right) -> left));
    }

    /**
     * Conveniencia para paths de un solo registro (create/registrar): resuelve un unico valor.
     */
    public String resolverNombre(String valorCrudo) {
        return resolver(valorCrudo, resolverNombres(Collections.singletonList(valorCrudo)));
    }

    /**
     * Aplica la regla de resolucion: si el valor crudo matchea un operario devuelve su nombre,
     * si no (texto libre o vacio) devuelve el valor crudo tal cual.
     */
    public String resolver(String valorCrudo, Map<String, String> nombresPorId) {
        if (valorCrudo == null || valorCrudo.isBlank()) {
            return valorCrudo;
        }
        return nombresPorId.getOrDefault(valorCrudo, valorCrudo);
    }

    private String nombreCompleto(Operario operario) {
        return (operario.getNombre() + " " + operario.getApellido()).trim();
    }
}
