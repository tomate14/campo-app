package com.campoapp.agricultura.entity.insumos;

import com.campoapp.common.entity.AuditableEntity;
import com.campoapp.operarios.entity.Operario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "stock_insumos_agricolas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockInsumoAgricola extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insumo_id", nullable = false)
    private InsumoAgricola insumo;

    @Column(name = "lote_stock", length = 120)
    private String loteStock;

    @Column(name = "cantidad_disponible", nullable = false, precision = 14, scale = 3)
    @Builder.Default
    private BigDecimal cantidadDisponible = BigDecimal.ZERO;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "ubicacion_deposito", length = 160)
    private String ubicacionDeposito;

    @Column(length = 120)
    private String deposito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id")
    private Operario responsable;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
