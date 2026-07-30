package com.campoapp.common.idempotency;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotencyMaintenanceService {

    private final IdempotencyKeyRepository repository;

    @Transactional
    public int purgeExpiredKeys(int retentionDays) {
        int normalizedRetentionDays = Math.max(1, retentionDays);
        int removed = repository.deleteByCreatedAtBefore(
                LocalDateTime.now().minusDays(normalizedRetentionDays));
        if (removed > 0) {
            log.info("Idempotencia: {} claves vencidas eliminadas", removed);
        }
        return removed;
    }
}
