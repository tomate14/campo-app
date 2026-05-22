package com.campoapp.clima.entity;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pronosticos",
        uniqueConstraints = @UniqueConstraint(columnNames = {"lote_id", "fecha"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Pronostico extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "temp_max", precision = 5, scale = 2)
    private BigDecimal tempMax;

    @Column(name = "temp_min", precision = 5, scale = 2)
    private BigDecimal tempMin;

    @Column(name = "apparent_temp_max", precision = 5, scale = 2)
    private BigDecimal apparentTempMax;

    @Column(name = "apparent_temp_min", precision = 5, scale = 2)
    private BigDecimal apparentTempMin;

    @Column(name = "humedad_pct")
    private Integer humedadPct;

    @Column(name = "uv_index_max", precision = 5, scale = 2)
    private BigDecimal uvIndexMax;

    @Column(name = "probabilidad_lluvia", precision = 5, scale = 2)
    private BigDecimal probabilidadLluvia;

    @Column(name = "precipitacion_mm", precision = 6, scale = 2)
    private BigDecimal precipitacionMm;

    @Column(length = 100)
    private String descripcion;

    @Column(name = "icono_codigo", length = 10)
    private String iconoCodigo;

    @Column(name = "velocidad_viento", precision = 6, scale = 2)
    private BigDecimal velocidadViento;

    @Column(name = "direccion_viento_dominante")
    private Integer direccionVientoDominante;

    @Column(name = "condicion_codigo")
    private Integer condicionCodigo;
}
