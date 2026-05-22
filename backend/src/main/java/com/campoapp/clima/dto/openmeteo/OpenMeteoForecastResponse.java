package com.campoapp.clima.dto.openmeteo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenMeteoForecastResponse(
        Integer utc_offset_seconds,
        String timezone,
        Current current,
        Daily daily
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Current(
            String time,
            BigDecimal temperature_2m,
            Integer relative_humidity_2m,
            BigDecimal apparent_temperature,
            Integer pressure_msl,
            BigDecimal wind_speed_10m,
            Integer wind_direction_10m,
            BigDecimal precipitation,
            Integer cloud_cover,
            Integer weather_code,
            Integer is_day
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Daily(
            List<String> time,
            List<Integer> weather_code,
            List<BigDecimal> temperature_2m_max,
            List<BigDecimal> temperature_2m_min,
            List<BigDecimal> apparent_temperature_max,
            List<BigDecimal> apparent_temperature_min,
            List<BigDecimal> uv_index_max,
            List<BigDecimal> precipitation_probability_max,
            List<BigDecimal> precipitation_sum,
            List<BigDecimal> wind_speed_10m_max,
            List<Integer> wind_direction_10m_dominant
    ) {}
}
