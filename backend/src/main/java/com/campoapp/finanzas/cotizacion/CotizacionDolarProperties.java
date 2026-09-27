package com.campoapp.finanzas.cotizacion;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

// Feature 85: configuracion de la integracion de la cotizacion del Dolar BNA (oficial).
// URL/intervalo vienen del .env via application.yml (${COTIZACION_DOLAR_*}). Sin URL no corre.
@Component
@ConfigurationProperties(prefix = "cotizacion.dolar")
@Getter @Setter
public class CotizacionDolarProperties {

    private boolean enabled = true;
    private String url = "https://dolarapi.com/v1/dolares/oficial";
    private String syncCron = "0 0 8,14 * * *";

    // Solo corre si hay una URL de fuente configurada.
    public boolean isConfigured() {
        return url != null && !url.isBlank();
    }
}
