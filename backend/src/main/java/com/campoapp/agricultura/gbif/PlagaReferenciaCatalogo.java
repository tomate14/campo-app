package com.campoapp.agricultura.gbif;

import java.util.List;
import java.util.Map;

/**
 * Mapping curado cultivo -> taxones a descargar desde GBIF (feature 73).
 *
 * La clave del mapa es el valor del cultivo en MAYUSCULAS (columna valor de utilidad_cultivo:
 * SOJA/MAIZ/TRIGO/GIRASOL/SORGO/OTRO). El tipo de cada taxon es el id del catalogo TIPO_PLAGA
 * (utilidad_tipo_plaga): tpla-plaga / tpla-enfermedad / tpla-maleza.
 */
public final class PlagaReferenciaCatalogo {

    private PlagaReferenciaCatalogo() {
    }

    /** Semilla de un taxon a resolver contra GBIF. tipo = id de TIPO_PLAGA. */
    public record TaxonSeed(String nombreComun, String nombreCientifico, String tipo) {
    }

    private static final String PLAGA = "tpla-plaga";
    private static final String ENFERMEDAD = "tpla-enfermedad";
    private static final String MALEZA = "tpla-maleza";

    private static final Map<String, List<TaxonSeed>> CATALOGO = Map.of(
            "SOJA", List.of(
                    new TaxonSeed("Roya asiática", "Phakopsora pachyrhizi", ENFERMEDAD),
                    new TaxonSeed("Chinche verde", "Nezara viridula", PLAGA),
                    new TaxonSeed("Oruga medidora", "Rachiplusia nu", PLAGA),
                    new TaxonSeed("Yuyo colorado", "Amaranthus hybridus", MALEZA),
                    new TaxonSeed("Mancha ojo de rana", "Cercospora sojina", ENFERMEDAD)
            ),
            "MAIZ", List.of(
                    new TaxonSeed("Oruga cogollera", "Spodoptera frugiperda", PLAGA),
                    new TaxonSeed("Chicharrita del maíz", "Dalbulus maidis", PLAGA),
                    new TaxonSeed("Roya común", "Puccinia sorghi", ENFERMEDAD),
                    new TaxonSeed("Vaquita de San Antonio", "Diabrotica speciosa", PLAGA)
            ),
            "TRIGO", List.of(
                    new TaxonSeed("Roya amarilla", "Puccinia striiformis", ENFERMEDAD),
                    new TaxonSeed("Roya de la hoja", "Puccinia triticina", ENFERMEDAD),
                    new TaxonSeed("Pulgón verde", "Schizaphis graminum", PLAGA),
                    new TaxonSeed("Fusariosis de la espiga", "Fusarium graminearum", ENFERMEDAD)
            ),
            "GIRASOL", List.of(
                    new TaxonSeed("Mildiu", "Plasmopara halstedii", ENFERMEDAD),
                    new TaxonSeed("Oruga medidora", "Rachiplusia nu", PLAGA),
                    new TaxonSeed("Verticilosis", "Verticillium dahliae", ENFERMEDAD)
            ),
            "SORGO", List.of(
                    new TaxonSeed("Pulgón amarillo", "Melanaphis sacchari", PLAGA),
                    new TaxonSeed("Antracnosis", "Colletotrichum sublineolum", ENFERMEDAD)
            ),
            "OTRO", List.of()
    );

    /** Taxones curados para el valor de cultivo dado (MAYUSCULAS); vacio si no hay mapping. */
    public static List<TaxonSeed> taxonesDe(String cultivoValor) {
        if (cultivoValor == null) {
            return List.of();
        }
        return CATALOGO.getOrDefault(cultivoValor.trim().toUpperCase(java.util.Locale.ROOT), List.of());
    }
}
