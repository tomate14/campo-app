package com.campoapp.agricultura.scheduler;

import com.campoapp.agricultura.dto.plagas.SimilarSyncResumen;
import com.campoapp.agricultura.dto.plagas.SyncResumen;
import com.campoapp.agricultura.gbif.GbifProperties;
import com.campoapp.agricultura.service.PlagaReferenciaSyncService;
import com.campoapp.agricultura.service.PlagaSimilarSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler diario (03:00 por defecto) de las sincronizaciones GBIF de plagas (features 73 y 75):
 * catalogo de referencia por cultivo y cache de especies similares por genero/familia.
 * No hace nada si gbif.sync.enabled esta deshabilitado. Nunca propaga excepciones.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PlagaReferenciaScheduler {

    private final PlagaReferenciaSyncService syncService;
    private final PlagaSimilarSyncService similarSyncService;
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

        // Feature 75: en la misma corrida, refresca la taxonomia y el cache de especies similares.
        try {
            log.info("Iniciando sincronizacion automatica de especies similares (GBIF)");
            SimilarSyncResumen resumen = similarSyncService.sincronizarSimilares();
            log.info("Sincronizacion de especies similares finalizada: {}", resumen);
        } catch (Exception e) {
            log.error("Error en la sincronizacion automatica de especies similares: {}", e.getMessage());
        }
    }
}
