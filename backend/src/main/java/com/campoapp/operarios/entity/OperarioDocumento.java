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
@Table(name = "operario_documentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperarioDocumento extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "operario_id", nullable = false)
    private Operario operario;

    @Column(name = "tipo_documento", nullable = false, length = 80)
    private String tipoDocumento;

    @Column(length = 80)
    private String numero;

    @Column(name = "fecha_emision")
    private LocalDate fechaEmision;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(nullable = false, length = 40)
    private String estado;

    @Column(length = 500)
    private String url;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
