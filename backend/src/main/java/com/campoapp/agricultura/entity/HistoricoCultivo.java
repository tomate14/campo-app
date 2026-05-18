package com.campoapp.agricultura.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "historico_cultivos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HistoricoCultivo extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @Column(nullable = false, length = 50)
    private String cultivo;

    @Column(nullable = false, length = 20)
    private String temporada;

    @Column(name = "fecha_siembra")
    private LocalDate fechaSiembra;

    @Column(name = "fecha_cosecha")
    private LocalDate fechaCosecha;

    @Column(name = "rendimiento_kg_ha", precision = 10, scale = 2)
    private BigDecimal rendimientoKgHa;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
