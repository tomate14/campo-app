package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.plagas.EspecieSimilarResponse;
import com.campoapp.agricultura.dto.plagas.SimilarSyncResumen;

import java.util.List;

/**
 * Descubrimiento y cache de especies similares (por genero/familia) desde GBIF (feature 75).
 */
public interface PlagaSimilarSyncService {

    /**
     * Recorre las plagas del catalogo con nombre cientifico, resuelve su taxonomia contra GBIF y
     * puebla el cache gbif_especie con las especies hermanas (genero + familia) y sus imagenes CC.
     * Idempotente y tolerante a fallos (nunca propaga excepciones).
     */
    SimilarSyncResumen sincronizarSimilares();

    /**
     * Especies similares de una plaga del catalogo, resueltas desde el cache gbif_especie
     * (nivel GENERO y, segun topes, FAMILIA). Es lo que consume la ficha. imagenUrl relativa (/uploads/...).
     */
    List<EspecieSimilarResponse> similaresDeCatalogo(String catalogoPlagaId);

    /**
     * Descubrimiento en vivo por nombre cientifico (para el alta de una nueva plaga). No descarga
     * imagenes: devuelve miniatura local si ya esta cacheada o la URL remota de GBIF en caso contrario.
     */
    List<EspecieSimilarResponse> descubrirEnVivo(String nombreCientifico);
}
