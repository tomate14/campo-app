package com.campoapp.agricultura.entity.plagas;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "aplicaciones_fitosanitarias")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AplicacionFitosanitaria extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "deteccion_id", nullable = false)
    private DeteccionPlaga deteccion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @Column(name = "fecha_aplicacion", nullable = false)
    private LocalDateTime fechaAplicacion;

    @Column(nullable = false, length = 180)
    private String producto;

    @Column(name = "principio_activo", length = 180)
    private String principioActivo;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal dosis;

    @Column(name = "unidad_dosis", nullable = false, length = 40)
    private String unidadDosis;

    @Column(name = "volumen_caldo_l_ha", precision = 12, scale = 2)
    private BigDecimal volumenCaldoLHa;

    @Column(name = "superficie_tratada_ha", precision = 12, scale = 2)
    private BigDecimal superficieTratadaHa;

    @Column(name = "periodo_carencia_dias")
    private Integer periodoCarenciaDias;

    @Column(name = "periodo_reingreso_horas")
    private Integer periodoReingresoHoras;

    @Column(name = "fecha_reingreso_seguro")
    private LocalDateTime fechaReingresoSeguro;

    @Column(name = "fecha_cosecha_segura")
    private LocalDate fechaCosechaSegura;

    @Column(name = "maquinaria_id", length = 36)
    private String maquinariaId;

    @Column(name = "operario_responsable", nullable = false, length = 180)
    private String operarioResponsable;

    @Column(name = "condiciones_climaticas", length = 260)
    private String condicionesClimaticas;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
