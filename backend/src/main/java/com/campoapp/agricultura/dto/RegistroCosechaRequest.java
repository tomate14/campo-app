package com.campoapp.agricultura.dto;

import com.campoapp.agricultura.entity.RegistroCosecha.CalidadGrano;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record RegistroCosechaRequest(
        @NotBlank(message = "El lote es requerido")
        String loteId,

        @NotNull(message = "La fecha de cosecha es requerida")
        LocalDate fecha,

        @NotNull(message = "El rendimiento es requerido")
        @DecimalMin(value = "0.0", message = "El rendimiento no puede ser negativo")
        BigDecimal rendimientoKgHa,

        @NotNull(message = "Las toneladas totales son requeridas")
        @DecimalMin(value = "0.0", message = "Las toneladas no pueden ser negativas")
        BigDecimal toneladasTotal,

        CalidadGrano calidadGrano,

        @DecimalMin(value = "0.0") @DecimalMax(value = "100.0")
        BigDecimal humedad,

        String observaciones,

        // --- Feature 60: perdidas de cosecha ---
        @DecimalMin(value = "0.0") @DecimalMax(value = "100.0")
        BigDecimal areaRealCosechadaPct,

        @PositiveOrZero
        BigDecimal hectareasCosechadas,

        @PositiveOrZero
        BigDecimal perdidaKgHa,

        @PositiveOrZero
        BigDecimal granosPerdidosKg,

        // Tipo de perdida: valor del catalogo TIPO_PERDIDA_COSECHA (string libre)
        String tipoPerdida,

        // --- Feature 60: destino del dia ---
        String destino,

        @PositiveOrZero
        BigDecimal destinoCantidadTn
) {}
