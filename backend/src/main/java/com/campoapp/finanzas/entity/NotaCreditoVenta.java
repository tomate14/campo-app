package com.campoapp.finanzas.entity;

import com.campoapp.common.entity.AuditableEntity;
import com.campoapp.operarios.entity.Operario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "finanzas_notas_credito")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotaCreditoVenta extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "factura_id", nullable = false)
    private FacturaVenta factura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operario_id")
    private Operario operario;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal importe;

    @Column(nullable = false, length = 220)
    private String motivo;

    @Column(length = 40)
    private String cae;
}
