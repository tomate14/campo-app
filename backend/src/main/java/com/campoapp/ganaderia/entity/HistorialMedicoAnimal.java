package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "historial_medico_animal")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HistorialMedicoAnimal extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 180)
    private String diagnostico;

    @Column(length = 180)
    private String tratamiento;

    @Column(length = 120)
    private String veterinario;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
