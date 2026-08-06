package com.campoapp.agricultura.gbif.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Nombre vulgar de una especie (species/{key}/vernacularNames), feature 75. language ISO 639 (ej: spa, es).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GbifVernacularName(String vernacularName, String language) {
}
