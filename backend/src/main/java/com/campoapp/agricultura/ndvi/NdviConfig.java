package com.campoapp.agricultura.ndvi;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

// Feature 59: cliente HTTP para CDSE (token OAuth2 + Process API). Sin baseUrl:
// se usan las URLs completas configurables desde el .env.
@Configuration
public class NdviConfig {

    @Bean("ndviRestClient")
    public RestClient ndviRestClient() {
        return RestClient.builder().build();
    }
}
