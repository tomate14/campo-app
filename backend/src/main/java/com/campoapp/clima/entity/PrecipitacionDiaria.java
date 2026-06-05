package com.campoapp.clima.entity;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "clima_precipitacion_diaria",
        uniqueConstraints = @UniqueConstraint(columnNames = {"lote_id", "fecha"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrecipitacionDiaria extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "precipitacion_mm", nullable = false, precision = 8, scale = 2)
    private BigDecimal precipitacionMm;

    @Column(nullable = false, length = 40)
    private String fuente;
}
