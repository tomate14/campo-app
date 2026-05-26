package com.campoapp.maquinaria.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "maquinaria")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Maquinaria extends AuditableEntity {
    @Column(nullable = false, unique = true, length = 80)
    private String codigo;
    @Column(nullable = false, length = 80)
    private String tipo;
    @Column(nullable = false, length = 120)
    private String marca;
    @Column(nullable = false, length = 120)
    private String modelo;
    @Column(name = "numero_serie", length = 120)
    private String numeroSerie;
    private Integer anio;
    @Column(nullable = false, length = 40)
    @Builder.Default
    private String estado = "DISPONIBLE";
    @Column(name = "ubicacion_actual", length = 180)
    private String ubicacionActual;
    @Column(name = "potencia_hp", precision = 10, scale = 2)
    private BigDecimal potenciaHp;
    @Column(length = 180)
    private String capacidad;
    @Column(columnDefinition = "TEXT")
    private String accesorios;
    @Column(precision = 12, scale = 2)
    private BigDecimal horometro;
    @Column(precision = 12, scale = 2)
    private BigDecimal kilometraje;
    @Column(name = "costo_adquisicion", precision = 14, scale = 2)
    private BigDecimal costoAdquisicion;
    @Column(name = "fecha_alta")
    private LocalDate fechaAlta;
    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
