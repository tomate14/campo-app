package com.campoapp.maquinaria.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "intervenciones_mantenimiento")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IntervencionMantenimiento extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquinaria_id", nullable = false)
    private Maquinaria maquinaria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private PlanMantenimiento plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programacion_id")
    private MantenimientoProgramado programacion;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 60)
    private String tipo;

    @Column(name = "tareas_realizadas", nullable = false, columnDefinition = "TEXT")
    private String tareasRealizadas;

    @Column(length = 180)
    private String operario;

    @Column(name = "horas_maquina", precision = 12, scale = 2)
    private BigDecimal horasMaquina;

    @Column(name = "mano_obra_costo", precision = 14, scale = 2)
    private BigDecimal manoObraCosto;

    @Column(name = "repuestos_costo", precision = 14, scale = 2)
    private BigDecimal repuestosCosto;

    @Column(name = "costo_total", precision = 14, scale = 2)
    private BigDecimal costoTotal;

    @Column(name = "estado_resultante", length = 40)
    private String estadoResultante;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
