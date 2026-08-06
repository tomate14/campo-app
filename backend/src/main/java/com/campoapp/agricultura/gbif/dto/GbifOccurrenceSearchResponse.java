package com.campoapp.agricultura.gbif.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * Respuesta de GBIF occurrence/search (feature 73).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GbifOccurrenceSearchResponse(List<GbifOccurrence> results) {
}
