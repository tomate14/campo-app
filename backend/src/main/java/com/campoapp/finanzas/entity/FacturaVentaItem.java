package com.campoapp.finanzas.entity;

import com.campoapp.agricultura.entity.insumos.InsumoAgricola;
import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "finanzas_factura_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FacturaVentaItem extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "factura_id", nullable = false)
    private FacturaVenta factura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insumo_id")
    private InsumoAgricola insumo;

    @Column(nullable = false, length = 180)
    private String descripcion;

    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal cantidad;

    @Column(nullable = false, length = 30)
    private String unidad;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal ivaPorcentaje = BigDecimal.valueOf(21);

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal;
}
