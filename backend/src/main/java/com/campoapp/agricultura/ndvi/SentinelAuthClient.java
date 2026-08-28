package com.campoapp.agricultura.ndvi;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Instant;

// Feature 59: token OAuth2 client-credentials contra CDSE, cacheado hasta su expiracion.
@Slf4j
@Component
@RequiredArgsConstructor
public class SentinelAuthClient {

    private final NdviProperties properties;
    @Qualifier("ndviRestClient")
    private final RestClient restClient;

    private String cachedToken;
    private Instant expiresAt = Instant.EPOCH;

    public synchronized String obtenerToken() {
        // Margen de 60s para no usar un token a punto de expirar.
        if (cachedToken != null && Instant.now().isBefore(expiresAt.minusSeconds(60))) {
            return cachedToken;
        }
        String form = "grant_type=client_credentials"
                + "&client_id=" + properties.getClientId()
                + "&client_secret=" + properties.getClientSecret();

        TokenResponse response = restClient.post()
                .uri(properties.getTokenUrl())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(TokenResponse.class);

        if (response == null || response.accessToken() == null) {
            throw new IllegalStateException("CDSE no devolvio access_token");
        }
        long expiresIn = response.expiresIn() != null ? response.expiresIn() : 600L;
        cachedToken = response.accessToken();
        expiresAt = Instant.now().plusSeconds(expiresIn);
        log.debug("Token CDSE renovado, expira en {}s", expiresIn);
        return cachedToken;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record TokenResponse(
            @com.fasterxml.jackson.annotation.JsonProperty("access_token") String accessToken,
            @com.fasterxml.jackson.annotation.JsonProperty("expires_in") Long expiresIn) {}
}
