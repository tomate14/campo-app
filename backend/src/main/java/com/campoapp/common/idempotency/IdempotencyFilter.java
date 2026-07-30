package com.campoapp.common.idempotency;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

/**
 * Filtro generico de idempotencia para el outbox offline mobile (feature 24).
 *
 * Si un POST/PUT llega con header Idempotency-Key ya visto, devuelve la respuesta
 * cacheada sin re-ejecutar el handler (evita duplicados cuando el cliente reintenta
 * porque la respuesta original se perdio). Solo cachea respuestas 2xx: los errores
 * de validacion no mutan estado, asi que reintentarlos es inocuo.
 *
 * Se registra dentro de la cadena de Spring Security (despues de la autorizacion,
 * ver SecurityConfig) para que una clave repetida nunca sirva respuestas sin pasar
 * por autenticacion. La clave ademas queda atada al usuario que la creo.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class IdempotencyFilter extends OncePerRequestFilter {

    public static final String HEADER = "Idempotency-Key";
    private static final Set<String> METHODS = Set.of("POST", "PUT");
    private static final int MAX_KEY_LENGTH = 64;
    private final IdempotencyKeyRepository repository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String key = request.getHeader(HEADER);
        return !StringUtils.hasText(key)
                || key.length() > MAX_KEY_LENGTH
                || !METHODS.contains(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String key = request.getHeader(HEADER);
        String userId = currentUserId();

        Optional<IdempotencyKeyRecord> existing = repository.findById(key);
        if (existing.isPresent()) {
            IdempotencyKeyRecord record = existing.get();
            boolean mismoUsuario = record.getUserId() == null || record.getUserId().equals(userId);
            if (mismoUsuario) {
                log.debug("Idempotency-Key repetida {}: devolviendo respuesta cacheada", key);
                replay(record, response);
                return;
            }
            // Colision de clave entre usuarios distintos: se ejecuta normal sin cachear.
            filterChain.doFilter(request, response);
            return;
        }

        ContentCachingResponseWrapper wrapper = new ContentCachingResponseWrapper(response);
        try {
            filterChain.doFilter(request, wrapper);
            store(key, userId, request, wrapper);
        } finally {
            wrapper.copyBodyToResponse();
        }
    }

    private void store(String key, String userId, HttpServletRequest request, ContentCachingResponseWrapper wrapper) {
        int status = wrapper.getStatus();
        if (status < 200 || status >= 300) {
            return;
        }

        try {
            repository.save(IdempotencyKeyRecord.builder()
                    .id(key)
                    .userId(userId)
                    .method(request.getMethod())
                    .path(request.getRequestURI())
                    .status(status)
                    .contentType(wrapper.getContentType())
                    .responseBody(new String(wrapper.getContentAsByteArray(), StandardCharsets.UTF_8))
                    .createdAt(LocalDateTime.now())
                    .build());
        } catch (DataIntegrityViolationException e) {
            // Carrera entre dos reintentos simultaneos con la misma clave: el primero gano, no pasa nada.
            log.debug("Idempotency-Key {} ya registrada por una request concurrente", key);
        }
    }

    private void replay(IdempotencyKeyRecord record, HttpServletResponse response) throws IOException {
        response.setStatus(record.getStatus());
        response.setContentType(record.getContentType() != null ? record.getContentType() : MediaType.APPLICATION_JSON_VALUE);
        if (record.getResponseBody() != null) {
            response.getWriter().write(record.getResponseBody());
        }
    }

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getPrincipal() instanceof String principal ? principal : null;
    }

}
