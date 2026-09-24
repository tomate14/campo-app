package com.campoapp.finanzas.cotizacion;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

// Feature 85: refresca la cotizacion del Dolar BNA dos veces por dia y una vez al arrancar.
// Gated por enabled + URL configurada; si no, no hace nada.
@Slf4j
@Component
@RequiredArgsConstructor
public class CotizacionDolarScheduler {

    private final CotizacionDolarService cotizacionDolarService;
    private final CotizacionDolarProperties properties;

    @Scheduled(cron = "${cotizacion.dolar.sync-cron:0 0 8,14 * * *}",
            zone = "${clima.sync.zone:America/Argentina/Buenos_Aires}")
    public void refrescarProgramado() {
        if (!properties.isEnabled() || !properties.isConfigured()) return;
        log.info("Iniciando refresco programado de la cotizacion del Dolar BNA");
        cotizacionDolarService.refrescar();
    }

    // Refresco inicial al arrancar (hilo aparte para no demorar el arranque).
    @EventListener(ApplicationReadyEvent.class)
    public void refrescarAlIniciar() {
        if (!properties.isEnabled() || !properties.isConfigured()) return;
        Thread worker = new Thread(() -> {
            try {
                log.info("Refresco inicial de la cotizacion del Dolar BNA");
                cotizacionDolarService.refrescar();
            } catch (Exception e) {
                log.error("Error en el refresco inicial de la cotizacion del Dolar BNA: {}", e.getMessage());
            }
        }, "cotizacion-dolar-startup");
        worker.setDaemon(true);
        worker.start();
    }
}
