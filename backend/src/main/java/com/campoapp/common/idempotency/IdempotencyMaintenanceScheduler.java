package com.campoapp.common.idempotency;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.scheduling", name = "enabled", havingValue = "true", matchIfMissing = true)
public class IdempotencyMaintenanceScheduler {

    private final IdempotencyMaintenanceService maintenanceService;

    @Value("${idempotency.retention-days:30}")
    private int retentionDays;

    @Scheduled(
            cron = "${idempotency.cleanup.cron:0 30 3 * * *}",
            zone = "${idempotency.cleanup.zone:America/Argentina/Buenos_Aires}")
    public void purgeExpiredKeys() {
        maintenanceService.purgeExpiredKeys(retentionDays);
    }
}
