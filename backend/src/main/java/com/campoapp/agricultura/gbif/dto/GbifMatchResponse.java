package com.campoapp.agricultura.gbif.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Respuesta de GBIF species/match. usageKey null/ausente => sin match (feature 73).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GbifMatchResponse(Long usageKey, String scientificName, String status) {
}
