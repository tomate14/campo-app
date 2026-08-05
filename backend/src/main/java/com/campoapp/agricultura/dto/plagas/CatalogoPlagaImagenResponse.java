package com.campoapp.agricultura.dto.plagas;

/**
 * Imagen del catalogo de plagas (feature 54).
 * url = "/uploads/" + path relativo servido estaticamente.
 */
public record CatalogoPlagaImagenResponse(
        String id,
        String url,
        String nombre,
        String contentType,
        Long tamanioBytes,
        boolean esPrincipal,
        int orden
) {}
