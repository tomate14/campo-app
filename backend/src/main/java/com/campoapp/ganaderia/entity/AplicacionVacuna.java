package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "aplicaciones_vacuna")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AplicacionVacuna extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacuna_id", nullable = false)
    private VacunaCatalogo vacuna;

    @Column(name = "fecha_aplicacion", nullable = false)
    private LocalDate fechaAplicacion;

    @Column(name = "proxima_dosis_fecha")
    private LocalDate proximaDosisFecha;

    @Column(length = 120)
    private String operario;

    @Column(name = "lote_marca", length = 120)
    private String loteMarca;

    @Column(name = "costo_aplicado", precision = 12, scale = 2)
    private BigDecimal costoAplicado;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
