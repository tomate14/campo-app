package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.AgriculturaAnalyticsResponse;
import com.campoapp.agricultura.service.PredictorService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class PredictorServiceImpl implements PredictorService {

    @Override
    public AgriculturaAnalyticsResponse.Prediccion estimarSiguientePeriodo(
            List<AgriculturaAnalyticsResponse.SerieTemporal> series,
            String granularidad
    ) {
        if (series.isEmpty()) {
            return new AgriculturaAnalyticsResponse.Prediccion(
                    siguientePeriodo(periodoActual(granularidad), granularidad),
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    "BAJA",
                    "Sin datos"
            );
        }

        if (series.size() == 1) {
            return new AgriculturaAnalyticsResponse.Prediccion(
                    siguientePeriodo(series.get(0).periodo(), granularidad),
                    scale(series.get(0).rendimientoPromedioKgHa()),
                    "BAJA",
                    "Persistencia simple"
            );
        }

        double sumX = 0;
        double sumY = 0;
        double sumXY = 0;
        double sumX2 = 0;
        int n = series.size();

        for (int index = 0; index < n; index += 1) {
            double x = index + 1;
            double y = series.get(index).rendimientoPromedioKgHa().doubleValue();
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }

        double denominator = (n * sumX2) - (sumX * sumX);
        double slope = denominator == 0 ? 0 : ((n * sumXY) - (sumX * sumY)) / denominator;
        double intercept = (sumY - (slope * sumX)) / n;
        double predicted = Math.max(0, intercept + (slope * (n + 1)));

        return new AgriculturaAnalyticsResponse.Prediccion(
                siguientePeriodo(series.get(series.size() - 1).periodo(), granularidad),
                BigDecimal.valueOf(predicted).setScale(2, RoundingMode.HALF_UP),
                n >= 6 ? "MEDIA" : "BAJA",
                "Tendencia lineal"
        );
    }

    private String siguientePeriodo(String ultimoPeriodo, String granularidad) {
        if ("MENSUAL".equalsIgnoreCase(granularidad)) {
            YearMonth base = ultimoPeriodo.length() == 7
                    ? YearMonth.parse(ultimoPeriodo)
                    : YearMonth.from(LocalDate.parse(ultimoPeriodo));
            YearMonth next = base.plusMonths(1);
            return next.toString();
        }
        if ("SEMANAL".equalsIgnoreCase(granularidad)) {
            return ultimoPeriodo + "+1w";
        }
        int year = ultimoPeriodo.length() == 4
                ? Integer.parseInt(ultimoPeriodo)
                : LocalDate.parse(ultimoPeriodo).getYear();
        return String.valueOf(year + 1);
    }

    private String periodoActual(String granularidad) {
        LocalDate today = LocalDate.now();
        if ("MENSUAL".equalsIgnoreCase(granularidad)) {
            return YearMonth.from(today).toString();
        }
        if ("ANUAL".equalsIgnoreCase(granularidad)) {
            return String.valueOf(today.getYear());
        }
        return today.toString();
    }

    private BigDecimal scale(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP);
    }
}
