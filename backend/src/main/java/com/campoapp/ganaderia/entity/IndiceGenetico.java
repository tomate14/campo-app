package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "indices_geneticos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IndiceGenetico extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(name = "fecha_evaluacion", nullable = false)
    private LocalDate fechaEvaluacion;

    @Column(precision = 10, scale = 2)
    private BigDecimal epd;

    @Column(precision = 10, scale = 2)
    private BigDecimal dep;

    @Column(name = "indice_productivo", precision = 10, scale = 2)
    private BigDecimal indiceProductivo;

    @Column(length = 120)
    private String fuente;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
