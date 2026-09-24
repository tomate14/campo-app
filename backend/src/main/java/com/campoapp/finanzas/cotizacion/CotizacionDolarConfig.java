package com.campoapp.finanzas.cotizacion;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

// Feature 85: cliente HTTP para la fuente publica de cotizaciones (dolarapi). Sin baseUrl:
// se usa la URL completa configurable desde el .env. Timeouts cortos para no colgar el scheduler.
@Configuration
public class CotizacionDolarConfig {

    @Bean("cotizacionDolarRestClient")
    public RestClient cotizacionDolarRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(5));
        return RestClient.builder().requestFactory(factory).build();
    }
}
