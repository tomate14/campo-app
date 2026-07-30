package com.campoapp.clima.scheduler;

import com.campoapp.clima.config.ClimaProperties;
import com.campoapp.clima.service.ClimaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(prefix = "app.scheduling", name = "enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class ClimaScheduler {

    private final ClimaService climaService;
    private final ClimaProperties properties;

    @Scheduled(fixedRateString = "${clima.sync.intervalo-ms:1800000}")
    public void sincronizarClima() {
        if (!properties.getSync().isEnabled()) return;
        log.info("Iniciando sincronizacion automatica de datos climaticos");
        climaService.sincronizarTodosLotes();
    }

    @Scheduled(cron = "${clima.sync.precipitacion-historica-cron:0 0 2 * * *}",
            zone = "${clima.sync.zone:America/Argentina/Buenos_Aires}")
    public void sincronizarPrecipitacionHistorica() {
        if (!properties.getSync().isEnabled() || !properties.getSync().isPrecipitacionHistoricaEnabled()) return;
        int dias = Math.max(1, properties.getSync().getPrecipitacionHistoricaDias());
        log.info("Iniciando sincronizacion historica de precipitaciones para los ultimos {} dias", dias);
        climaService.sincronizarPrecipitacionesHistoricas(dias);
    }

    // Poblar precipitaciones al arrancar: sin esto la tabla queda vacia (y el KPI
    // del dashboard sin datos) hasta que corre el cron de las 2 AM, lo que afecta
    // a entornos nuevos o recien reiniciados. Se ejecuta en un hilo aparte para
    // no demorar el arranque de la aplicacion.
    @EventListener(ApplicationReadyEvent.class)
    public void sincronizarPrecipitacionAlIniciar() {
        if (!properties.getSync().isEnabled() || !properties.getSync().isPrecipitacionHistoricaEnabled()) return;
        int dias = Math.max(1, properties.getSync().getPrecipitacionHistoricaDias());
        Thread worker = new Thread(() -> {
            try {
                log.info("Sincronizacion inicial de precipitaciones para los ultimos {} dias", dias);
                climaService.sincronizarPrecipitacionesHistoricas(dias);
            } catch (Exception e) {
                log.error("Error en la sincronizacion inicial de precipitaciones: {}", e.getMessage());
            }
        }, "clima-precipitacion-startup");
        worker.setDaemon(true);
        worker.start();
    }
}
