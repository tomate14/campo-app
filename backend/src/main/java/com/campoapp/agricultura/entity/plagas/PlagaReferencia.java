package com.campoapp.agricultura.entity.plagas;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Catalogo de referencia de plagas por cultivo poblado desde GBIF (feature 73).
 * cultivoId es una referencia blanda al id de utilidad_cultivo (sin FK, estilo feature 72).
 */
@Entity
@Table(name = "plaga_referencia")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlagaReferencia extends AuditableEntity {

    @Column(name = "cultivo_id", nullable = false, length = 36)
    private String cultivoId;

    @Column(name = "nombre_comun", nullable = false, length = 160)
    private String nombreComun;

    @Column(name = "nombre_cientifico", nullable = false, length = 200)
    private String nombreCientifico;

    // Id del catalogo TIPO_PLAGA (utilidad_tipo_plaga).
    @Column(length = 40)
    private String tipo;

    // Path relativo dentro del uploads-dir (ej: plagas-referencia/uuid.jpg). Null si aun no hay imagen.
    @Column(length = 400)
    private String path;

    @Column(length = 60)
    private String fuente;

    @Column(name = "gbif_usage_key")
    private Long gbifUsageKey;

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
