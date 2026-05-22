package com.campoapp.clima.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "clima")
@Getter @Setter
public class ClimaProperties {

    private OpenMeteo openMeteo = new OpenMeteo();
    private Sync sync = new Sync();
    private int retencionDias = 30;
    private int forecastDays = 7;

    @Getter @Setter
    public static class OpenMeteo {
        private String baseUrl = "https://api.open-meteo.com/v1";
    }

    @Getter @Setter
    public static class Sync {
        private boolean enabled = true;
        private long intervaloMs = 1_800_000L;
    }

    public boolean isConfigured() {
        return openMeteo.getBaseUrl() != null && !openMeteo.getBaseUrl().isBlank();
    }
}
