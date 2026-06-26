package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "catalogo_razas_bovinas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CatalogoRazaBovina extends AuditableEntity {

    @Column(nullable = false, unique = true, length = 80)
    private String codigo;

    @Column(nullable = false, unique = true, length = 140)
    private String nombre;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String especie = "BOVINA";

    @Column(nullable = false, length = 40)
    private String aptitud;

    @Column(name = "tipo_genetico", nullable = false, length = 60)
    private String tipoGenetico;

    @Column(length = 120)
    private String origen;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, length = 120)
    @Builder.Default
    private String fuente = "SENASA";

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
