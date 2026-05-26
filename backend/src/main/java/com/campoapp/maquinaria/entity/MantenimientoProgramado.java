package com.campoapp.maquinaria.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "mantenimientos_programados")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MantenimientoProgramado extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquinaria_id", nullable = false)
    private Maquinaria maquinaria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private PlanMantenimiento plan;

    @Column(name = "fecha_programada", nullable = false)
    private LocalDate fechaProgramada;

    @Column(name = "horometro_objetivo", precision = 12, scale = 2)
    private BigDecimal horometroObjetivo;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String estado = "PENDIENTE";

    @Column(length = 180)
    private String responsable;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
