package com.campoapp.clima.scheduler;

import com.campoapp.clima.config.ClimaProperties;
import com.campoapp.clima.service.ClimaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
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
}
