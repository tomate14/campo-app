package com.campoapp.agricultura.dto.plagas;

/**
 * Resumen del sync de especies similares desde GBIF (feature 75).
 * plagas = plagas del catalogo procesadas; especiesDescubiertas = candidatas upsertadas en gbif_especie;
 * imagenesDescargadas = imagenes CC bajadas al volumen; fallidos = plagas con error (nunca corta el sync).
 */
public record SimilarSyncResumen(int plagas, int especiesDescubiertas, int imagenesDescargadas, int fallidos) {
}
