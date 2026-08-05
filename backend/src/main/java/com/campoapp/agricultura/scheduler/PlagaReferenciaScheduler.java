package com.campoapp.agricultura.scheduler;

import com.campoapp.agricultura.dto.plagas.SyncResumen;
import com.campoapp.agricultura.gbif.GbifProperties;
import com.campoapp.agricultura.service.PlagaReferenciaSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler diario (03:00 por defecto) del catalogo de referencia de plagas GBIF (feature 73).
 * No hace nada si gbif.sync.enabled esta deshabilitado. Nunca propaga excepciones.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PlagaReferenciaScheduler {

    private final PlagaReferenciaSyncService syncService;
    private final GbifProperties properties;

    @Scheduled(cron = "${gbif.sync.cron:0 0 3 * * *}")
    public void sincronizarCatalogoReferencia() {
        if (!properties.getSync().isEnabled()) {
            return;
        }
        try {
            log.info("Iniciando sincronizacion automatica del catalogo de referencia de plagas (GBIF)");
            SyncResumen resumen = syncService.sincronizar();
            log.info("Sincronizacion del catalogo de referencia de plagas finalizada: {}", resumen);
        } catch (Exception e) {
            log.error("Error en la sincronizacion automatica del catalogo de referencia de plagas: {}", e.getMessage());
        }
    }
}
