package com.campoapp.agricultura.dto.plagas;

/**
 * Especie similar a una plaga (feature 75).
 * nivel = "GENERO" | "FAMILIA" (proximidad taxonomica).
 * imagenUrl puede ser:
 *   - RELATIVA ("/uploads/plagas-similares/uuid.jpg") cuando viene del cache local gbif_especie; o
 *   - ABSOLUTA ("http.../foto.jpg") cuando es una miniatura remota resuelta en vivo (sin descargar).
 * El front decide como resolverla segun empiece con "http" o con "/".
 */
public record EspecieSimilarResponse(
        Long usageKey,
        String nombreCientifico,
        String nombreVulgar,
        String nivel,
        String imagenUrl,
        String licencia,
        String atribucion) {
}
