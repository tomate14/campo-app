package com.campoapp.agricultura.gbif.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Especie devuelta por species/{genusKey}/children y species/search (feature 75).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GbifSpecies(
        Long key,
        String scientificName,
        String canonicalName,
        String rank,
        Long genusKey,
        Long familyKey,
        String genus,
        String family) {
}
