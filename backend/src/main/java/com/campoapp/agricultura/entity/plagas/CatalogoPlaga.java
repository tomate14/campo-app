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

    // Feature 73: CSV de ids de utilidad_cultivo (patron feature 72), no strings. Ej: "cult-maiz,cult-sorgo".
    @Column(name = "cultivos_afectados", length = 400)
    private String cultivosAfectados;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(columnDefinition = "TEXT")
    private String sintomas;

    @Column(name = "umbral_accion", length = 260)
    private String umbralAccion;

    // Zona geografica/agroecologica tipica de aparicion (feature 54).
    @Column(name = "zona_tipica", length = 260)
    private String zonaTipica;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
