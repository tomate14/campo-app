package com.campoapp.auth.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    @Value("${rate-limit.login.max-attempts:5}")
    private int maxAttempts;

    @Value("${rate-limit.login.block-duration-minutes:15}")
    private int blockDurationMinutes;

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public boolean isBlocked(String email) {
        return !getBucket(email).tryConsume(1);
    }

    public void recordSuccessfulLogin(String email) {
        buckets.remove(email); // resetear al hacer login exitoso
    }

    private Bucket getBucket(String email) {
        return buckets.computeIfAbsent(email, k ->
            Bucket.builder()
                .addLimit(Bandwidth.classic(maxAttempts,
                    Refill.intervally(maxAttempts, Duration.ofMinutes(blockDurationMinutes))))
                .build()
        );
    }
}
