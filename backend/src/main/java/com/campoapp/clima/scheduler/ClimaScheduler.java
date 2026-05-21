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
        log.info("Iniciando sincronización automática de datos climáticos");
        climaService.sincronizarTodosLotes();
    }
}
