package com.campoapp.operarios.entity;

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

import java.time.LocalDate;

@Entity
@Table(name = "operario_historial_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperarioHistorialRol extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "operario_id", nullable = false)
    private Operario operario;

    @Column(name = "rol_anterior", length = 80)
    private String rolAnterior;

    @Column(name = "rol_nuevo", nullable = false, length = 80)
    private String rolNuevo;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(length = 160)
    private String responsable;

    @Column(columnDefinition = "TEXT")
    private String motivo;
}
