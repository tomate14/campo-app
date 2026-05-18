package com.campoapp.agricultura.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "eventos_siembra")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EventoSiembra extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_evento", nullable = false, length = 30)
    private TipoEvento tipoEvento;

    @Column(name = "estado_fenologico", length = 20)
    private String estadoFenologico;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    private LocalDate fecha;

    public enum TipoEvento {
        SIEMBRA,
        MONITOREO_FENOLOGICO,
        ALERTA,
        TRATAMIENTO
    }
}
