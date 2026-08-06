package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.plagas.PlagaReferenciaResponse;
import com.campoapp.agricultura.dto.plagas.SyncResumen;

import java.util.List;

/**
 * Sincronizacion y consulta del catalogo de referencia de plagas desde GBIF (feature 73).
 */
public interface PlagaReferenciaSyncService {

    /** Recorre los cultivos activos y las plagas de catalogo_plagas que los afectan, consultando GBIF de forma idempotente. */
    SyncResumen sincronizar();

    /** Lista el catalogo de referencia, opcionalmente filtrado por cultivoId. */
    List<PlagaReferenciaResponse> listar(String cultivoId);
}
