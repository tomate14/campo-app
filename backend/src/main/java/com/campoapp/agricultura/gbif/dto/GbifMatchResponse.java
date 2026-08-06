package com.campoapp.agricultura.gbif.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Respuesta de GBIF species/match. usageKey null/ausente => sin match (feature 73).
 * Feature 75: se agregan las claves de jerarquia taxonomica (genusKey/familyKey/genus/family/rank)
 * para poder descubrir especies similares por genero y familia.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GbifMatchResponse(
        Long usageKey,
        String scientificName,
        String status,
        String rank,
        Long genusKey,
        Long familyKey,
        String genus,
        String family) {
}
