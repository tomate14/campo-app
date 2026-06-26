package com.campoapp.ganaderia.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "animales")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Animal extends AuditableEntity {

    @Column(nullable = false, unique = true, length = 80)
    private String caravana;

    @Column(nullable = false, length = 120)
    private String raza;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raza_id")
    private CatalogoRazaBovina razaCatalogo;

    @Column(length = 20)
    private String sexo;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "fecha_compra")
    private LocalDate fechaCompra;

    @Column(name = "peso_actual_kg", precision = 10, scale = 2)
    private BigDecimal pesoActualKg;

    @Column(name = "rfid_codigo", unique = true, length = 120)
    private String rfidCodigo;

    @Column(name = "qr_codigo", length = 255)
    private String qrCodigo;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String estado = "ACTIVO";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "madre_id")
    private Animal madre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "padre_id")
    private Animal padre;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
