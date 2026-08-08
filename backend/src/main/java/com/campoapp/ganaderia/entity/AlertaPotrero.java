package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Alerta georreferenciada sobre un potrero (feature 47): algo que requiere
 * atencion en el campo (aguada rota, alambrado caido, animal enfermo suelto).
 *
 * gravedad se guarda como String (convencion del dominio ganaderia, ver
 * DiagnosticoSanitario) pero sus valores son los mismos 4 niveles de
 * SeveridadPlaga: BAJA, MEDIA, ALTA, CRITICA. El service valida contra ese enum.
 */
@Entity
@Table(name = "alertas_potrero")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlertaPotrero extends AuditableEntity {

    public static final String ESTADO_ABIERTA = "ABIERTA";
    public static final String ESTADO_RESUELTA = "RESUELTA";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "potrero_id", nullable = false)
    private Potrero potrero;

    /** Usuario logueado que creo la alerta; se toma del token, nunca del request. */
    @Column(name = "usuario_id", nullable = false, length = 36)
    private String usuarioId;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 40)
    private String gravedad;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String observacion;

    /** Ubicacion del pin; si faltan, el render usa el centroide del potrero. */
    @Column(precision = 10, scale = 7)
    private BigDecimal latitud;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitud;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = ESTADO_ABIERTA;

    /** Foto opcional de lo encontrado en el campo (feature 79); URL expuesta como /uploads/{path}. */
    @Column(name = "foto_url", length = 500)
    private String fotoUrl;

    @Column(name = "foto_nombre", length = 255)
    private String fotoNombre;

    @Column(name = "foto_content_type", length = 100)
    private String fotoContentType;

    @Column(name = "foto_tamanio_bytes")
    private Long fotoTamanioBytes;
}
