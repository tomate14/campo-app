package com.campoapp.clima.dto.owm;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record OWMCurrentResponse(
        @JsonProperty("weather") List<WeatherItem> weather,
        @JsonProperty("main")    MainData main,
        @JsonProperty("wind")    WindData wind,
        @JsonProperty("rain")    RainData rain,
        @JsonProperty("clouds")  CloudsData clouds,
        @JsonProperty("dt")      long dt,
        @JsonProperty("name")    String name,
        @JsonProperty("cod")     int cod
) {
    public record WeatherItem(
            @JsonProperty("id")          int id,
            @JsonProperty("main")        String main,
            @JsonProperty("description") String description,
            @JsonProperty("icon")        String icon
    ) {}

    public record MainData(
            @JsonProperty("temp")       double temp,
            @JsonProperty("feels_like") double feelsLike,
            @JsonProperty("temp_min")   double tempMin,
            @JsonProperty("temp_max")   double tempMax,
            @JsonProperty("pressure")   int pressure,
            @JsonProperty("humidity")   int humidity
    ) {}

    public record WindData(
            @JsonProperty("speed") double speed,
            @JsonProperty("deg")   Integer deg
    ) {}

    public record RainData(
            @JsonProperty("1h") Double oneHour,
            @JsonProperty("3h") Double threeHour
    ) {}

    public record CloudsData(
            @JsonProperty("all") int all
    ) {}
}
