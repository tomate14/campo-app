package com.campoapp.agricultura.ndvi;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.LoteRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

// Feature 59 (fase 1): genera el "mapa de verdes" (NDVI) por lote con Sentinel-2 (CDSE)
// y guarda UNA imagen por lote (se pisa la anterior) en el volumen NDVI_DIR.
@Slf4j
@Service
@RequiredArgsConstructor
public class NdviService {

    private final LoteRepository loteRepository;
    private final NdviProperties properties;
    private final SentinelAuthClient authClient;
    private final ObjectMapper objectMapper;
    @Qualifier("ndviRestClient")
    private final RestClient restClient;

    // Evalscript: NDVI con rampa de verdes y enmascarado de nubes por SCL.
    // Devuelve RGBA (4 bandas); transparente fuera de datos validos o con nube/sombra.
    private static final String EVALSCRIPT = """
            //VERSION=3
            function setup() {
              return { input: [{ bands: ["B04", "B08", "SCL", "dataMask"] }], output: { bands: 4 } };
            }
            function evaluatePixel(s) {
              var nube = (s.SCL === 3 || s.SCL === 8 || s.SCL === 9 || s.SCL === 10 || s.SCL === 11);
              if (nube || s.dataMask === 0) return [0, 0, 0, 0];
              var ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
              if (ndvi < 0.2) return [0.85, 0.85, 0.85, 1];
              else if (ndvi < 0.4) return [0.90, 0.85, 0.40, 1];
              else if (ndvi < 0.6) return [0.50, 0.80, 0.30, 1];
              else if (ndvi < 0.8) return [0.20, 0.60, 0.20, 1];
              else return [0.0, 0.4, 0.0, 1];
            }
            """;

    // Genera/actualiza el NDVI de todos los lotes con poligono. Cada imagen pisa la anterior.
    public void generarTodos() {
        if (!properties.isEnabled() || !properties.isConfigured()) {
            log.info("NDVI deshabilitado o sin credenciales CDSE: se omite la generacion");
            return;
        }
        var lotes = loteRepository.findAllActive();
        int ok = 0;
        int fallidos = 0;
        int sinPoligono = 0;
        for (Lote lote : lotes) {
            if (lote.getPoligono() == null || lote.getPoligono().isBlank()) {
                sinPoligono++;
                continue;
            }
            try {
                generarLote(lote);
                ok++;
            } catch (Exception e) {
                fallidos++;
                log.warn("NDVI fallo para el lote {} ({}): {}", lote.getId(), lote.getNombre(), e.getMessage());
            }
        }
        log.info("NDVI: {} generados, {} fallidos, {} sin poligono (de {} lotes)", ok, fallidos, sinPoligono, lotes.size());
    }

    // Genera el NDVI de un lote y guarda el PNG en {dir}/{loteId}.png (pisando el anterior).
    public void generarLote(Lote lote) throws IOException {
        JsonNode geometria = objectMapper.readTree(lote.getPoligono());
        if (!"Polygon".equalsIgnoreCase(geometria.path("type").asText())) {
            throw new IllegalArgumentException("El poligono del lote no es un GeoJSON Polygon");
        }

        String requestBody = objectMapper.writeValueAsString(buildRequest(geometria));
        String token = authClient.obtenerToken();

        byte[] png = restClient.post()
                .uri(properties.getProcessUrl())
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.IMAGE_PNG)
                .body(requestBody)
                .retrieve()
                .body(byte[].class);

        if (png == null || png.length == 0) {
            throw new IllegalStateException("CDSE devolvio una imagen vacia");
        }

        Path target = Paths.get(properties.getDir()).toAbsolutePath().resolve(lote.getId() + ".png").normalize();
        Files.createDirectories(target.getParent());
        Files.write(target, png, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        log.debug("NDVI guardado para lote {} en {}", lote.getId(), target);
    }

    // Arma el cuerpo del Process API: geometria del lote (recorta al poligono), Sentinel-2 L2A
    // con ventana de dias y filtro de nubes, salida PNG y el evalscript NDVI.
    private ObjectNode buildRequest(JsonNode geometria) {
        String hasta = Instant.now().truncatedTo(ChronoUnit.SECONDS).toString();
        String desde = Instant.now().minus(properties.getVentanaDias(), ChronoUnit.DAYS).truncatedTo(ChronoUnit.SECONDS).toString();

        ObjectNode root = objectMapper.createObjectNode();

        ObjectNode input = root.putObject("input");
        ObjectNode bounds = input.putObject("bounds");
        bounds.set("geometry", geometria);
        bounds.putObject("properties").put("crs", "http://www.opengis.net/def/crs/EPSG/0/4326");

        ArrayNode data = input.putArray("data");
        ObjectNode dato = data.addObject();
        dato.put("type", "sentinel-2-l2a");
        ObjectNode dataFilter = dato.putObject("dataFilter");
        ObjectNode timeRange = dataFilter.putObject("timeRange");
        timeRange.put("from", desde);
        timeRange.put("to", hasta);
        dataFilter.put("maxCloudCoverage", properties.getMaxNubosidad());
        dataFilter.put("mosaickingOrder", "leastCC");

        ObjectNode output = root.putObject("output");
        output.put("width", properties.getImgSize());
        output.put("height", properties.getImgSize());
        ArrayNode responses = output.putArray("responses");
        ObjectNode respuesta = responses.addObject();
        respuesta.put("identifier", "default");
        respuesta.putObject("format").put("type", "image/png");

        root.put("evalscript", EVALSCRIPT);
        return root;
    }
}
