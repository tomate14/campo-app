package com.campoapp.agricultura.gbif;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuracion del cliente GBIF y del sync del catalogo de referencia de plagas (feature 73).
 */
@Component
@ConfigurationProperties(prefix = "gbif")
@Getter @Setter
public class GbifProperties {

    private String baseUrl = "https://api.gbif.org/v1";
    private int mediaLimit = 5;
    private Sync sync = new Sync();

    @Getter @Setter
    public static class Sync {
        private boolean enabled = true;
        private String cron = "0 0 3 * * *";
    }
}
