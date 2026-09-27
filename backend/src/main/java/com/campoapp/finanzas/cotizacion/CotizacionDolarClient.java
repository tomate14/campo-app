package com.campoapp.finanzas.cotizacion;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

// Feature 85: obtiene la cotizacion del Dolar BNA (oficial) desde la fuente publica.
// Ante cualquier error (timeout, http, parseo) loguea y devuelve vacio, sin romper el scheduler.
@Slf4j
@Component
public class CotizacionDolarClient {

    // Zona local para convertir la fechaActualizacion (que viene en UTC / con Z).
    private static final ZoneId ZONA = ZoneId.of("America/Argentina/Buenos_Aires");

    private final CotizacionDolarProperties properties;
    private final RestClient restClient;

    public CotizacionDolarClient(CotizacionDolarProperties properties,
                                 @Qualifier("cotizacionDolarRestClient") RestClient restClient) {
        this.properties = properties;
        this.restClient = restClient;
    }

    public Optional<Snapshot> obtener() {
        try {
            DolarApiResponse response = restClient.get()
                    .uri(properties.getUrl())
                    .retrieve()
                    .body(DolarApiResponse.class);

            if (response == null || response.compra() == null || response.venta() == null) {
                log.warn("La fuente de cotizacion no devolvio compra/venta validos");
                return Optional.empty();
            }
            LocalDateTime fecha = parseFecha(response.fechaActualizacion());
            return Optional.of(new Snapshot(response.compra(), response.venta(), fecha));
        } catch (Exception e) {
            log.warn("No se pudo obtener la cotizacion del Dolar BNA: {}", e.getMessage());
            return Optional.empty();
        }
    }

    // La fuente entrega un instante ISO-8601 con Z (UTC); si falta o no parsea, usamos ahora.
    private LocalDateTime parseFecha(String fechaActualizacion) {
        if (fechaActualizacion == null || fechaActualizacion.isBlank()) {
            return LocalDateTime.now(ZONA);
        }
        try {
            return LocalDateTime.ofInstant(Instant.parse(fechaActualizacion), ZONA);
        } catch (Exception e) {
            log.debug("fechaActualizacion no parseable ({}), se usa la hora actual", fechaActualizacion);
            return LocalDateTime.now(ZONA);
        }
    }

    // Resultado normalizado del fetch: compra/venta y la fecha de la fuente ya en hora local.
    public record Snapshot(BigDecimal compra, BigDecimal venta, LocalDateTime fecha) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record DolarApiResponse(BigDecimal compra, BigDecimal venta, String fechaActualizacion) {}
}
