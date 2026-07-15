package com.campoapp.common.idempotency;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKeyRecord, String> {

    @Modifying
    @Query("delete from IdempotencyKeyRecord k where k.createdAt < :limite")
    int deleteByCreatedAtBefore(@Param("limite") LocalDateTime limite);
}
