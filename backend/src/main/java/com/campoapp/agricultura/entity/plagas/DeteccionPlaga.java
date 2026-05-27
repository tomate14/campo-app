package com.campoapp.agricultura.entity.plagas;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "detecciones_plaga")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeteccionPlaga extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "catalogo_plaga_id", nullable = false)
    private CatalogoPlaga catalogoPlaga;

    @Column(name = "fecha_deteccion", nullable = false)
    private LocalDateTime fechaDeteccion;

    @Column(length = 80)
    private String cultivo;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 40)
    private SeveridadPlaga severidad;

    @Column(name = "area_afectada_ha", precision = 12, scale = 2)
    private BigDecimal areaAfectadaHa;

    @Column(name = "porcentaje_afectado", precision = 6, scale = 2)
    private BigDecimal porcentajeAfectado;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 40)
    private EstadoDeteccionPlaga estado;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitud;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitud;

    @Column(name = "precision_metros", precision = 10, scale = 2)
    private BigDecimal precisionMetros;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "origen_geolocalizacion", nullable = false, length = 40)
    private OrigenGeolocalizacion origenGeolocalizacion;

    @Column(name = "foto_url", length = 500)
    private String fotoUrl;

    @Column(name = "foto_nombre", length = 240)
    private String fotoNombre;

    @Column(name = "foto_content_type", length = 120)
    private String fotoContentType;

    @Column(name = "foto_tamanio_bytes")
    private Long fotoTamanioBytes;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 180)
    private String responsable;
}
