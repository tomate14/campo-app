package com.campoapp.agricultura.gbif.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * Respuesta de species/{genusKey}/children y species/search (feature 75). Ambos usan la clave results.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GbifChildrenResponse(List<GbifSpecies> results) {
}
