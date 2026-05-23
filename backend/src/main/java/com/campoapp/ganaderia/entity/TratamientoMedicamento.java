package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tratamientos_medicamento")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TratamientoMedicamento extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(nullable = false, length = 140)
    private String medicamento;

    @Column(length = 80)
    private String dosis;

    @Column(name = "via_aplicacion", length = 80)
    private String viaAplicacion;

    @Column(length = 120)
    private String responsable;

    @Column(length = 180)
    private String motivo;

    @Column(precision = 12, scale = 2)
    private BigDecimal costo;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
