package com.campoapp.agricultura.gbif.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * Respuesta de species/{key}/vernacularNames (feature 75).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GbifVernacularResponse(List<GbifVernacularName> results) {
}
