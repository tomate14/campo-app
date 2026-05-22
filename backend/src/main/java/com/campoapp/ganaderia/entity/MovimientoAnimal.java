package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos_animal")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MovimientoAnimal extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", nullable = false, length = 30, columnDefinition = "VARCHAR(30)")
    private TipoMovimiento tipoMovimiento;

    @Column(name = "ubicacion_origen", length = 150)
    private String ubicacionOrigen;

    @Column(name = "ubicacion_destino", length = 150)
    private String ubicacionDestino;

    @Column(length = 180)
    private String motivo;

    @Column(length = 120)
    private String responsable;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    public enum TipoMovimiento {
        INGRESO,
        EGRESO,
        TRANSFERENCIA,
        SANIDAD,
        CONTROL
    }
}
