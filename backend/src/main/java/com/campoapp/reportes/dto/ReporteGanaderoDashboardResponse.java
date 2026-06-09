package com.campoapp.reportes.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ReporteGanaderoDashboardResponse(
        LocalDateTime ultimaActualizacion,
        List<Kpi> kpis,
        List<DistribucionRodeo> distribucionRodeo,
        List<BarraCategoria> animalesPorPotrero,
        List<PotreroOcupacion> ocupacionPotreros,
        List<CalendarioSanitario> calendarioSanitario,
        List<DiagnosticoSeveridad> diagnosticosPorSeveridad,
        TratamientosActivos tratamientosActivos,
        EstadoReproductivo estadoReproductivo,
        List<SeriePunto> partosEstimadosPorMes,
        GenealogiaTrazabilidad genealogiaTrazabilidad,
        List<SerieCategoria> consumoAlimentoPorPotrero,
        CostoAlimentacion costoAlimentacion,
        ConversionAlimenticia conversionAlimenticia,
        List<DietaActiva> dietasActivas,
        List<AlertaOperativa> alertasOperativas
) {
    public record Kpi(
            String codigo,
            String titulo,
            String valor,
            String subtitulo,
            String tono,
            BigDecimal valorNumerico,
            String tendencia
    ) {}

    public record DistribucionRodeo(
            String categoria,
            long cantidad,
            BigDecimal porcentaje,
            String color
    ) {}

    public record BarraCategoria(
            String etiqueta,
            long valor,
            BigDecimal porcentaje,
            String color
    ) {}

    public record PotreroOcupacion(
            String nombre,
            int cargaActual,
            int capacidad,
            BigDecimal porcentaje,
            String estado,
            String recursoForrajero
    ) {}

    public record CalendarioSanitario(
            String vacuna,
            long vencidas,
            long proximas,
            long programadas,
            boolean obligatoria
    ) {}

    public record DiagnosticoSeveridad(
            String severidad,
            long cantidad,
            BigDecimal porcentaje,
            String color
    ) {}

    public record TratamientosActivos(
            long animalesEnTratamiento,
            long diagnosticosAbiertos,
            long casosCriticos,
            BigDecimal costoMes
    ) {}

    public record EstadoReproductivo(
            long prenadas,
            long vacias,
            long enControl,
            long proximasAParir,
            long torosActivos
    ) {}

    public record SeriePunto(
            String etiqueta,
            BigDecimal valor
    ) {}

    public record GenealogiaTrazabilidad(
            BigDecimal porcentajeCompleta,
            long sinMadre,
            long sinPadre,
            long sinRaza,
            long sinFechaNacimiento,
            long sinTrazabilidad
    ) {}

    public record SerieCategoria(
            String categoria,
            List<SeriePunto> puntos,
            BigDecimal total
    ) {}

    public record CostoAlimentacion(
            BigDecimal valorMes,
            BigDecimal variacionMensual,
            String moneda
    ) {}

    public record ConversionAlimenticia(
            BigDecimal valor,
            String unidad
    ) {}

    public record DietaActiva(
            String nombre,
            String tipoAnimal,
            String objetivo,
            BigDecimal materiaSecaKg,
            BigDecimal costoDiario
    ) {}

    public record AlertaOperativa(
            String tipo,
            String titulo,
            String detalle,
            String prioridad,
            LocalDateTime fechaGeneracion
    ) {}
}
