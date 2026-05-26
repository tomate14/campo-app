package com.campoapp.maquinaria.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "usos_maquinaria")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UsoMaquinaria extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquinaria_id", nullable = false)
    private Maquinaria maquinaria;
    @Column(nullable = false)
    private LocalDate fecha;
    @Column(nullable = false, length = 180)
    private String actividad;
    @Column(length = 180)
    private String lote;
    @Column(length = 180)
    private String operario;
    @Column(name = "horas_trabajadas", precision = 10, scale = 2)
    private BigDecimal horasTrabajadas;
    @Column(name = "kilometros_recorridos", precision = 10, scale = 2)
    private BigDecimal kilometrosRecorridos;
    @Column(name = "combustible_litros", precision = 10, scale = 2)
    private BigDecimal combustibleLitros;
    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
