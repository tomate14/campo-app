package com.campoapp.ganaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AnimalRequest(
        String caravana,
        String razaId,
        String raza,
        String sexo,
        LocalDate fechaNacimiento,
        LocalDate fechaCompra,
        BigDecimal pesoActualKg,
        String rfidCodigo,
        String qrCodigo,
        String estado,
        String potreroId,
        String madreId,
        String padreId,
        String observaciones
) {}
