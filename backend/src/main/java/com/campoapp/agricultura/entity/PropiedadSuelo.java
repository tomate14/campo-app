package com.campoapp.agricultura.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "propiedades_suelo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PropiedadSuelo extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(precision = 4, scale = 2)
    private BigDecimal ph;

    @Column(name = "nitrogeno_kg_ha", precision = 8, scale = 2)
    private BigDecimal nitrogenoKgHa;

    @Column(name = "fosforo_kg_ha", precision = 8, scale = 2)
    private BigDecimal fosforoKgHa;

    @Column(name = "potasio_kg_ha", precision = 8, scale = 2)
    private BigDecimal potasioKgHa;

    @Column(name = "materia_organica_pct", precision = 5, scale = 2)
    private BigDecimal materiaOrganicaPct;

    @Column(name = "conductividad_electrica", precision = 6, scale = 3)
    private BigDecimal conductividadElectrica;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
