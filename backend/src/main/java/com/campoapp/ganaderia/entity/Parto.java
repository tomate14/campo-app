package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "partos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Parto extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "madre_id", nullable = false)
    private Animal madre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ternero_id")
    private Animal ternero;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(length = 180)
    private String complicaciones;

    @Column(name = "viabilidad_ternero", nullable = false, length = 40)
    @Builder.Default
    private String viabilidadTernero = "VIABLE";

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
