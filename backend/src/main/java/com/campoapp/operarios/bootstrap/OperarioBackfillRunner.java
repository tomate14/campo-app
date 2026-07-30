package com.campoapp.operarios.bootstrap;

import com.campoapp.auth.entity.User;
import com.campoapp.auth.repository.UserRepository;
import com.campoapp.operarios.repository.OperarioRepository;
import com.campoapp.operarios.service.OperarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Backfill idempotente al arranque: garantiza que todo usuario existente tenga
 * su ficha de operario (relacion 1:1). Los usuarios auto-registrados antes de la
 * feature 63 no tenian ficha; este runner se las crea. En arranques posteriores
 * no crea nada nuevo porque provisionarDesdeUsuario es idempotente.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OperarioBackfillRunner {

    private final UserRepository userRepository;
    private final OperarioRepository operarioRepository;
    private final OperarioService operarioService;

    @EventListener(ApplicationReadyEvent.class)
    public void backfillOperarios() {
        List<User> users = userRepository.findAll();
        int creados = 0;
        for (User user : users) {
            // Saltar usuarios que ya tienen ficha activa
            if (operarioRepository.existsByUserIdAndDeletedAtIsNull(user.getId())) {
                continue;
            }
            try {
                // provisionarDesdeUsuario es @Transactional: cada provision abre su
                // propia transaccion (el listener no es transaccional)
                operarioService.provisionarDesdeUsuario(user);
                creados++;
            } catch (Exception ex) {
                // Un usuario problematico no debe abortar el backfill del resto
                log.warn("No se pudo provisionar ficha de operario para el usuario {} ({}): {}",
                        user.getId(), user.getEmail(), ex.getMessage());
            }
        }
        if (creados > 0) {
            log.info("Backfill de operarios: se crearon {} fichas para usuarios sin ficha", creados);
        }
    }
}
