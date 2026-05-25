package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "controles_prenez")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ControlPrenez extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaca_id", nullable = false)
    private Animal vaca;

    @Column(name = "fecha_diagnostico", nullable = false)
    private LocalDate fechaDiagnostico;

    @Column(nullable = false, length = 40)
    private String estado;

    @Column(name = "fecha_estimada_parto")
    private LocalDate fechaEstimadaParto;

    @Column(name = "nivel_riesgo_parto", nullable = false, length = 40)
    private String nivelRiesgoParto;

    @Column(length = 120)
    private String veterinario;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
