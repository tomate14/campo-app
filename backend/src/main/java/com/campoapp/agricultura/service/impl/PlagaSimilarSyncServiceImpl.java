package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.plagas.EspecieSimilarResponse;
import com.campoapp.agricultura.dto.plagas.SimilarSyncResumen;
import com.campoapp.agricultura.entity.plagas.CatalogoPlaga;
import com.campoapp.agricultura.entity.plagas.GbifEspecie;
import com.campoapp.agricultura.gbif.GbifProperties;
import com.campoapp.agricultura.gbif.dto.GbifChildrenResponse;
import com.campoapp.agricultura.gbif.dto.GbifMatchResponse;
import com.campoapp.agricultura.gbif.dto.GbifMedia;
import com.campoapp.agricultura.gbif.dto.GbifOccurrence;
import com.campoapp.agricultura.gbif.dto.GbifOccurrenceSearchResponse;
import com.campoapp.agricultura.gbif.dto.GbifSpecies;
import com.campoapp.agricultura.gbif.dto.GbifVernacularName;
import com.campoapp.agricultura.gbif.dto.GbifVernacularResponse;
import com.campoapp.agricultura.repository.plagas.CatalogoPlagaRepository;
import com.campoapp.agricultura.repository.plagas.GbifEspecieRepository;
import com.campoapp.agricultura.service.PlagaSimilarSyncService;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.common.storage.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

/**
 * Implementacion del descubrimiento y cache de especies similares desde GBIF (feature 75).
 *
 * Reutiliza la infra GBIF de la feature 73 (RestClient con baseUrl, GbifProperties, FileStorageService).
 * El sync recorre las plagas del catalogo con nombre cientifico, resuelve su taxonomia (species/match),
 * descubre hermanas por GENERO (children del genusKey) y FAMILIA (species/search por familyKey) segun
 * los topes, y hace upsert de cada candidata en gbif_especie (dedupe por usage_key) descargando su imagen
 * Creative Commons al volumen de uploads. La ficha consulta las similares desde ese cache; el alta de
 * plaga usa el descubrimiento en vivo (sin descargar, con miniaturas remotas).
 */
@Service
@Slf4j
public class PlagaSimilarSyncServiceImpl implements PlagaSimilarSyncService {

    private static final String SUBFOLDER = "plagas-similares";
    private static final String CC_MARKER = "creativecommons.org";
    private static final String NIVEL_GENERO = "GENERO";
    private static final String NIVEL_FAMILIA = "FAMILIA";

    private final RestClient gbifRestClient;
    private final GbifProperties gbifProperties;
    private final FileStorageService fileStorageService;
    private final CatalogoPlagaRepository catalogoRepository;
    private final GbifEspecieRepository gbifEspecieRepository;

    // Cliente sin baseUrl para descargar la imagen de un host externo (ej: iNaturalist S3).
    private final RestClient downloadClient = RestClient.create();

    public PlagaSimilarSyncServiceImpl(@Qualifier("gbifRestClient") RestClient gbifRestClient,
                                       GbifProperties gbifProperties,
                                       FileStorageService fileStorageService,
                                       CatalogoPlagaRepository catalogoRepository,
                                       GbifEspecieRepository gbifEspecieRepository) {
        this.gbifRestClient = gbifRestClient;
        this.gbifProperties = gbifProperties;
        this.fileStorageService = fileStorageService;
        this.catalogoRepository = catalogoRepository;
        this.gbifEspecieRepository = gbifEspecieRepository;
    }

    // Candidata a similar descubierta con su nivel de proximidad taxonomica.
    private record Candidata(GbifSpecies species, String nivel) {}

    @Override
    public SimilarSyncResumen sincronizarSimilares() {
        List<CatalogoPlaga> plagas = catalogoRepository.findConNombreCientifico();

        int procesadas = 0;
        int fallidos = 0;
        int imagenes = 0;
        // Especies distintas (por usageKey) upsertadas durante toda la corrida.
        Set<Long> descubiertas = new HashSet<>();

        for (CatalogoPlaga plaga : plagas) {
            procesadas++;
            try {
                imagenes += procesarPlaga(plaga, descubiertas);
            } catch (Exception e) {
                fallidos++;
                log.warn("Fallo sincronizando similares de la plaga {} ({}): {}",
                        plaga.getNombreCientifico(), plaga.getNombreComun(), e.getMessage());
            }
        }

        SimilarSyncResumen resumen = new SimilarSyncResumen(procesadas, descubiertas.size(), imagenes, fallidos);
        log.info("Sync especies similares GBIF: {}", resumen);
        return resumen;
    }

    // Resuelve la taxonomia de la plaga, descubre candidatas y las upsertea. Devuelve imagenes descargadas.
    private int procesarPlaga(CatalogoPlaga plaga, Set<Long> descubiertas) {
        GbifMatchResponse match = matchSpecies(plaga.getNombreCientifico());
        if (match == null || match.usageKey() == null) {
            return 0;
        }

        // Actualiza la clasificacion taxonomica de la plaga en el catalogo.
        plaga.setGbifUsageKey(match.usageKey());
        plaga.setGbifGenusKey(match.genusKey());
        plaga.setGbifFamilyKey(match.familyKey());
        plaga.setGbifGenero(match.genus());
        plaga.setGbifFamilia(match.family());
        plaga.setNombreCientificoAceptado(match.scientificName());
        catalogoRepository.save(plaga);

        int imagenes = 0;
        for (Candidata candidata : descubrirCandidatas(match)) {
            try {
                boolean descargo = upsertCandidata(candidata);
                descubiertas.add(candidata.species().key());
                if (descargo) {
                    imagenes++;
                }
            } catch (Exception e) {
                log.warn("Fallo procesando especie similar {} de la plaga {}: {}",
                        candidata.species().key(), plaga.getNombreCientifico(), e.getMessage());
            }
        }
        return imagenes;
    }

    // Descubre candidatas hasta maxNiveles: nivel 1 GENERO (children del genusKey), nivel 2 FAMILIA
    // (species/search por familyKey, descartando las del mismo genero, que ya son de nivel GENERO).
    private List<Candidata> descubrirCandidatas(GbifMatchResponse match) {
        int maxPorNivel = gbifProperties.getSimilar().getMaxPorNivel();
        int maxNiveles = gbifProperties.getSimilar().getMaxNiveles();
        Long ownKey = match.usageKey();

        List<Candidata> out = new ArrayList<>();
        Set<Long> vistos = new HashSet<>();

        // Nivel 1: GENERO.
        if (match.genusKey() != null) {
            GbifChildrenResponse children = childrenOfGenus(match.genusKey(), maxPorNivel);
            int count = 0;
            for (GbifSpecies s : resultados(children)) {
                if (!candidataValida(s, ownKey, vistos)) {
                    continue;
                }
                out.add(new Candidata(s, NIVEL_GENERO));
                if (++count >= maxPorNivel) {
                    break;
                }
            }
        }

        // Nivel 2: FAMILIA (solo si maxNiveles >= 2).
        if (maxNiveles >= 2 && match.familyKey() != null) {
            GbifChildrenResponse familia = speciesOfFamily(match.familyKey(), maxPorNivel);
            int count = 0;
            for (GbifSpecies s : resultados(familia)) {
                // Las del mismo genero ya se cubren en el nivel GENERO.
                if (match.genusKey() != null && match.genusKey().equals(s.genusKey())) {
                    continue;
                }
                if (!candidataValida(s, ownKey, vistos)) {
                    continue;
                }
                out.add(new Candidata(s, NIVEL_FAMILIA));
                if (++count >= maxPorNivel) {
                    break;
                }
            }
        }
        return out;
    }

    // Valida que la especie tenga key y nombre, no sea la propia y no este repetida.
    private boolean candidataValida(GbifSpecies s, Long ownKey, Set<Long> vistos) {
        if (s == null || s.key() == null || s.key().equals(ownKey)) {
            return false;
        }
        if (!StringUtils.hasText(s.scientificName()) && !StringUtils.hasText(s.canonicalName())) {
            return false;
        }
        return vistos.add(s.key());
    }

    // Upsert de una candidata en gbif_especie (dedupe por usage_key). Devuelve true si descargo imagen.
    private boolean upsertCandidata(Candidata candidata) {
        GbifSpecies s = candidata.species();
        GbifEspecie especie = gbifEspecieRepository.findByUsageKeyAndDeletedAtIsNull(s.key())
                .orElseGet(() -> GbifEspecie.builder().usageKey(s.key()).activo(true).build());

        // Taxonomia (siempre se refresca).
        especie.setNombreCientifico(StringUtils.hasText(s.scientificName()) ? s.scientificName() : s.canonicalName());
        especie.setGenusKey(s.genusKey());
        especie.setFamilyKey(s.familyKey());
        especie.setGenero(s.genus());
        especie.setFamilia(s.family());
        especie.setRank(s.rank());

        // Nombre vulgar: solo si aun no lo tiene (evita llamadas repetidas a vernacularNames).
        if (!StringUtils.hasText(especie.getNombreVulgar())) {
            String vulgar = nombreVulgar(s.key());
            if (StringUtils.hasText(vulgar)) {
                especie.setNombreVulgar(vulgar);
            }
        }

        // Imagen: dedupe por usage_key; si ya tiene path no se re-descarga.
        boolean descargo = false;
        if (!StringUtils.hasText(especie.getPath())) {
            GbifMedia media = primeraMediaCreativeCommons(s.key());
            if (media != null && StringUtils.hasText(media.identifier())) {
                ResponseEntity<byte[]> respuesta = downloadClient.get()
                        .uri(media.identifier())
                        .retrieve()
                        .toEntity(byte[].class);
                byte[] bytes = respuesta.getBody();
                if (bytes != null && bytes.length > 0) {
                    String contentType = respuesta.getHeaders().getFirst("Content-Type");
                    String path = fileStorageService.storeBytes(bytes, contentType, SUBFOLDER);
                    especie.setPath(path);
                    especie.setUrlOriginal(media.identifier());
                    especie.setLicencia(media.license());
                    especie.setAtribucion(media.rightsHolder());
                    descargo = true;
                }
            }
        }

        gbifEspecieRepository.save(especie);
        return descargo;
    }

    @Override
    public List<EspecieSimilarResponse> similaresDeCatalogo(String catalogoPlagaId) {
        CatalogoPlaga plaga = catalogoRepository.findActiveById(catalogoPlagaId)
                .orElseThrow(() -> new ResourceNotFoundException("Plaga no encontrada con id: " + catalogoPlagaId));

        int maxPorNivel = gbifProperties.getSimilar().getMaxPorNivel();
        int maxNiveles = gbifProperties.getSimilar().getMaxNiveles();
        Long ownKey = plaga.getGbifUsageKey();

        List<EspecieSimilarResponse> out = new ArrayList<>();
        Set<Long> incluidos = new HashSet<>();

        // Nivel GENERO.
        if (plaga.getGbifGenusKey() != null) {
            List<GbifEspecie> genero = gbifEspecieRepository
                    .findByGenusKeyAndDeletedAtIsNullOrderByNombreCientificoAsc(plaga.getGbifGenusKey());
            int count = 0;
            for (GbifEspecie e : genero) {
                if (ownKey != null && ownKey.equals(e.getUsageKey())) {
                    continue;
                }
                if (!incluidos.add(e.getUsageKey())) {
                    continue;
                }
                out.add(toSimilarLocal(e, NIVEL_GENERO));
                if (++count >= maxPorNivel) {
                    break;
                }
            }
        }

        // Nivel FAMILIA (distinto genero al de la plaga).
        if (maxNiveles >= 2 && plaga.getGbifFamilyKey() != null) {
            List<GbifEspecie> familia = gbifEspecieRepository
                    .findByFamilyKeyAndDeletedAtIsNullOrderByNombreCientificoAsc(plaga.getGbifFamilyKey());
            int count = 0;
            for (GbifEspecie e : familia) {
                if (ownKey != null && ownKey.equals(e.getUsageKey())) {
                    continue;
                }
                if (plaga.getGbifGenusKey() != null && plaga.getGbifGenusKey().equals(e.getGenusKey())) {
                    continue;
                }
                if (!incluidos.add(e.getUsageKey())) {
                    continue;
                }
                out.add(toSimilarLocal(e, NIVEL_FAMILIA));
                if (++count >= maxPorNivel) {
                    break;
                }
            }
        }
        return out;
    }

    // Especie del cache -> respuesta con imagen LOCAL (/uploads/...).
    private EspecieSimilarResponse toSimilarLocal(GbifEspecie e, String nivel) {
        String imagenUrl = StringUtils.hasText(e.getPath()) ? "/uploads/" + e.getPath() : null;
        return new EspecieSimilarResponse(e.getUsageKey(), e.getNombreCientifico(), e.getNombreVulgar(),
                nivel, imagenUrl, e.getLicencia(), e.getAtribucion());
    }

    @Override
    public List<EspecieSimilarResponse> descubrirEnVivo(String nombreCientifico) {
        if (!StringUtils.hasText(nombreCientifico)) {
            return List.of();
        }
        GbifMatchResponse match = matchSpecies(nombreCientifico);
        if (match == null || match.usageKey() == null) {
            return List.of();
        }

        List<EspecieSimilarResponse> out = new ArrayList<>();
        for (Candidata candidata : descubrirCandidatas(match)) {
            try {
                out.add(resolverEnVivo(candidata));
            } catch (Exception e) {
                log.warn("Fallo resolviendo en vivo la especie similar {}: {}",
                        candidata.species().key(), e.getMessage());
            }
        }
        return out;
    }

    // Resuelve una candidata para el descubrimiento en vivo: imagen local si esta cacheada, si no
    // la URL remota de GBIF (sin descargar). Nombre vulgar del cache si existe (best-effort).
    private EspecieSimilarResponse resolverEnVivo(Candidata candidata) {
        GbifSpecies s = candidata.species();
        String nombreCientifico = StringUtils.hasText(s.scientificName()) ? s.scientificName() : s.canonicalName();

        Optional<GbifEspecie> cacheOpt = gbifEspecieRepository.findByUsageKeyAndDeletedAtIsNull(s.key());
        String nombreVulgar = cacheOpt.map(GbifEspecie::getNombreVulgar).orElse(null);

        // Si el cache ya tiene la imagen descargada, se sirve local.
        if (cacheOpt.isPresent() && StringUtils.hasText(cacheOpt.get().getPath())) {
            GbifEspecie e = cacheOpt.get();
            return new EspecieSimilarResponse(s.key(), nombreCientifico, nombreVulgar, candidata.nivel(),
                    "/uploads/" + e.getPath(), e.getLicencia(), e.getAtribucion());
        }

        // Sin cache: miniatura remota resuelta en vivo (identifier absoluto, sin descargar).
        GbifMedia media = primeraMediaCreativeCommons(s.key());
        String imagenUrl = media != null ? media.identifier() : null;
        String licencia = media != null ? media.license() : null;
        String atribucion = media != null ? media.rightsHolder() : null;
        return new EspecieSimilarResponse(s.key(), nombreCientifico, nombreVulgar, candidata.nivel(),
                imagenUrl, licencia, atribucion);
    }

    // -------------------- Llamadas GBIF --------------------

    private GbifMatchResponse matchSpecies(String nombreCientifico) {
        return gbifRestClient.get()
                .uri(uriBuilder -> uriBuilder.path("/species/match").queryParam("name", nombreCientifico).build())
                .retrieve()
                .body(GbifMatchResponse.class);
    }

    private GbifChildrenResponse childrenOfGenus(Long genusKey, int limit) {
        return gbifRestClient.get()
                .uri(uriBuilder -> uriBuilder.path("/species/{genusKey}/children")
                        .queryParam("rank", "SPECIES")
                        .queryParam("limit", limit)
                        .build(genusKey))
                .retrieve()
                .body(GbifChildrenResponse.class);
    }

    private GbifChildrenResponse speciesOfFamily(Long familyKey, int limit) {
        return gbifRestClient.get()
                .uri(uriBuilder -> uriBuilder.path("/species/search")
                        .queryParam("highertaxonKey", familyKey)
                        .queryParam("rank", "SPECIES")
                        .queryParam("limit", limit)
                        .build())
                .retrieve()
                .body(GbifChildrenResponse.class);
    }

    // Nombre vulgar preferido en espanol (spa/es); si no hay, el primero disponible.
    private String nombreVulgar(Long key) {
        GbifVernacularResponse respuesta = gbifRestClient.get()
                .uri(uriBuilder -> uriBuilder.path("/species/{key}/vernacularNames").build(key))
                .retrieve()
                .body(GbifVernacularResponse.class);
        if (respuesta == null || respuesta.results() == null || respuesta.results().isEmpty()) {
            return null;
        }
        String primero = null;
        for (GbifVernacularName vn : respuesta.results()) {
            if (vn == null || !StringUtils.hasText(vn.vernacularName())) {
                continue;
            }
            if (primero == null) {
                primero = vn.vernacularName();
            }
            String lang = vn.language() == null ? "" : vn.language().toLowerCase(Locale.ROOT);
            if (lang.equals("spa") || lang.equals("es")) {
                return vn.vernacularName();
            }
        }
        return primero;
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
        return license != null && license.toLowerCase(Locale.ROOT).contains(CC_MARKER);
    }

    private List<GbifSpecies> resultados(GbifChildrenResponse response) {
        return response == null || response.results() == null ? List.of() : response.results();
    }
}
