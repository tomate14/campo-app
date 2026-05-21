package com.campoapp.clima.entity;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "alertas_clima")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlertaClima extends AuditableEntity {

    public enum TipoAlerta {
        HELADA, LLUVIA_EXCESIVA, SEQUIA, VIENTO_FUERTE, GRANIZO, TORMENTA
    }

    public enum Severidad {
        BAJA, MEDIA, ALTA, CRITICA
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_alerta", nullable = false, length = 20)
    private TipoAlerta tipoAlerta;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Severidad severidad;

    @Column(nullable = false, length = 500)
    private String mensaje;

    @Column(name = "valor_medido", precision = 8, scale = 2)
    private BigDecimal valorMedido;

    @Builder.Default
    @Column(nullable = false)
    private boolean activa = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean leida = false;

    @Column(nullable = false)
    private LocalDateTime fecha;
}
