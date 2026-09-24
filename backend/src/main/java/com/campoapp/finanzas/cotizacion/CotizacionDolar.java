package com.campoapp.finanzas.cotizacion;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Feature 85: historial de cotizaciones del Dolar BNA (oficial). Se guarda append:
// la cotizacion "actual" es la fila mas reciente por fecha/createdAt.
@Entity
@Table(name = "finanzas_cotizacion_dolar")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CotizacionDolar extends AuditableEntity {

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal compra;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal venta;

    // Fecha de actualizacion informada por la fuente (fechaActualizacion).
    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(nullable = false, length = 80)
    private String fuente;
}
