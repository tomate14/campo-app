package com.campoapp.agricultura.gbif;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Bean RestClient para consultar la API de GBIF (patron clima, feature 73).
 */
@Configuration
@RequiredArgsConstructor
public class GbifConfig {

    private final GbifProperties properties;

    @Bean("gbifRestClient")
    public RestClient gbifRestClient() {
        return RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .build();
    }
}
