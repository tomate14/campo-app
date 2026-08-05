package com.campoapp.agricultura.entity.plagas;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Imagen propia de un item del catalogo de plagas (feature 54).
 * Los bytes viven en filesystem; aca solo se guarda el path relativo.
 * Se referencia la plaga por id simple (String), sin @ManyToOne, para
 * simplificar el mapeo y evitar cargas innecesarias.
 */
@Entity
@Table(name = "catalogo_plaga_imagen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CatalogoPlagaImagen extends AuditableEntity {

    @Column(name = "catalogo_plaga_id", nullable = false, length = 36)
    private String catalogoPlagaId;

    // Path relativo dentro del uploads-dir (ej: plagas-catalogo/uuid.jpg).
    @Column(nullable = false, length = 400)
    private String path;

    @Column(length = 255)
    private String nombre;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "tamanio_bytes")
    private Long tamanioBytes;

    @Column(name = "es_principal", nullable = false)
    @Builder.Default
    private Boolean esPrincipal = false;

    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;
}
