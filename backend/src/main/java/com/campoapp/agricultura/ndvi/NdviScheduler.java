package com.campoapp.agricultura.ndvi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

// Feature 59: dispara la generacion del NDVI cada ~15 dias y una vez al arrancar.
// Gated por enabled + credenciales; si no hay credenciales, no hace nada.
@Slf4j
@Component
@RequiredArgsConstructor
public class NdviScheduler {

    private final NdviService ndviService;
    private final NdviProperties properties;

    @Scheduled(cron = "${ndvi.sync-cron:0 0 4 */15 * *}",
            zone = "${clima.sync.zone:America/Argentina/Buenos_Aires}")
    public void generarProgramado() {
        if (!properties.isEnabled() || !properties.isConfigured()) return;
        log.info("Iniciando generacion programada de NDVI");
        ndviService.generarTodos();
    }

    // Generacion inicial al arrancar (hilo aparte para no demorar el arranque).
    @EventListener(ApplicationReadyEvent.class)
    public void generarAlIniciar() {
        if (!properties.isEnabled() || !properties.isConfigured()) return;
        Thread worker = new Thread(() -> {
            try {
                log.info("Generacion inicial de NDVI");
                ndviService.generarTodos();
            } catch (Exception e) {
                log.error("Error en la generacion inicial de NDVI: {}", e.getMessage());
            }
        }, "ndvi-startup");
        worker.setDaemon(true);
        worker.start();
    }
}
