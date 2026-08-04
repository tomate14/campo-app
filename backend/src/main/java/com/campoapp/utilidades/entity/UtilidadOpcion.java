package com.campoapp.utilidades.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Opcion generica de un catalogo configurable (feature 60).
 * Cada dropdown administrable se modela como una {@code categoria} distinta,
 * por ejemplo {@code DESTINO_COSECHA}.
 */
@Entity
@Table(name = "utilidad_opcion")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UtilidadOpcion extends AuditableEntity {

    @Column(name = "categoria", nullable = false, length = 60)
    private String categoria;

    @Column(name = "valor", nullable = false, length = 160)
    private String valor;

    @Column(name = "activo", nullable = false)
    private boolean activo;

    @Column(name = "orden", nullable = false)
    private int orden;
}
