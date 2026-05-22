package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.LoteRequest;
import com.campoapp.agricultura.dto.LoteReporteResponse;
import com.campoapp.agricultura.dto.LoteResponse;
import com.campoapp.agricultura.entity.HistoricoCultivo;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.EventoSiembraRepository;
import com.campoapp.agricultura.repository.HistoricoCultivoRepository;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.PropiedadSueloRepository;
import com.campoapp.agricultura.repository.RegistroCosechaRepository;
import com.campoapp.agricultura.service.LoteService;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LoteServiceImpl implements LoteService {

    private final LoteRepository loteRepository;
    private final EventoSiembraRepository eventoSiembraRepository;
    private final RegistroCosechaRepository registroCosechaRepository;
    private final PropiedadSueloRepository propiedadSueloRepository;
    private final HistoricoCultivoRepository historicoCultivoRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<LoteResponse> listarTodos() {
        return loteRepository.findAllActive().stream().map(this::toResponse).toList();
    }

    @Override
    public List<LoteResponse> listarPorTemporada(String temporada) {
        return loteRepository.findByTemporada(temporada).stream().map(this::toResponse).toList();
    }

    @Override
    public List<LoteResponse> listarPorCultivo(String cultivo) {
        return loteRepository.findByCultivo(cultivo).stream().map(this::toResponse).toList();
    }

    @Override
    public List<LoteResponse> buscarConFiltros(
            String temporada,
            String cultivo,
            BigDecimal areaMin,
            BigDecimal areaMax,
            BigDecimal phMin,
            BigDecimal phMax,
            Boolean tienePoligono
    ) {
        return loteRepository.search(temporada, cultivo, areaMin, areaMax, phMin, phMax, tienePoligono)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public LoteResponse buscarPorId(String id) {
        return toResponse(findActiveOrThrow(id));
    }

    @Override
    @Transactional
    public LoteResponse crear(LoteRequest request) {
        validatePolygon(request.poligono());
        Lote lote = Lote.builder()
                .nombre(request.nombre())
                .area(request.area())
                .cultivo(request.cultivo())
                .latitud(request.latitud())
                .longitud(request.longitud())
                .temporada(request.temporada())
                .poligono(request.poligono())
                .phMinimo(request.phMinimo())
                .phMaximo(request.phMaximo())
                .fechaSiembra(request.fechaSiembra())
                .fechaCosechaEstimada(request.fechaCosechaEstimada())
                .build();
        return toResponse(loteRepository.save(lote));
    }

    @Override
    @Transactional
    public LoteResponse actualizar(String id, LoteRequest request) {
        validatePolygon(request.poligono());
        Lote lote = findActiveOrThrow(id);
        lote.setNombre(request.nombre());
        lote.setArea(request.area());
        lote.setCultivo(request.cultivo());
        lote.setLatitud(request.latitud());
        lote.setLongitud(request.longitud());
        lote.setTemporada(request.temporada());
        lote.setPoligono(request.poligono());
        lote.setPhMinimo(request.phMinimo());
        lote.setPhMaximo(request.phMaximo());
        lote.setFechaSiembra(request.fechaSiembra());
        lote.setFechaCosechaEstimada(request.fechaCosechaEstimada());
        return toResponse(loteRepository.save(lote));
    }

    @Override
    public String exportarGeoJson(
            String temporada,
            String cultivo,
            BigDecimal areaMin,
            BigDecimal areaMax,
            BigDecimal phMin,
            BigDecimal phMax,
            Boolean tienePoligono
    ) {
        List<Lote> lotes = loteRepository.search(temporada, cultivo, areaMin, areaMax, phMin, phMax, tienePoligono);
        ObjectNode root = objectMapper.createObjectNode();
        root.put("type", "FeatureCollection");
        ArrayNode features = root.putArray("features");

        for (Lote lote : lotes) {
            ObjectNode feature = features.addObject();
            feature.put("type", "Feature");
            ObjectNode properties = feature.putObject("properties");
            properties.put("id", lote.getId());
            properties.put("nombre", lote.getNombre());
            properties.put("area", lote.getArea().doubleValue());
            properties.put("cultivo", lote.getCultivo());
            properties.put("temporada", lote.getTemporada());
            if (lote.getPhMinimo() != null) {
                properties.put("phMinimo", lote.getPhMinimo().doubleValue());
            }
            if (lote.getPhMaximo() != null) {
                properties.put("phMaximo", lote.getPhMaximo().doubleValue());
            }
            if (lote.getFechaSiembra() != null) {
                properties.put("fechaSiembra", lote.getFechaSiembra().toString());
            }
            if (lote.getFechaCosechaEstimada() != null) {
                properties.put("fechaCosechaEstimada", lote.getFechaCosechaEstimada().toString());
            }
            if (lote.getLatitud() != null) {
                properties.put("latitud", lote.getLatitud().doubleValue());
            }
            if (lote.getLongitud() != null) {
                properties.put("longitud", lote.getLongitud().doubleValue());
            }

            if (lote.getPoligono() != null && !lote.getPoligono().isBlank()) {
                feature.set("geometry", readJson(lote.getPoligono()));
            } else if (lote.getLatitud() != null && lote.getLongitud() != null) {
                ObjectNode geometry = feature.putObject("geometry");
                geometry.put("type", "Point");
                ArrayNode coordinates = geometry.putArray("coordinates");
                coordinates.add(lote.getLongitud().doubleValue());
                coordinates.add(lote.getLatitud().doubleValue());
            } else {
                feature.putNull("geometry");
            }
        }

        return writeJson(root);
    }

    @Override
    @Transactional
    public List<LoteResponse> importarGeoJson(String geoJson) {
        JsonNode root = readJson(geoJson);
        if (!"FeatureCollection".equals(root.path("type").asText())) {
            throw new BusinessException("El GeoJSON debe ser un FeatureCollection");
        }

        JsonNode features = root.path("features");
        if (!features.isArray() || features.isEmpty()) {
            throw new BusinessException("El GeoJSON no contiene features para importar");
        }

        return streamFeatures(features).stream()
                .map(this::importFeature)
                .map(loteRepository::save)
                .map(this::toResponse)
                .toList();
    }

    @Override
    public LoteReporteResponse generarReporte(String id) {
        Lote lote = findActiveOrThrow(id);
        Optional<HistoricoCultivo> ultimoCultivo = historicoCultivoRepository.findUltimoCultivo(id);

        return new LoteReporteResponse(
                lote.getId(),
                lote.getNombre(),
                lote.getCultivo(),
                lote.getTemporada(),
                lote.getArea(),
                eventoSiembraRepository.countByLoteId(id),
                registroCosechaRepository.countByLoteId(id),
                propiedadSueloRepository.countByLoteId(id),
                historicoCultivoRepository.countByLoteId(id),
                defaultDouble(registroCosechaRepository.calcularRendimientoPromedio(id)),
                defaultDouble(historicoCultivoRepository.calcularRendimientoPromedio(id)),
                ultimoCultivo.map(HistoricoCultivo::getCultivo).orElse(null),
                ultimoCultivo.map(HistoricoCultivo::getTemporada).orElse(null)
        );
    }

    @Override
    @Transactional
    public void eliminar(String id) {
        Lote lote = findActiveOrThrow(id);
        lote.softDelete();
        loteRepository.save(lote);
    }

    private Lote findActiveOrThrow(String id) {
        return loteRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado con id: " + id));
    }

    private Lote importFeature(JsonNode featureNode) {
        JsonNode properties = featureNode.path("properties");
        String nombre = requiredText(properties, "nombre");
        String cultivo = requiredText(properties, "cultivo");
        String temporada = requiredText(properties, "temporada");
        BigDecimal area = requiredDecimal(properties, "area");
        JsonNode geometry = featureNode.path("geometry");

        BigDecimal latitud = decimalOrNull(properties, "latitud");
        BigDecimal longitud = decimalOrNull(properties, "longitud");
        BigDecimal phMinimo = decimalOrNull(properties, "phMinimo");
        BigDecimal phMaximo = decimalOrNull(properties, "phMaximo");
        var fechaSiembra = localDateOrNull(properties, "fechaSiembra");
        var fechaCosechaEstimada = localDateOrNull(properties, "fechaCosechaEstimada");
        String poligono = null;

        if (!geometry.isMissingNode() && !geometry.isNull()) {
            String geometryType = geometry.path("type").asText();
            if ("Polygon".equals(geometryType)) {
                poligono = writeJson(geometry);
                validatePolygon(poligono);
                if (latitud == null || longitud == null) {
                    Coordinate coordinate = firstPolygonCoordinate(geometry);
                    latitud = coordinate.latitud();
                    longitud = coordinate.longitud();
                }
            } else if ("Point".equals(geometryType)) {
                JsonNode coordinates = geometry.path("coordinates");
                if (coordinates.isArray() && coordinates.size() >= 2) {
                    longitud = BigDecimal.valueOf(coordinates.get(0).asDouble());
                    latitud = BigDecimal.valueOf(coordinates.get(1).asDouble());
                }
            }
        }

        return Lote.builder()
                .nombre(nombre)
                .cultivo(cultivo)
                .temporada(temporada)
                .area(area)
                .latitud(latitud)
                .longitud(longitud)
                .poligono(poligono)
                .phMinimo(phMinimo)
                .phMaximo(phMaximo)
                .fechaSiembra(fechaSiembra)
                .fechaCosechaEstimada(fechaCosechaEstimada)
                .build();
    }

    private List<JsonNode> streamFeatures(JsonNode features) {
        List<JsonNode> items = new ArrayList<>();
        features.forEach(items::add);
        return items;
    }

    private void validatePolygon(String poligono) {
        if (poligono == null || poligono.isBlank()) {
            return;
        }

        JsonNode polygonNode = readJson(poligono);
        if (!"Polygon".equals(polygonNode.path("type").asText())) {
            throw new BusinessException("El poligono debe tener type=Polygon");
        }

        JsonNode coordinates = polygonNode.path("coordinates");
        if (!coordinates.isArray() || coordinates.isEmpty()) {
            throw new BusinessException("El poligono debe contener coordenadas");
        }

        JsonNode ring = coordinates.get(0);
        if (!ring.isArray() || ring.size() < 4) {
            throw new BusinessException("El poligono debe tener al menos 4 puntos cerrando el anillo");
        }

        for (JsonNode point : ring) {
            if (!point.isArray() || point.size() < 2 || !point.get(0).isNumber() || !point.get(1).isNumber()) {
                throw new BusinessException("El poligono contiene coordenadas invalidas");
            }
        }

        JsonNode first = ring.get(0);
        JsonNode last = ring.get(ring.size() - 1);
        if (first.get(0).asDouble() != last.get(0).asDouble() || first.get(1).asDouble() != last.get(1).asDouble()) {
            throw new BusinessException("El poligono debe cerrar el anillo repitiendo el primer punto al final");
        }
    }

    private JsonNode readJson(String rawJson) {
        try {
            return objectMapper.readTree(rawJson);
        } catch (Exception exception) {
            throw new BusinessException("No se pudo interpretar el GeoJSON provisto");
        }
    }

    private String writeJson(JsonNode node) {
        try {
            return objectMapper.writeValueAsString(node);
        } catch (Exception exception) {
            throw new BusinessException("No se pudo serializar el GeoJSON");
        }
    }

    private String requiredText(JsonNode node, String field) {
        String value = node.path(field).asText(null);
        if (value == null || value.isBlank()) {
            throw new BusinessException("El campo '" + field + "' es requerido en cada feature del GeoJSON");
        }
        return value;
    }

    private BigDecimal requiredDecimal(JsonNode node, String field) {
        JsonNode value = node.path(field);
        if (!value.isNumber()) {
            throw new BusinessException("El campo numerico '" + field + "' es requerido en cada feature del GeoJSON");
        }
        return BigDecimal.valueOf(value.asDouble()).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal decimalOrNull(JsonNode node, String field) {
        JsonNode value = node.path(field);
        if (!value.isNumber()) {
            return null;
        }
        return BigDecimal.valueOf(value.asDouble());
    }

    private java.time.LocalDate localDateOrNull(JsonNode node, String field) {
        JsonNode value = node.path(field);
        if (!value.isTextual() || value.asText().isBlank()) {
            return null;
        }
        return java.time.LocalDate.parse(value.asText());
    }

    private Coordinate firstPolygonCoordinate(JsonNode polygonNode) {
        JsonNode point = polygonNode.path("coordinates").get(0).get(0);
        if (point == null || !point.isArray() || point.size() < 2) {
            throw new BusinessException("No se pudieron obtener coordenadas del poligono");
        }
        return new Coordinate(
                BigDecimal.valueOf(point.get(1).asDouble()),
                BigDecimal.valueOf(point.get(0).asDouble())
        );
    }

    private Double defaultDouble(Double value) {
        return value != null ? value : 0.0;
    }

    private LoteResponse toResponse(Lote lote) {
        return new LoteResponse(
                lote.getId(),
                lote.getNombre(),
                lote.getArea(),
                lote.getCultivo(),
                lote.getLatitud(),
                lote.getLongitud(),
                lote.getTemporada(),
                lote.getPoligono(),
                lote.getPhMinimo(),
                lote.getPhMaximo(),
                lote.getFechaSiembra(),
                lote.getFechaCosechaEstimada(),
                lote.getCreatedAt(),
                lote.getUpdatedAt()
        );
    }

    private record Coordinate(BigDecimal latitud, BigDecimal longitud) {}
}
