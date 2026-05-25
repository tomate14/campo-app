package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "montas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Monta extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vaca_id", nullable = false)
    private Animal vaca;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "toro_id", nullable = false)
    private Animal toro;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String resultado = "PENDIENTE";

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
