package com.campoapp.maquinaria.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "planes_mantenimiento")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlanMantenimiento extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquinaria_id")
    private Maquinaria maquinaria;

    @Column(name = "tipo_maquinaria", length = 80)
    private String tipoMaquinaria;

    @Column(length = 120)
    private String modelo;

    @Column(nullable = false, length = 160)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "intervalo_horas", precision = 12, scale = 2)
    private BigDecimal intervaloHoras;

    @Column(name = "intervalo_dias")
    private Integer intervaloDias;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String prioridad = "MEDIA";

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
