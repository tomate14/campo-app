package com.campoapp.agricultura.dto.plagas;

/**
 * Resumen del resultado de una sincronizacion del catalogo de referencia (feature 73).
 */
public record SyncResumen(int cultivos, int procesados, int descargados, int omitidos, int fallidos) {
}
