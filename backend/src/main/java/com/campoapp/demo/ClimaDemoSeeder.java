package com.campoapp.demo;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.clima.entity.DatoClima;
import com.campoapp.clima.entity.PrecipitacionDiaria;
import com.campoapp.clima.repository.DatoClimaRepository;
import com.campoapp.clima.repository.PrecipitacionDiariaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Seeder de datos de demo del dominio Clima (feature 76).
 *
 * Para los primeros 3 lotes demo siembra una serie corta (14 dias recientes) de
 * precipitacion diaria y de mediciones de clima, para que las cards de precipitacion y
 * los graficos tengan datos. Corre despues de agricultura (orden 40 > 10). Idempotente
 * por ids fijos {@code demo-}.
 */
@Component
@RequiredArgsConstructor
public class ClimaDemoSeeder implements DemoSeeder {

    private final LoteRepository loteRepository;
    private final PrecipitacionDiariaRepository precipitacionDiariaRepository;
    private final DatoClimaRepository datoClimaRepository;

    /** Cantidad de dias hacia atras que se siembran. */
    private static final int DIAS = 14;

    /** Cantidad de lotes demo a los que se les carga clima. */
    private static final int LOTES_CON_CLIMA = 3;

    /** Patron ciclico de mm de lluvia por dia (deterministico). */
    private static final double[] PRECIP_MM = {0, 5, 12, 0, 0, 3, 20, 8, 0, 0, 15, 2, 0, 6};

    private static final String FUENTE = "DEMO";

    @Override
    public int orden() {
        return 40;
    }

    @Override
    public String nombre() {
        return "clima";
    }

    @Override
    @Transactional
    public int sembrar() {
        int creados = 0;
        LocalDate hoy = LocalDate.now();

        for (int l = 0; l < LOTES_CON_CLIMA; l++) {
            String loteId = DemoIds.LOTES[l];
            Lote lote = loteRepository.findById(loteId).orElse(null);
            if (lote == null) {
                continue;
            }

            for (int d = 0; d < DIAS; d++) {
                LocalDate fecha = hoy.minusDays(d);
                double mm = PRECIP_MM[(d + l) % PRECIP_MM.length];
                creados += sembrarPrecipitacion(lote, l, d, fecha, mm);
                creados += sembrarDatoClima(lote, l, d, fecha, mm);
            }
        }

        return creados;
    }

    /** Registro de precipitacion diaria para un lote/dia. */
    private int sembrarPrecipitacion(Lote lote, int loteIdx, int dia, LocalDate fecha, double mm) {
        String id = "demo-precip-" + (loteIdx + 1) + "-" + dia;
        if (precipitacionDiariaRepository.existsById(id)) {
            return 0;
        }

        PrecipitacionDiaria precip = PrecipitacionDiaria.builder()
                .lote(lote)
                .fecha(fecha)
                .precipitacionMm(BigDecimal.valueOf(mm))
                .fuente(FUENTE)
                .build();
        precip.setId(id);
        precipitacionDiariaRepository.save(precip);
        return 1;
    }

    /** Medicion de clima (temperaturas, humedad, lluvia) para un lote/dia. */
    private int sembrarDatoClima(Lote lote, int loteIdx, int dia, LocalDate fecha, double mm) {
        String id = "demo-clima-" + (loteIdx + 1) + "-" + dia;
        if (datoClimaRepository.existsById(id)) {
            return 0;
        }

        // Temperaturas coherentes con verano/otono de la zona, con leve variacion diaria.
        double base = 24.0 - (dia % 5) - loteIdx * 0.5;
        boolean lluvia = mm > 0;

        DatoClima dato = DatoClima.builder()
                .lote(lote)
                .timestampUtc(LocalDateTime.of(fecha, LocalTime.NOON))
                .temperatura(BigDecimal.valueOf(base))
                .sensacionTermica(BigDecimal.valueOf(base + 1.5))
                .tempMin(BigDecimal.valueOf(base - 6))
                .tempMax(BigDecimal.valueOf(base + 5))
                .humedadPct(lluvia ? 82 : 58)
                .presionHpa(1013)
                .velocidadViento(BigDecimal.valueOf(12.5))
                .direccionViento(180)
                .descripcion(lluvia ? "Lluvia ligera" : "Cielo despejado")
                .iconoCodigo(lluvia ? "10d" : "01d")
                .precipitacionesMm(BigDecimal.valueOf(mm))
                .nubosidadPct(lluvia ? 75 : 10)
                .condicionCodigo(lluvia ? 500 : 800)
                .nombreLocalidad(lote.getNombre())
                .build();
        dato.setId(id);
        datoClimaRepository.save(dato);
        return 1;
    }
}
