package com.campoapp.clima.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "clima")
@Getter @Setter
public class ClimaProperties {

    private Openweathermap openweathermap = new Openweathermap();
    private Sync sync = new Sync();
    private int retencionDias = 30;

    @Getter @Setter
    public static class Openweathermap {
        private String apiKey = "";
        private String baseUrl = "https://api.openweathermap.org/data/2.5";
    }

    @Getter @Setter
    public static class Sync {
        private boolean enabled = true;
        private long intervaloMs = 1_800_000L;
    }

    public boolean isApiKeyConfigured() {
        return apiKey() != null && !apiKey().isBlank();
    }

    private String apiKey() {
        return openweathermap.getApiKey();
    }
}
