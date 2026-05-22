package com.campoapp.agricultura;

import com.campoapp.agricultura.dto.AgriculturaAnalyticsResponse;
import com.campoapp.agricultura.service.impl.PredictorServiceImpl;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PredictorServiceTest {

    private final PredictorServiceImpl predictorService = new PredictorServiceImpl();

    @Test
    void shouldReturnNextMonthWhenSeriesIsEmptyAndGranularityIsMonthly() {
        AgriculturaAnalyticsResponse.Prediccion prediction = predictorService.estimarSiguientePeriodo(List.of(), "MENSUAL");

        assertEquals(7, prediction.proximoPeriodo().length());
        assertEquals("Sin datos", prediction.metodo());
        assertEquals("BAJA", prediction.confianza());
    }
}
