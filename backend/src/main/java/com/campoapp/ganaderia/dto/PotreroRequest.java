package com.campoapp.ganaderia.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PotreroRequest(
        @NotBlank String nombre,
        String descripcion,
        @NotNull @DecimalMin("0.00") BigDecimal superficieHa,
        String tipoUso,
        String estado,
        Integer capacidadAnimales,
        Integer cargaAnimalActual,
        String recursoForrajero,
        Boolean disponibilidadAgua,
        Boolean tieneSombra,
        String observaciones,
        @NotBlank String poligono,
        BigDecimal centroideLatitud,
        BigDecimal centroideLongitud
) {
}
