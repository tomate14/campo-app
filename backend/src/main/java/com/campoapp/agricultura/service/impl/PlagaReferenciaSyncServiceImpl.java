package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.plagas.PlagaReferenciaResponse;
import com.campoapp.agricultura.dto.plagas.SyncResumen;
import com.campoapp.agricultura.entity.plagas.PlagaReferencia;
import com.campoapp.agricultura.gbif.GbifProperties;
import com.campoapp.agricultura.gbif.PlagaReferenciaCatalogo;
import com.campoapp.agricultura.gbif.PlagaReferenciaCatalogo.TaxonSeed;
import com.campoapp.agricultura.gbif.dto.GbifMatchResponse;
import com.campoapp.agricultura.gbif.dto.GbifMedia;
import com.campoapp.agricultura.gbif.dto.GbifOccurrence;
import com.campoapp.agricultura.gbif.dto.GbifOccurrenceSearchResponse;
import com.campoapp.agricultura.repository.plagas.PlagaReferenciaRepository;
import com.campoapp.agricultura.service.PlagaReferenciaSyncService;
import com.campoapp.common.storage.FileStorageService;
import com.campoapp.utilidades.service.CatalogoUtilidadRegistry;
import com.campoapp.utilidades.service.UtilidadNombreResolver;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementacion del sync del catalogo de referencia de plagas desde GBIF (feature 73).
 * Idempotente por (cultivoId, nombreCientifico): si ya hay fila con imagen se omite;
 * si existe sin imagen se reintenta la descarga. Cada taxon va en su propio try/catch
 * para que un fallo puntual nunca rompa el scheduler.
 */
@Service
@Slf4j
public class PlagaReferenciaSyncServiceImpl implements PlagaReferenciaSyncService {

    private static final String FUENTE = "GBIF";
    private static final String SUBFOLDER = "plagas-referencia";
    private static final String CC_MARKER = "creativecommons.org";

    private final JdbcTemplate jdbcTemplate;
    private final RestClient gbifRestClient;
    private final GbifProperties gbifProperties;
    private final FileStorageService fileStorageService;
    private final PlagaReferenciaRepository repository;
    private final UtilidadNombreResolver utilidadNombreResolver;

    // Cliente sin baseUrl para descargar la imagen de un host externo (ej: iNaturalist S3).
    private final RestClient downloadClient = RestClient.create();

    public PlagaReferenciaSyncServiceImpl(JdbcTemplate jdbcTemplate,
                                          @Qualifier("gbifRestClient") RestClient gbifRestClient,
                                          GbifProperties gbifProperties,
                                          FileStorageService fileStorageService,
                                          PlagaReferenciaRepository repository,
                                          UtilidadNombreResolver utilidadNombreResolver) {
        this.jdbcTemplate = jdbcTemplate;
        this.gbifRestClient = gbifRestClient;
        this.gbifProperties = gbifProperties;
        this.fileStorageService = fileStorageService;
        this.repository = repository;
        this.utilidadNombreResolver = utilidadNombreResolver;
    }

    @Override
    public SyncResumen sincronizar() {
        List<Map<String, Object>> cultivos = jdbcTemplate.queryForList(
                "SELECT id, valor FROM utilidad_cultivo WHERE activo = 1 AND deleted_at IS NULL");

        int procesados = 0;
        int descargados = 0;
        int omitidos = 0;
        int fallidos = 0;

        for (Map<String, Object> cultivo : cultivos) {
            String cultivoId = (String) cultivo.get("id");
            String valor = (String) cultivo.get("valor");
            List<TaxonSeed> taxones = PlagaReferenciaCatalogo.taxonesDe(valor);

            for (TaxonSeed taxon : taxones) {
                procesados++;
                try {
                    ResultadoTaxon resultado = procesarTaxon(cultivoId, taxon);
                    switch (resultado) {
                        case DESCARGADO -> descargados++;
                        case OMITIDO -> omitidos++;
                        default -> { /* SIN_IMAGEN: se persistio la fila sin imagen, no cuenta como fallo */ }
                    }
                } catch (Exception e) {
                    fallidos++;
                    log.warn("Fallo sincronizando taxon {} ({}) del cultivo {}: {}",
                            taxon.nombreCientifico(), taxon.nombreComun(), cultivoId, e.getMessage());
                }
            }
        }

        SyncResumen resumen = new SyncResumen(cultivos.size(), procesados, descargados, omitidos, fallidos);
        log.info("Sync catalogo referencia plagas: {}", resumen);
        return resumen;
    }

    private enum ResultadoTaxon { DESCARGADO, OMITIDO, SIN_IMAGEN }

    private ResultadoTaxon procesarTaxon(String cultivoId, TaxonSeed taxon) {
        Optional<PlagaReferencia> existenteOpt = repository
                .findByCultivoIdAndNombreCientificoAndDeletedAtIsNull(cultivoId, taxon.nombreCientifico());

        // Idempotencia: si ya existe con imagen, no se vuelve a bajar nada.
        if (existenteOpt.isPresent() && StringUtils.hasText(existenteOpt.get().getPath())) {
            return ResultadoTaxon.OMITIDO;
        }

        PlagaReferencia fila = existenteOpt.orElseGet(() -> PlagaReferencia.builder()
                .cultivoId(cultivoId)
                .nombreComun(taxon.nombreComun())
                .nombreCientifico(taxon.nombreCientifico())
                .tipo(taxon.tipo())
                .fuente(FUENTE)
                .activo(true)
                .build());
        // Mantener datos curados actualizados en reintentos.
        fila.setNombreComun(taxon.nombreComun());
        fila.setTipo(taxon.tipo());
        fila.setFuente(FUENTE);

        // 1) species/match -> usageKey
        GbifMatchResponse match = matchSpecies(taxon.nombreCientifico());
        if (match == null || match.usageKey() == null) {
            repository.save(fila); // fila sin imagen (no hubo match)
            return ResultadoTaxon.SIN_IMAGEN;
        }
        fila.setGbifUsageKey(match.usageKey());

        // 2) occurrence/search -> primera media con licencia CC
        GbifMedia media = primeraMediaCreativeCommons(match.usageKey());
        if (media == null || !StringUtils.hasText(media.identifier())) {
            repository.save(fila); // fila sin imagen (no hubo media CC)
            return ResultadoTaxon.SIN_IMAGEN;
        }

        // 3) descargar bytes y guardar en el volumen
        ResponseEntity<byte[]> respuesta = downloadClient.get()
                .uri(media.identifier())
                .retrieve()
                .toEntity(byte[].class);
        byte[] bytes = respuesta.getBody();
        if (bytes == null || bytes.length == 0) {
            repository.save(fila);
            return ResultadoTaxon.SIN_IMAGEN;
        }
        String contentType = respuesta.getHeaders().getFirst("Content-Type");
        String path = fileStorageService.storeBytes(bytes, contentType, SUBFOLDER);

        fila.setPath(path);
        fila.setUrlOriginal(media.identifier());
        fila.setLicencia(media.license());
        fila.setAtribucion(media.rightsHolder());
        repository.save(fila);
        return ResultadoTaxon.DESCARGADO;
    }

    private GbifMatchResponse matchSpecies(String nombreCientifico) {
        return gbifRestClient.get()
                .uri(uriBuilder -> uriBuilder.path("/species/match").queryParam("name", nombreCientifico).build())
                .retrieve()
                .body(GbifMatchResponse.class);
    }

    private GbifMedia primeraMediaCreativeCommons(Long usageKey) {
        GbifOccurrenceSearchResponse busqueda = gbifRestClient.get()
                .uri(uriBuilder -> uriBuilder.path("/occurrence/search")
                        .queryParam("taxonKey", usageKey)
                        .queryParam("mediaType", "StillImage")
                        .queryParam("limit", gbifProperties.getMediaLimit())
                        .build())
                .retrieve()
                .body(GbifOccurrenceSearchResponse.class);
        if (busqueda == null || busqueda.results() == null) {
            return null;
        }
        for (GbifOccurrence occurrence : busqueda.results()) {
            if (occurrence == null || occurrence.media() == null) {
                continue;
            }
            for (GbifMedia media : occurrence.media()) {
                if (media != null && esCreativeCommons(media.license())) {
                    return media;
                }
            }
        }
        return null;
    }

    private boolean esCreativeCommons(String license) {
        return license != null && license.toLowerCase(java.util.Locale.ROOT).contains(CC_MARKER);
    }

    @Override
    public List<PlagaReferenciaResponse> listar(String cultivoId) {
        List<PlagaReferencia> filas = StringUtils.hasText(cultivoId)
                ? repository.findByCultivoIdAndDeletedAtIsNull(cultivoId)
                : repository.findByDeletedAtIsNullOrderByCultivoIdAscNombreComunAsc();

        // Resolucion batch de nombres (sin N+1).
        Map<String, String> cultivoNombres = utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.CULTIVO,
                filas.stream().map(PlagaReferencia::getCultivoId).collect(Collectors.toList()));
        Map<String, String> tipoNombres = utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.TIPO_PLAGA,
                filas.stream().map(PlagaReferencia::getTipo).collect(Collectors.toList()));

        List<PlagaReferenciaResponse> respuesta = new ArrayList<>(filas.size());
        for (PlagaReferencia fila : filas) {
            respuesta.add(new PlagaReferenciaResponse(
                    fila.getId(),
                    fila.getCultivoId(),
                    utilidadNombreResolver.resolver(fila.getCultivoId(), cultivoNombres),
                    fila.getNombreComun(),
                    fila.getNombreCientifico(),
                    fila.getTipo(),
                    utilidadNombreResolver.resolver(fila.getTipo(), tipoNombres),
                    StringUtils.hasText(fila.getPath()) ? "/uploads/" + fila.getPath() : null,
                    fila.getFuente(),
                    fila.getUrlOriginal(),
                    fila.getLicencia(),
                    fila.getAtribucion()));
        }
        return respuesta;
    }
}
