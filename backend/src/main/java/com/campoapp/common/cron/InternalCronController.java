package com.campoapp.common.cron;

import com.campoapp.clima.config.ClimaProperties;
import com.campoapp.clima.service.ClimaService;
import com.campoapp.common.dto.ApiResponse;
import com.campoapp.common.idempotency.IdempotencyMaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/internal/cron")
@RequiredArgsConstructor
public class InternalCronController {

    private final ClimaService climaService;
    private final ClimaProperties climaProperties;
    private final IdempotencyMaintenanceService idempotencyMaintenanceService;

    @Value("${cron.secret:}")
    private String cronSecret;

    @Value("${idempotency.retention-days:30}")
    private int idempotencyRetentionDays;

    @GetMapping("/clima/sync")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncClimate(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        if (!isAuthorized(authorization)) {
            return unauthorized();
        }

        climaService.sincronizarTodosLotes();
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "job", "clima-sync"
        )));
    }

    @GetMapping("/clima/precipitaciones")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncPrecipitation(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        if (!isAuthorized(authorization)) {
            return unauthorized();
        }

        int days = Math.max(1, climaProperties.getSync().getPrecipitacionHistoricaDias());
        climaService.sincronizarPrecipitacionesHistoricas(days);
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "job", "precipitaciones",
                "days", days
        )));
    }

    @GetMapping("/idempotency/purge")
    public ResponseEntity<ApiResponse<Map<String, Object>>> purgeIdempotencyKeys(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        if (!isAuthorized(authorization)) {
            return unauthorized();
        }

        int removed = idempotencyMaintenanceService.purgeExpiredKeys(idempotencyRetentionDays);
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "success", true,
                "job", "idempotency-purge",
                "removed", removed
        )));
    }

    private boolean isAuthorized(String authorization) {
        if (!StringUtils.hasText(cronSecret) || !StringUtils.hasText(authorization)) {
            return false;
        }

        byte[] expected = ("Bearer " + cronSecret).getBytes(StandardCharsets.UTF_8);
        byte[] actual = authorization.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, actual);
    }

    private ResponseEntity<ApiResponse<Map<String, Object>>> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Cron no autorizado"));
    }
}
