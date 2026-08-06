package com.campoapp.agricultura.repository.plagas;

import com.campoapp.agricultura.entity.plagas.GbifEspecie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Cache global de especies GBIF para el calculo de similares (feature 75).
 */
public interface GbifEspecieRepository extends JpaRepository<GbifEspecie, String> {

    // Dedupe/upsert por usageKey.
    Optional<GbifEspecie> findByUsageKeyAndDeletedAtIsNull(Long usageKey);

    // Similares nivel GENERO: hermanas del mismo genus_key.
    List<GbifEspecie> findByGenusKeyAndDeletedAtIsNullOrderByNombreCientificoAsc(Long genusKey);

    // Similares nivel FAMILIA: mismas de la familia (luego se descartan las del propio genero).
    List<GbifEspecie> findByFamilyKeyAndDeletedAtIsNullOrderByNombreCientificoAsc(Long familyKey);
}
