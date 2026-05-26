package com.campoapp.maquinaria.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "asignaciones_maquinaria")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AsignacionMaquinaria extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquinaria_id", nullable = false)
    private Maquinaria maquinaria;
    @Column(nullable = false, length = 180)
    private String operario;
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;
    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;
    @Column(length = 180)
    private String actividad;
    @Column(length = 180)
    private String ubicacion;
    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
