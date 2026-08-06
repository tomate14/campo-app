package com.campoapp.agricultura.entity.plagas;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Cache global de especies GBIF candidatas a "similares" (hermanas por genero/familia), feature 75.
 * Se puebla desde el sync de similares (children del genero + species/search por familia) y guarda
 * la imagen Creative Commons descargada al volumen de uploads. Dedupe por usage_key.
 */
@Entity
@Table(name = "gbif_especie")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GbifEspecie extends AuditableEntity {

    @Column(name = "usage_key", nullable = false)
    private Long usageKey;

    @Column(name = "nombre_cientifico", nullable = false, length = 200)
    private String nombreCientifico;

    // Nombre vulgar (vernacularName), preferido en espanol; null si GBIF no lo informa.
    @Column(name = "nombre_vulgar", length = 200)
    private String nombreVulgar;

    @Column(name = "genus_key")
    private Long genusKey;

    @Column(name = "family_key")
    private Long familyKey;

    @Column(length = 120)
    private String genero;

    @Column(length = 120)
    private String familia;

    // Rango taxonomico (SPECIES, etc.). Columna 'taxon_rank': 'rank' es palabra reservada en MySQL 8.
    @Column(name = "taxon_rank", length = 40)
    private String rank;

    // Path relativo dentro del uploads-dir (ej: plagas-similares/uuid.jpg). Null si aun no hay imagen.
    @Column(length = 400)
    private String path;

    @Column(name = "url_original", length = 600)
    private String urlOriginal;

    @Column(length = 200)
    private String licencia;

    @Column(length = 300)
    private String atribucion;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
