package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "diagnosticos_sanitarios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DiagnosticoSanitario extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(name = "fecha_diagnostico", nullable = false)
    private LocalDate fechaDiagnostico;

    @Column(nullable = false, length = 160)
    private String enfermedad;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String severidad = "MEDIA";

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String estado = "ABIERTO";

    @Column(length = 120)
    private String veterinario;

    @Column(name = "tratamiento_indicado", length = 180)
    private String tratamientoIndicado;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
