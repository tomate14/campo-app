package com.campoapp.agricultura.entity.plagas;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "catalogo_plagas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CatalogoPlaga extends AuditableEntity {
    @Column(name = "nombre_comun", nullable = false, length = 160)
    private String nombreComun;

    @Column(name = "nombre_cientifico", length = 180)
    private String nombreCientifico;

    // Tipo: valor libre alimentado por el catalogo Utilidades (feature 71).
    @Column(nullable = false, length = 40)
    private String tipo;

    @Column(name = "cultivos_afectados", length = 260)
    private String cultivosAfectados;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(columnDefinition = "TEXT")
    private String sintomas;

    @Column(name = "umbral_accion", length = 260)
    private String umbralAccion;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
