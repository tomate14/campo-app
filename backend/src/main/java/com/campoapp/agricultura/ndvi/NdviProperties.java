package com.campoapp.agricultura.ndvi;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

// Feature 59: configuracion del NDVI (mapa de verdes). Todas las credenciales y URLs
// vienen del .env via application.yml (${NDVI_*}). Sin credenciales el proceso no corre.
@Component
@ConfigurationProperties(prefix = "ndvi")
@Getter @Setter
public class NdviProperties {

    private boolean enabled = true;
    private String clientId = "";
    private String clientSecret = "";
    private String tokenUrl = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";
    private String processUrl = "https://sh.dataspace.copernicus.eu/api/v1/process";
    // Carpeta respaldada por un volumen de Docker; se guarda una imagen por lote (se pisa).
    private String dir = "/app/ndvi";
    private String syncCron = "0 0 4 */15 * *";
    private int ventanaDias = 15;
    private int maxNubosidad = 40;
    private int imgSize = 512;

    // Solo corre si hay credenciales OAuth2 de CDSE cargadas.
    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank()
                && clientSecret != null && !clientSecret.isBlank();
    }
}
