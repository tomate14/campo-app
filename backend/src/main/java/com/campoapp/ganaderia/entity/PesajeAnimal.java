package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pesajes_animales")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PesajeAnimal extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "peso_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal pesoKg;

    @Column(name = "condicion_corporal", precision = 3, scale = 1)
    private BigDecimal condicionCorporal;

    @Column(length = 80)
    private String metodo;

    @Column(length = 120)
    private String responsable;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
