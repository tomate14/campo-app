package com.campoapp.clima.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@RequiredArgsConstructor
public class ClimaConfig {

    private final ClimaProperties properties;

    @Bean("openMeteoRestClient")
    public RestClient openMeteoRestClient() {
        return RestClient.builder()
                .baseUrl(properties.getOpenMeteo().getBaseUrl())
                .build();
    }
}
