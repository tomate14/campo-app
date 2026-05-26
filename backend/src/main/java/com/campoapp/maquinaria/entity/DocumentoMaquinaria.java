package com.campoapp.maquinaria.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "documentos_maquinaria")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DocumentoMaquinaria extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquinaria_id", nullable = false)
    private Maquinaria maquinaria;
    @Column(name = "tipo_documento", nullable = false, length = 100)
    private String tipoDocumento;
    @Column(length = 120)
    private String numero;
    private LocalDate vencimiento;
    @Column(length = 500)
    private String url;
    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
