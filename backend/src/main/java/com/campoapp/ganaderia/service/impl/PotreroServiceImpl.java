package com.campoapp.ganaderia.service.impl;

import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.ganaderia.dto.PotreroRequest;
import com.campoapp.ganaderia.dto.PotreroResponse;
import com.campoapp.ganaderia.entity.AnimalPotrero;
import com.campoapp.ganaderia.entity.Potrero;
import com.campoapp.ganaderia.repository.AnimalPotreroRepository;
import com.campoapp.ganaderia.repository.PotreroRepository;
import com.campoapp.ganaderia.service.PotreroService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PotreroServiceImpl implements PotreroService {

    private static final String DEFAULT_TIPO_USO = "PASTOREO";
    private static final String DEFAULT_ESTADO = "ACTIVO";

    private final PotreroRepository potreroRepository;
    private final AnimalPotreroRepository animalPotreroRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<PotreroResponse> listar(String nombre, String estado, String tipoUso, BigDecimal superficieMin, BigDecimal superficieMax) {
        Map<String, Long> cargas = cargasPorPotrero();
        return potreroRepository.search(blankToNull(nombre), blankToNull(estado), blankToNull(tipoUso), superficieMin, superficieMax)
                .stream()
                .map(potrero -> toResponse(potrero, cargas))
                .toList();
    }

    @Override
    public List<PotreroResponse> listarMapa() {
        Map<String, Long> cargas = cargasPorPotrero();
        return potreroRepository.findAllActive().stream().map(potrero -> toResponse(potrero, cargas)).toList();
    }

    @Override
    public PotreroResponse buscarPorId(String id) {
        return toResponse(findActiveOrThrow(id), cargasPorPotrero());
    }

    @Override
    @Transactional
    public PotreroResponse crear(PotreroRequest request) {
        validatePolygon(request.poligono());
        Potrero potrero = Potrero.builder()
                .nombre(request.nombre().trim())
                .descripcion(blankToNull(request.descripcion()))
                .superficieHa(normalizeArea(request.superficieHa()))
                .tipoUso(defaultText(request.tipoUso(), DEFAULT_TIPO_USO))
                .estado(defaultText(request.estado(), DEFAULT_ESTADO))
                .capacidadAnimales(nonNegative(request.capacidadAnimales(), "capacidadAnimales"))
                .recursoForrajero(blankToNull(request.recursoForrajero()))
                .disponibilidadAgua(request.disponibilidadAgua() == null || request.disponibilidadAgua())
                .tieneSombra(request.tieneSombra() != null && request.tieneSombra())
                .observaciones(blankToNull(request.observaciones()))
                .poligono(request.poligono())
                .centroideLatitud(request.centroideLatitud())
                .centroideLongitud(request.centroideLongitud())
                .build();
        return toResponse(potreroRepository.save(potrero), cargasPorPotrero());
    }

    @Override
    @Transactional
    public PotreroResponse actualizar(String id, PotreroRequest request) {
        validatePolygon(request.poligono());
        Potrero potrero = findActiveOrThrow(id);
        potrero.setNombre(request.nombre().trim());
        potrero.setDescripcion(blankToNull(request.descripcion()));
        potrero.setSuperficieHa(normalizeArea(request.superficieHa()));
        potrero.setTipoUso(defaultText(request.tipoUso(), DEFAULT_TIPO_USO));
        potrero.setEstado(defaultText(request.estado(), DEFAULT_ESTADO));
        potrero.setCapacidadAnimales(nonNegative(request.capacidadAnimales(), "capacidadAnimales"));
        potrero.setRecursoForrajero(blankToNull(request.recursoForrajero()));
        potrero.setDisponibilidadAgua(request.disponibilidadAgua() == null || request.disponibilidadAgua());
        potrero.setTieneSombra(request.tieneSombra() != null && request.tieneSombra());
        potrero.setObservaciones(blankToNull(request.observaciones()));
        potrero.setPoligono(request.poligono());
        potrero.setCentroideLatitud(request.centroideLatitud());
        potrero.setCentroideLongitud(request.centroideLongitud());
        return toResponse(potreroRepository.save(potrero), cargasPorPotrero());
    }

    @Override
    @Transactional
    public void eliminar(String id) {
        Potrero potrero = findActiveOrThrow(id);
        potrero.softDelete();
        potreroRepository.save(potrero);
    }

    private Potrero findActiveOrThrow(String id) {
        return potreroRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Potrero no encontrado con id: " + id));
    }

    private void validatePolygon(String poligono) {
        if (poligono == null || poligono.isBlank()) {
            throw new BusinessException("El poligono del potrero es requerido");
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
            throw new BusinessException("El poligono debe tener al menos 3 puntos y cerrar el anillo");
        }

        for (JsonNode point : ring) {
            if (!point.isArray() || point.size() < 2 || !point.get(0).isNumber() || !point.get(1).isNumber()) {
                throw new BusinessException("El poligono contiene coordenadas invalidas");
            }
            double lng = point.get(0).asDouble();
            double lat = point.get(1).asDouble();
            if (!Double.isFinite(lng) || !Double.isFinite(lat)) {
                throw new BusinessException("El poligono contiene coordenadas no finitas");
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
            throw new BusinessException("No se pudo interpretar el GeoJSON del potrero");
        }
    }

    private BigDecimal normalizeArea(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("La superficie del potrero no puede ser negativa");
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private Integer nonNegative(Integer value, String field) {
        if (value != null && value < 0) {
            throw new BusinessException("El campo " + field + " no puede ser negativo");
        }
        return value;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private Map<String, Long> cargasPorPotrero() {
        return animalPotreroRepository.findAllActiveWithPotrero().stream()
                .filter(assignment -> assignment.getPotrero() != null)
                .collect(Collectors.groupingBy(assignment -> assignment.getPotrero().getId(), Collectors.counting()));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private PotreroResponse toResponse(Potrero potrero, Map<String, Long> cargas) {
        int cargaActual = Math.toIntExact(cargas.getOrDefault(potrero.getId(), 0L));
        return new PotreroResponse(
                potrero.getId(),
                potrero.getNombre(),
                potrero.getDescripcion(),
                potrero.getSuperficieHa(),
                potrero.getTipoUso(),
                potrero.getEstado(),
                potrero.getCapacidadAnimales(),
                cargaActual,
                potrero.getRecursoForrajero(),
                potrero.getDisponibilidadAgua(),
                potrero.getTieneSombra(),
                potrero.getObservaciones(),
                potrero.getPoligono(),
                potrero.getCentroideLatitud(),
                potrero.getCentroideLongitud(),
                potrero.getCreatedAt(),
                potrero.getUpdatedAt()
        );
    }
}
