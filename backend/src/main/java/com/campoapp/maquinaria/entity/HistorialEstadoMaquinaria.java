package com.campoapp.maquinaria.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_estado_maquinaria")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HistorialEstadoMaquinaria extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquinaria_id", nullable = false)
    private Maquinaria maquinaria;
    @Column(name = "estado_anterior", length = 40)
    private String estadoAnterior;
    @Column(name = "estado_nuevo", nullable = false, length = 40)
    private String estadoNuevo;
    @Column(nullable = false)
    private LocalDateTime fecha;
    @Column(length = 180)
    private String responsable;
    @Column(length = 255)
    private String motivo;
}
