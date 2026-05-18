package com.campoapp.auth.service;

import com.campoapp.auth.entity.AuditLog;
import com.campoapp.auth.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(String userId, String action, String resource, String resourceId, String ipAddress) {
        log(userId, action, resource, resourceId, null, ipAddress);
    }

    @Async
    public void log(String userId, String action, String resource, String resourceId, String changes, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .action(action)
                    .resource(resource)
                    .resourceId(resourceId)
                    .changes(changes)
                    .ipAddress(ipAddress)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // La auditoría nunca debe romper el flujo principal
            log.error("Error al guardar audit log: {}", e.getMessage());
        }
    }
}
