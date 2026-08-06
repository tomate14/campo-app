package com.campoapp.agricultura.dto.plagas;

/**
 * Fila del catalogo de referencia de plagas para el cliente (feature 73).
 * imagenUrl = "/uploads/" + path (o null); cultivoNombre/tipoNombre resueltos por UtilidadNombreResolver.
 */
public record PlagaReferenciaResponse(
        String id,
        String cultivoId,
        String cultivoNombre,
        // Feature 73 (2da iteracion): plaga origen en catalogo_plagas.
        String catalogoPlagaId,
        String nombreComun,
        String nombreCientifico,
        String tipo,
        String tipoNombre,
        String imagenUrl,
        String fuente,
        String urlOriginal,
        String licencia,
        String atribucion) {
}
