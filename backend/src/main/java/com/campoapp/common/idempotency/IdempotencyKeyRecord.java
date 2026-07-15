package com.campoapp.common.idempotency;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Respuesta cacheada de una operacion que llego con header Idempotency-Key.
 * Permite que los reintentos del outbox mobile (feature 24) no dupliquen registros
 * cuando la respuesta original se perdio por señal intermitente.
 */
@Entity
@Table(name = "idempotency_keys")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdempotencyKeyRecord {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(nullable = false, length = 8)
    private String method;

    @Column(nullable = false, length = 255)
    private String path;

    @Column(nullable = false)
    private int status;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "response_body", columnDefinition = "MEDIUMTEXT")
    private String responseBody;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
