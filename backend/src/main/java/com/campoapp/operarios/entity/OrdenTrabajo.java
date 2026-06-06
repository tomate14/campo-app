package com.campoapp.operarios.entity;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ordenes_trabajo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdenTrabajo extends AuditableEntity {

    @Column(nullable = false, length = 40)
    private String codigo;

    @Column(nullable = false, length = 160)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id")
    private Lote lote;

    @Column(length = 160)
    private String zona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operario_id", nullable = false)
    private Operario operario;

    @Column(nullable = false, length = 30)
    private String prioridad;

    @Column(nullable = false, length = 30)
    private String estado;

    @Column(name = "fecha_programada")
    private LocalDateTime fechaProgramada;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin_estimada")
    private LocalDateTime fechaFinEstimada;

    @Column(name = "fecha_fin_real")
    private LocalDateTime fechaFinReal;

    @Column(name = "duracion_estimada_min")
    private Integer duracionEstimadaMin;

    @Column(name = "duracion_real_min")
    private Integer duracionRealMin;

    @Column(columnDefinition = "TEXT")
    private String resultado;

    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
