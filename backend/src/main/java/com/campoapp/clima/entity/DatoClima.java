package com.campoapp.clima.entity;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "dato_clima")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DatoClima extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @Column(name = "timestamp_utc", nullable = false)
    private LocalDateTime timestampUtc;

    @Column(precision = 5, scale = 2)
    private BigDecimal temperatura;

    @Column(name = "sensacion_termica", precision = 5, scale = 2)
    private BigDecimal sensacionTermica;

    @Column(name = "temp_min", precision = 5, scale = 2)
    private BigDecimal tempMin;

    @Column(name = "temp_max", precision = 5, scale = 2)
    private BigDecimal tempMax;

    @Column(name = "humedad_pct")
    private Integer humedadPct;

    @Column(name = "presion_hpa")
    private Integer presionHpa;

    @Column(name = "velocidad_viento", precision = 6, scale = 2)
    private BigDecimal velocidadViento;

    @Column(name = "direccion_viento")
    private Integer direccionViento;

    @Column(length = 100)
    private String descripcion;

    @Column(name = "icono_codigo", length = 10)
    private String iconoCodigo;

    @Column(name = "precipitaciones_mm", precision = 6, scale = 2)
    private BigDecimal precipitacionesMm;

    @Column(name = "nubosidad_pct")
    private Integer nubosidadPct;

    @Column(name = "condicion_codigo")
    private Integer condicionCodigo;

    @Column(name = "nombre_localidad", length = 100)
    private String nombreLocalidad;
}
