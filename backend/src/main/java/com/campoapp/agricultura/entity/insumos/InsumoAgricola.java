package com.campoapp.agricultura.entity.insumos;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;

@Entity
@Table(name = "insumos_agricolas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InsumoAgricola extends AuditableEntity {

    @Column(nullable = false, unique = true, length = 80)
    private String codigo;

    @Column(nullable = false, length = 160)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 40)
    private TipoInsumoAgricola tipo;

    @Column(length = 120)
    private String marca;

    @Column(length = 120)
    private String presentacion;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "unidad_medida", nullable = false, length = 30)
    private UnidadMedidaInsumo unidadMedida;

    @Column(name = "principio_activo", length = 180)
    private String principioActivo;

    @Column(length = 160)
    private String proveedor;

    @Column(length = 160)
    private String origen;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "precio_unitario", precision = 14, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "stock_minimo", nullable = false, precision = 14, scale = 3)
    @Builder.Default
    private BigDecimal stockMinimo = BigDecimal.ZERO;

    @Column(name = "stock_maximo", precision = 14, scale = 3)
    private BigDecimal stockMaximo;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
