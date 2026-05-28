package com.campoapp.agricultura.entity.plagas;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "catalogo_plagas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CatalogoPlaga extends AuditableEntity {
    @Column(name = "nombre_comun", nullable = false, length = 160)
    private String nombreComun;

    @Column(name = "nombre_cientifico", length = 180)
    private String nombreCientifico;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 40)
    private TipoPlaga tipo;

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
