package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "dietas_nutricionales")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DietaNutricional extends AuditableEntity {
    @Column(nullable = false, length = 140)
    private String nombre;

    @Column(name = "tipo_animal", nullable = false, length = 80)
    private String tipoAnimal;

    @Column(length = 160)
    private String objetivo;

    @Column(name = "materia_seca_kg", precision = 10, scale = 2)
    private BigDecimal materiaSecaKg;

    @Column(name = "costo_diario", precision = 12, scale = 2)
    private BigDecimal costoDiario;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activa = true;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
