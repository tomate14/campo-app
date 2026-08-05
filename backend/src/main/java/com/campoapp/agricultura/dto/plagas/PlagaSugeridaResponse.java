package com.campoapp.agricultura.dto.plagas;

import java.util.List;

/**
 * Plaga sugerida por el algoritmo de similitud sobre el catalogo propio (feature 54).
 * score = puntaje calculado; motivos = razones legibles en espanol.
 */
public record PlagaSugeridaResponse(
        String id,
        String nombreComun,
        String nombreCientifico,
        String tipo,
        String tipoNombre,
        String imagenPrincipalUrl,
        int score,
        List<String> motivos
) {}
