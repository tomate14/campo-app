package com.campoapp.agricultura.entity.insumos;

import com.campoapp.common.entity.AuditableEntity;
import com.campoapp.finanzas.entity.ProveedorFinanciero;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "insumos_agricolas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InsumoAgricola extends AuditableEntity {

    @Column(nullable = false, unique = true, length = 80)
    private String codigo;

    @Column(nullable = false, length = 160)
    private String nombre;

    // Tipo de insumo: valor libre alimentado por el catalogo Utilidades (feature 71).
    @Column(nullable = false, length = 40)
    private String tipo;

    @Column(length = 120)
    private String marca;

    @Column(length = 120)
    private String presentacion;

    // Unidad de medida: valor libre alimentado por el catalogo Utilidades (feature 71).
    @Column(name = "unidad_medida", nullable = false, length = 30)
    private String unidadMedida;

    @Column(name = "principio_activo", length = 180)
    private String principioActivo;

    @Column(length = 160)
    private String proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id")
    private ProveedorFinanciero proveedorFinanciero;

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
