package com.campoapp.agricultura.entity.insumos;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.plagas.OrdenAplicacion;
import com.campoapp.common.entity.AuditableEntity;
import com.campoapp.operarios.entity.Operario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos_insumos_agricolas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MovimientoInsumoAgricola extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insumo_id", nullable = false)
    private InsumoAgricola insumo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id")
    private StockInsumoAgricola stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id")
    private Lote lote;

    // Feature 84: orden de aplicacion que genero este movimiento (nullable). Sirve para
    // idempotencia (no duplicar el costo al re-validar) y para trazabilidad orden -> movimiento.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_aplicacion_id")
    private OrdenAplicacion ordenAplicacion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "tipo_movimiento", nullable = false, length = 30)
    private TipoMovimientoInsumo tipoMovimiento;

    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal cantidad;

    @Column(name = "costo_unitario", precision = 14, scale = 2)
    private BigDecimal costoUnitario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id")
    private Operario responsableOperario;

    @Column(length = 160)
    private String responsable;

    @Column(name = "tarea_referencia", length = 180)
    private String tareaReferencia;

    @Column(length = 160)
    private String proveedor;

    @Column(length = 160)
    private String origen;

    @Column(length = 160)
    private String destino;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
