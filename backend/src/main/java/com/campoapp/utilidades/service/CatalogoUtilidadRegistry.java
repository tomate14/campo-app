package com.campoapp.utilidades.service;

import com.campoapp.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Whitelist central categoria -> tabla fisica del modulo Utilidades (feature 71/72).
 *
 * Es la unica fuente de verdad del mapeo: tanto la fachada generica
 * ({@code UtilidadOpcionServiceImpl}) como el resolver id -> valor
 * ({@link UtilidadNombreResolver}) resuelven la tabla contra este componente.
 * La categoria enviada por el cliente NUNCA se interpola como nombre de tabla:
 * solo se usa el valor del mapa. Esa es la defensa contra SQL injection por nombre
 * de tabla; los valores y filtros van siempre por parametros preparados.
 */
@Component
public class CatalogoUtilidadRegistry {

    // Constantes de categoria para usar desde los mappers que resuelven id -> valor.
    public static final String DESTINO_COSECHA = "DESTINO_COSECHA";
    public static final String TIPO_PERDIDA_COSECHA = "TIPO_PERDIDA_COSECHA";
    public static final String CULTIVO = "CULTIVO";
    public static final String TIPO_PLAGA = "TIPO_PLAGA";
    public static final String TIPO_INSUMO = "TIPO_INSUMO";
    public static final String UNIDAD_INSUMO = "UNIDAD_INSUMO";
    // Feature 58: unidad de dosis de las ordenes de aplicacion (l/ha, cc/ha, kg/ha, ...).
    public static final String UNIDAD_DOSIS = "UNIDAD_DOSIS";

    // Whitelist inmutable categoria -> tabla fisica.
    private static final Map<String, String> CATALOGOS = Map.ofEntries(
            Map.entry(DESTINO_COSECHA, "utilidad_destino_cosecha"),
            Map.entry(TIPO_PERDIDA_COSECHA, "utilidad_tipo_perdida"),
            Map.entry(CULTIVO, "utilidad_cultivo"),
            Map.entry(TIPO_PLAGA, "utilidad_tipo_plaga"),
            Map.entry(TIPO_INSUMO, "utilidad_tipo_insumo"),
            Map.entry(UNIDAD_INSUMO, "utilidad_unidad_insumo"),
            Map.entry(UNIDAD_DOSIS, "utilidad_unidad_dosis")
    );

    /**
     * Resuelve la tabla fisica de una categoria contra la whitelist.
     * Categoria desconocida -> 404 (no se interpola nada crudo).
     */
    public String tablaDe(String categoria) {
        String tabla = categoria == null ? null : CATALOGOS.get(categoria.trim());
        if (tabla == null) {
            throw new ResourceNotFoundException("Categoría de utilidad no soportada: " + categoria);
        }
        return tabla;
    }
}
