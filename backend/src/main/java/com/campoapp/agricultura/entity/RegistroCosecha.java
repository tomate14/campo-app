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

    // --- Feature 60: perdidas de cosecha ---
    // Area realmente cosechada respecto del total del lote (porcentaje).
    @Column(name = "area_real_cosechada_pct", precision = 5, scale = 2)
    private BigDecimal areaRealCosechadaPct;

    @Column(name = "hectareas_cosechadas", precision = 10, scale = 2)
    private BigDecimal hectareasCosechadas;

    // Perdida en kg por hectarea (grano que queda en el campo).
    @Column(name = "perdida_kg_ha", precision = 10, scale = 2)
    private BigDecimal perdidaKgHa;

    @Column(name = "granos_perdidos_kg", precision = 12, scale = 2)
    private BigDecimal granosPerdidosKg;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_perdida", length = 40)
    private TipoPerdidaCosecha tipoPerdida;

    // --- Feature 60: destino del dia ---
    @Column(name = "destino", length = 160)
    private String destino;

    @Column(name = "destino_cantidad_tn", precision = 10, scale = 2)
    private BigDecimal destinoCantidadTn;

    public enum CalidadGrano {
        PREMIUM,
        ESTANDAR,
        DESCUENTO
    }
}
