package com.campoapp.ganaderia.entity;

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

@Entity
@Table(name = "potreros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Potrero extends AuditableEntity {

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "superficie_ha", nullable = false, precision = 10, scale = 2)
    private BigDecimal superficieHa;

    @Column(name = "tipo_uso", nullable = false, length = 40)
    private String tipoUso;

    @Column(nullable = false, length = 40)
    private String estado;

    @Column(name = "capacidad_animales")
    private Integer capacidadAnimales;

    @Column(name = "carga_animal_actual")
    private Integer cargaAnimalActual;

    @Column(name = "recurso_forrajero", length = 120)
    private String recursoForrajero;

    @Column(name = "disponibilidad_agua", nullable = false)
    private Boolean disponibilidadAgua;

    @Column(name = "tiene_sombra", nullable = false)
    private Boolean tieneSombra;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(nullable = false, columnDefinition = "JSON")
    private String poligono;

    @Column(name = "centroide_latitud", precision = 10, scale = 7)
    private BigDecimal centroideLatitud;

    @Column(name = "centroide_longitud", precision = 10, scale = 7)
    private BigDecimal centroideLongitud;
}
