package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "vacunas_catalogo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VacunaCatalogo extends AuditableEntity {

    @Column(nullable = false, unique = true, length = 60)
    private String codigo;

    @Column(nullable = false, length = 140)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    @Builder.Default
    private Boolean obligatoria = false;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String especie = "BOVINA";

    @Column(name = "frecuencia_dias")
    private Integer frecuenciaDias;

    @Column(name = "edad_min_dias")
    private Integer edadMinDias;

    @Column(name = "edad_max_dias")
    private Integer edadMaxDias;

    @Column(name = "dosis_recomendada", length = 80)
    private String dosisRecomendada;

    @Column(name = "via_aplicacion", length = 80)
    private String viaAplicacion;

    @Column(length = 120)
    private String laboratorio;

    @Column(name = "costo_referencia", precision = 12, scale = 2)
    private BigDecimal costoReferencia;

    @Column(name = "stock_disponible")
    private Integer stockDisponible;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
