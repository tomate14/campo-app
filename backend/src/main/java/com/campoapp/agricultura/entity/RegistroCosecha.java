package com.campoapp.agricultura.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "registros_cosecha")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistroCosecha extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "rendimiento_kg_ha", nullable = false, precision = 10, scale = 2)
    private BigDecimal rendimientoKgHa;

    @Column(name = "toneladas_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal toneladasTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "calidad_grano", length = 20)
    private CalidadGrano calidadGrano;

    @Column(precision = 5, scale = 2)
    private BigDecimal humedad;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    public enum CalidadGrano {
        PREMIUM,
        ESTANDAR,
        DESCUENTO
    }
}
