package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "inseminaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Inseminacion extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaca_id", nullable = false)
    private Animal vaca;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "genetica_usada", nullable = false, length = 180)
    private String geneticaUsada;

    @Column(length = 120)
    private String tecnico;

    @Column(precision = 12, scale = 2)
    private BigDecimal costo;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String resultado = "PENDIENTE";

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
