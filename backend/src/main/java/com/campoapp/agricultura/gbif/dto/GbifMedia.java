package com.campoapp.agricultura.gbif.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Media de una occurrence. identifier = URL de la imagen; license = URL de la licencia (feature 73).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GbifMedia(String identifier, String license, String rightsHolder, String type) {
}
