package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PotreroResponse(
        String id,
        String nombre,
        String descripcion,
        BigDecimal superficieHa,
        String tipoUso,
        String estado,
        Integer capacidadAnimales,
        Integer cargaAnimalActual,
        String recursoForrajero,
        Boolean disponibilidadAgua,
        Boolean tieneSombra,
        String observaciones,
        String poligono,
        BigDecimal centroideLatitud,
        BigDecimal centroideLongitud,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
