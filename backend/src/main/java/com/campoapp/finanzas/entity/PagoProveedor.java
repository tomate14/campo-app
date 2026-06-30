package com.campoapp.finanzas.entity;

import com.campoapp.common.entity.AuditableEntity;
import com.campoapp.operarios.entity.Operario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "finanzas_pagos_proveedor")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PagoProveedor extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "compra_id", nullable = false)
    private CompraProveedor compra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operario_id")
    private Operario operario;

    @Column(nullable = false)
    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 30)
    private MetodoPago metodoPago;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal importe;

    @Column(length = 160)
    private String referencia;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
