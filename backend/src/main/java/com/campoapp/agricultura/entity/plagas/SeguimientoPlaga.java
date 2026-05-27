package com.campoapp.agricultura.entity.plagas;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "seguimientos_plaga")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SeguimientoPlaga extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "deteccion_id", nullable = false)
    private DeteccionPlaga deteccion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 40)
    private ResultadoSeguimientoPlaga resultado;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 40)
    private SeveridadPlaga severidad;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(length = 180)
    private String responsable;
}
