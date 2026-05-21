package com.campoapp.clima.dto.owm;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record OWMForecastResponse(
        @JsonProperty("list") List<ForecastItem> list,
        @JsonProperty("city") CityData city
) {
    public record ForecastItem(
            @JsonProperty("dt")      long dt,
            @JsonProperty("main")    MainData main,
            @JsonProperty("weather") List<WeatherItem> weather,
            @JsonProperty("wind")    WindData wind,
            @JsonProperty("pop")     double pop,
            @JsonProperty("rain")    RainData rain,
            @JsonProperty("clouds")  CloudsData clouds,
            @JsonProperty("dt_txt")  String dtTxt
    ) {}

    public record MainData(
            @JsonProperty("temp")       double temp,
            @JsonProperty("feels_like") double feelsLike,
            @JsonProperty("temp_min")   double tempMin,
            @JsonProperty("temp_max")   double tempMax,
            @JsonProperty("pressure")   int pressure,
            @JsonProperty("humidity")   int humidity
    ) {}

    public record WeatherItem(
            @JsonProperty("id")          int id,
            @JsonProperty("main")        String main,
            @JsonProperty("description") String description,
            @JsonProperty("icon")        String icon
    ) {}

    public record WindData(
            @JsonProperty("speed") double speed,
            @JsonProperty("deg")   Integer deg
    ) {}

    public record RainData(
            @JsonProperty("3h") Double threeHour
    ) {}

    public record CloudsData(
            @JsonProperty("all") int all
    ) {}

    public record CityData(
            @JsonProperty("name")  String name,
            @JsonProperty("coord") CoordData coord
    ) {}

    public record CoordData(
            @JsonProperty("lat") double lat,
            @JsonProperty("lon") double lon
    ) {}
}
