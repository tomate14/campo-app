package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "registros_alimentacion")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistroAlimentacion extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id")
    private Animal animal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dieta_id")
    private DietaNutricional dieta;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 140)
    private String alimento;

    @Column(name = "cantidad_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidadKg;

    @Column(name = "costo_total", precision = 12, scale = 2)
    private BigDecimal costoTotal;

    @Column(length = 120)
    private String potrero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "potrero_id")
    private Potrero potreroRef;

    @Column(length = 120)
    private String responsable;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
