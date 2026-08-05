package com.campoapp.agricultura.gbif.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * Occurrence individual con su lista de media (feature 73).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GbifOccurrence(List<GbifMedia> media) {
}
