package com.campoapp.maquinaria.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "repuestos_utilizados")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RepuestoUtilizado extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intervencion_id", nullable = false)
    private IntervencionMantenimiento intervencion;

    @Column(length = 100)
    private String codigo;

    @Column(nullable = false, length = 220)
    private String descripcion;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cantidad;

    @Column(name = "costo_unitario", precision = 14, scale = 2)
    private BigDecimal costoUnitario;

    @Column(name = "costo_total", precision = 14, scale = 2)
    private BigDecimal costoTotal;

    @Column(length = 180)
    private String proveedor;
}
