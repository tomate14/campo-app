package com.campoapp.agricultura.entity.plagas;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Orden de aplicacion fitosanitaria (feature 58): el responsable (usuario logueado) la
// carga y se la asigna a un operario (otro usuario del sistema). Al aceptarla, el operario
// genera un registro de aplicacion (AplicacionFitosanitaria) con estos mismos datos.
// El numero correlativo NO vive aca: se guarda en la tabla separada orden_aplicacion_numero.
@Entity
@Table(name = "ordenes_aplicacion")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrdenAplicacion extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    // Deteccion objetivo: necesaria para poder generar el registro de aplicacion al aceptar.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "deteccion_id", nullable = false)
    private DeteccionPlaga deteccion;

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

    @Column(name = "maquinaria_id", length = 36)
    private String maquinariaId;

    @Column(name = "condiciones_climaticas", length = 260)
    private String condicionesClimaticas;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    // Responsable (operario id): quien carga la orden = usuario logueado.
    @Column(name = "responsable_id", nullable = false, length = 36)
    private String responsableId;

    // Operario asignado (operario id): el tercero que debe ejecutar la aplicacion.
    @Column(name = "operario_id", nullable = false, length = 36)
    private String operarioId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private EstadoOrdenAplicacion estado;

    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    // Registro de aplicacion generado al aceptar la orden (idempotencia).
    @Column(name = "aplicacion_id", length = 36)
    private String aplicacionId;
}
