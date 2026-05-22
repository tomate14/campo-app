package com.campoapp.agricultura.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lotes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Lote extends AuditableEntity {

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal area;

    @Column(nullable = false, length = 50)
    private String cultivo;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitud;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitud;

    @Column(nullable = false, length = 20)
    private String temporada;

    @Column(columnDefinition = "JSON")
    private String poligono;

    @Column(name = "ph_minimo", precision = 4, scale = 2)
    private BigDecimal phMinimo;

    @Column(name = "ph_maximo", precision = 4, scale = 2)
    private BigDecimal phMaximo;

    @Column(name = "fecha_siembra")
    private LocalDate fechaSiembra;

    @Column(name = "fecha_cosecha_estimada")
    private LocalDate fechaCosechaEstimada;

    @OneToMany(mappedBy = "lote", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PropiedadSuelo> propiedadesSuelo = new ArrayList<>();

    @OneToMany(mappedBy = "lote", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<HistoricoCultivo> historicoCultivos = new ArrayList<>();

    @OneToMany(mappedBy = "lote", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<EventoSiembra> eventos = new ArrayList<>();

    @OneToMany(mappedBy = "lote", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<RegistroCosecha> cosechas = new ArrayList<>();
}
