package com.campoapp.utilidades.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Helper compartido para resolver referencias a catalogos de Utilidades (feature 72).
 *
 * Los campos que referencian un catalogo (Lote.cultivo, RegistroCosecha.destino, etc.)
 * guardan el id de la fila {@code utilidad_*}. Este resolver hace el lookup id -> valor
 * en batch (un solo query por lista, nunca uno por fila) para el display. Si un id no
 * matchea ninguna fila del catalogo (dato viejo o texto libre) se devuelve el valor
 * crudo tal cual, siguiendo el mismo patron que {@code OperarioNombreResolver}.
 *
 * A proposito NO se filtra por deleted_at: una referencia vieja debe seguir mostrando
 * su etiqueta aunque la opcion del catalogo haya sido dada de baja.
 */
@Component
@RequiredArgsConstructor
public class UtilidadNombreResolver {

    private final JdbcTemplate jdbcTemplate;
    private final CatalogoUtilidadRegistry registry;

    /**
     * Resuelve en batch una coleccion de ids de una categoria al mapa id -> valor.
     * Los ids nulos/vacios se ignoran; los que no matchean no aparecen en el mapa.
     */
    public Map<String, String> resolverNombres(String categoria, Collection<String> ids) {
        List<String> distinct = ids.stream()
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();
        if (distinct.isEmpty()) {
            return Map.of();
        }
        String tabla = registry.tablaDe(categoria);
        String placeholders = distinct.stream().map(id -> "?").collect(Collectors.joining(", "));
        Map<String, String> resultado = new HashMap<>();
        jdbcTemplate.query(
                "SELECT id, valor FROM " + tabla + " WHERE id IN (" + placeholders + ")",
                (RowCallbackHandler) rs -> resultado.put(rs.getString("id"), rs.getString("valor")),
                distinct.toArray());
        return resultado;
    }

    /**
     * Conveniencia para paths de un solo registro: resuelve un unico id a su valor.
     */
    public String resolver(String categoria, String id) {
        if (id == null || id.isBlank()) {
            return id;
        }
        return resolverNombres(categoria, List.of(id)).getOrDefault(id, id);
    }

    /**
     * Aplica la regla de resolucion sobre un mapa ya calculado en batch: si el id matchea
     * devuelve su valor, si no (id viejo o texto libre) devuelve el valor crudo tal cual.
     */
    public String resolver(String id, Map<String, String> valoresPorId) {
        if (id == null || id.isBlank()) {
            return id;
        }
        return valoresPorId.getOrDefault(id, id);
    }
}
