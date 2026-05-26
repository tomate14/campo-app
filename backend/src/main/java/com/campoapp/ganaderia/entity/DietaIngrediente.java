package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "dieta_ingredientes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DietaIngrediente extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dieta_id", nullable = false)
    private DietaNutricional dieta;

    @Column(nullable = false, length = 140)
    private String ingrediente;

    @Column(name = "proporcion_pct", nullable = false, precision = 5, scale = 2)
    private BigDecimal proporcionPct;

    @Column(name = "costo_kg", precision = 12, scale = 2)
    private BigDecimal costoKg;

    @Column(name = "materia_seca_pct", precision = 5, scale = 2)
    private BigDecimal materiaSecaPct;
}
