package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.plagas.*;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.plagas.*;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.plagas.*;
import com.campoapp.agricultura.service.PlagasService;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.repository.OperarioRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlagasServiceImpl implements PlagasService {
    private final CatalogoPlagaRepository catalogoRepository;
    private final DeteccionPlagaRepository deteccionRepository;
    private final AplicacionFitosanitariaRepository aplicacionRepository;
    private final SeguimientoPlagaRepository seguimientoRepository;
    private final LoteRepository loteRepository;
    private final OperarioRepository operarioRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<CatalogoPlagaResponse> listarCatalogo(String tipo) {
        return catalogoRepository.search(tipo).stream().map(this::toCatalogoResponse).toList();
    }

    @Override
    public Page<CatalogoPlagaResponse> listarCatalogoPaginado(String tipo, int page, int size) {
        return catalogoRepository.searchPage(tipo, pageRequest(page, size)).map(this::toCatalogoResponse);
    }

    @Override
    @Transactional
    public CatalogoPlagaResponse crearCatalogo(CatalogoPlagaRequest request) {
        CatalogoPlaga item = CatalogoPlaga.builder()
                .nombreComun(request.nombreComun())
                .nombreCientifico(request.nombreCientifico())
                .tipo(request.tipo())
                .cultivosAfectados(request.cultivosAfectados())
                .descripcion(request.descripcion())
                .sintomas(request.sintomas())
                .umbralAccion(request.umbralAccion())
                .activo(request.activo() == null || request.activo())
                .build();
        return toCatalogoResponse(catalogoRepository.save(item));
    }

    @Override
    public List<DeteccionPlagaResponse> listarDetecciones(String loteId, EstadoDeteccionPlaga estado, SeveridadPlaga severidad, String cultivo) {
        return deteccionRepository.search(loteId, estado, severidad, cultivo).stream().map(this::toDeteccionResponse).toList();
    }

    @Override
    public Page<DeteccionPlagaResponse> listarDeteccionesPaginadas(String loteId, EstadoDeteccionPlaga estado, SeveridadPlaga severidad, String cultivo, int page, int size) {
        return deteccionRepository.searchPage(loteId, estado, severidad, cultivo, pageRequest(page, size)).map(this::toDeteccionResponse);
    }

    @Override
    public DeteccionPlagaResponse obtenerDeteccion(String id) {
        return toDeteccionResponse(findDeteccion(id));
    }

    @Override
    @Transactional
    public DeteccionPlagaResponse crearDeteccion(DeteccionPlagaRequest request) {
        Lote lote = findLote(request.loteId());
        CatalogoPlaga catalogo = findCatalogo(request.catalogoPlagaId());
        validateCoordinates(request.latitud(), request.longitud());
        validatePhoto(request.fotoContentType(), request.fotoTamanioBytes());
        String responsableId = resolveOperarioId(request.responsableId(), request.responsable(), false);

        DeteccionPlaga deteccion = DeteccionPlaga.builder()
                .lote(lote)
                .catalogoPlaga(catalogo)
                .fechaDeteccion(request.fechaDeteccion() != null ? request.fechaDeteccion() : LocalDateTime.now())
                .cultivo(blankToNull(request.cultivo()) != null ? request.cultivo() : lote.getCultivo())
                .severidad(request.severidad())
                .areaAfectadaHa(request.areaAfectadaHa())
                .porcentajeAfectado(request.porcentajeAfectado())
                .estado(request.estado() != null ? request.estado() : EstadoDeteccionPlaga.ABIERTA)
                .latitud(request.latitud())
                .longitud(request.longitud())
                .precisionMetros(request.precisionMetros())
                .origenGeolocalizacion(request.origenGeolocalizacion() != null ? request.origenGeolocalizacion() : OrigenGeolocalizacion.MANUAL)
                .fotoUrl(request.fotoUrl())
                .fotoNombre(request.fotoNombre())
                .fotoContentType(request.fotoContentType())
                .fotoTamanioBytes(request.fotoTamanioBytes())
                .descripcion(request.descripcion())
                .responsable(responsableId)
                .build();
        return toDeteccionResponse(deteccionRepository.save(deteccion));
    }

    @Override
    @Transactional
    public DeteccionPlagaResponse cambiarEstado(String id, EstadoDeteccionPlaga estado) {
        if (estado == null) {
            throw new BusinessException("El estado es requerido");
        }
        DeteccionPlaga deteccion = findDeteccion(id);
        deteccion.setEstado(estado);
        return toDeteccionResponse(deteccionRepository.save(deteccion));
    }

    @Override
    @Transactional
    public SeguimientoPlagaResponse crearSeguimiento(String deteccionId, SeguimientoPlagaRequest request) {
        DeteccionPlaga deteccion = findDeteccion(deteccionId);
        String responsableId = resolveOperarioId(request.responsableId(), request.responsable(), false);
        SeguimientoPlaga seguimiento = SeguimientoPlaga.builder()
                .deteccion(deteccion)
                .fecha(request.fecha() != null ? request.fecha() : LocalDateTime.now())
                .resultado(request.resultado())
                .severidad(request.severidad())
                .observaciones(request.observaciones())
                .responsable(responsableId)
                .build();
        deteccion.setSeveridad(request.severidad());
        if (request.resultado() == ResultadoSeguimientoPlaga.CONTROLADA) {
            deteccion.setEstado(EstadoDeteccionPlaga.CONTROLADA);
        }
        deteccionRepository.save(deteccion);
        return toSeguimientoResponse(seguimientoRepository.save(seguimiento));
    }

    @Override
    @Transactional
    public AplicacionFitosanitariaResponse crearAplicacion(String deteccionId, AplicacionFitosanitariaRequest request) {
        DeteccionPlaga deteccion = findDeteccion(deteccionId);
        LocalDateTime fecha = request.fechaAplicacion() != null ? request.fechaAplicacion() : LocalDateTime.now();
        String operarioResponsableId = resolveOperarioId(request.operarioResponsableId(), request.operarioResponsable(), true);
        AplicacionFitosanitaria aplicacion = AplicacionFitosanitaria.builder()
                .deteccion(deteccion)
                .lote(deteccion.getLote())
                .fechaAplicacion(fecha)
                .producto(request.producto())
                .principioActivo(request.principioActivo())
                .dosis(request.dosis())
                .unidadDosis(request.unidadDosis())
                .volumenCaldoLHa(request.volumenCaldoLHa())
                .superficieTratadaHa(request.superficieTratadaHa())
                .periodoCarenciaDias(request.periodoCarenciaDias())
                .periodoReingresoHoras(request.periodoReingresoHoras())
                .fechaReingresoSeguro(request.periodoReingresoHoras() != null ? fecha.plusHours(request.periodoReingresoHoras()) : null)
                .fechaCosechaSegura(request.periodoCarenciaDias() != null ? fecha.toLocalDate().plusDays(request.periodoCarenciaDias()) : null)
                .maquinariaId(request.maquinariaId())
                .operarioResponsable(operarioResponsableId)
                .condicionesClimaticas(request.condicionesClimaticas())
                .observaciones(request.observaciones())
                .build();
        deteccion.setEstado(EstadoDeteccionPlaga.EN_TRATAMIENTO);
        return toAplicacionResponse(aplicacionRepository.save(aplicacion));
    }

    @Override
    public List<AplicacionFitosanitariaResponse> listarAplicaciones() {
        return aplicacionRepository.findAllActive().stream().map(this::toAplicacionResponse).toList();
    }

    @Override
    public Page<AplicacionFitosanitariaResponse> listarAplicacionesPaginadas(int page, int size) {
        return aplicacionRepository.findAllActive(pageRequest(page, size)).map(this::toAplicacionResponse);
    }

    @Override
    public List<SeguimientoPlagaResponse> listarSeguimientos() {
        return seguimientoRepository.findAllActive().stream().map(this::toSeguimientoResponse).toList();
    }

    @Override
    public Page<SeguimientoPlagaResponse> listarSeguimientosPaginados(int page, int size) {
        return seguimientoRepository.findAllActive(pageRequest(page, size)).map(this::toSeguimientoResponse);
    }

    @Override
    public PlagasDashboardResponse dashboard() {
        return new PlagasDashboardResponse(
                deteccionRepository.countByEstado(EstadoDeteccionPlaga.ABIERTA),
                deteccionRepository.countByEstado(EstadoDeteccionPlaga.EN_TRATAMIENTO),
                deteccionRepository.countByEstado(EstadoDeteccionPlaga.CONTROLADA),
                deteccionRepository.countActiveBySeveridad(SeveridadPlaga.CRITICA, List.of(EstadoDeteccionPlaga.ABIERTA, EstadoDeteccionPlaga.EN_TRATAMIENTO))
        );
    }

    @Override
    public List<DeteccionPlagaResponse> historialLote(String loteId) {
        findLote(loteId);
        return listarDetecciones(loteId, null, null, null);
    }

    @Override
    public List<DeteccionPlagaResponse> mapaLote(String loteId) {
        findLote(loteId);
        return deteccionRepository.findMapPinsByLote(loteId).stream().map(this::toDeteccionResponse).toList();
    }

    @Override
    public ResolverLoteResponse resolverLote(ResolverLoteRequest request) {
        validateCoordinates(request.latitud(), request.longitud());
        double lat = request.latitud().doubleValue();
        double lng = request.longitud().doubleValue();
        return loteRepository.findAllActive().stream()
                .filter(lote -> containsPoint(lote, lat, lng))
                .findFirst()
                .map(lote -> new ResolverLoteResponse(lote.getId(), lote.getNombre(), true, null))
                .orElse(new ResolverLoteResponse(null, null, false, "El punto no pertenece a ningun lote con poligono definido"));
    }

    private Lote findLote(String id) {
        return loteRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado con id: " + id));
    }

    private CatalogoPlaga findCatalogo(String id) {
        return catalogoRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catalogo de plaga no encontrado con id: " + id));
    }

    private DeteccionPlaga findDeteccion(String id) {
        return deteccionRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deteccion de plaga no encontrada con id: " + id));
    }

    private PageRequest pageRequest(int page, int size) {
        int normalizedPage = Math.max(0, page);
        int normalizedSize = Math.min(Math.max(1, size), 100);
        return PageRequest.of(normalizedPage, normalizedSize);
    }

    private String resolveOperarioId(String explicitId, String legacyValue, boolean required) {
        String value = blankToNull(explicitId) != null ? explicitId : legacyValue;
        value = blankToNull(value);
        if (value == null) {
            if (required) {
                throw new BusinessException("El operario responsable es requerido");
            }
            return null;
        }
        final String operarioId = value;
        operarioRepository.findActiveById(operarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Operario no encontrado con id: " + operarioId));
        return operarioId;
    }

    private String operarioNombre(String operarioId) {
        if (blankToNull(operarioId) == null) {
            return null;
        }
        return operarioRepository.findActiveById(operarioId)
                .map(this::fullName)
                .orElse(operarioId);
    }

    private String fullName(Operario operario) {
        return (operario.getNombre() + " " + operario.getApellido()).trim();
    }

    private void validateCoordinates(BigDecimal latitud, BigDecimal longitud) {
        if (latitud == null && longitud == null) {
            return;
        }
        if (latitud == null || longitud == null) {
            throw new BusinessException("Latitud y longitud deben informarse juntas");
        }
        double lat = latitud.doubleValue();
        double lng = longitud.doubleValue();
        if (!Double.isFinite(lat) || !Double.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new BusinessException("Coordenadas invalidas");
        }
    }

    private void validatePhoto(String contentType, Long size) {
        if (contentType == null || contentType.isBlank()) {
            return;
        }
        if (!List.of("image/jpeg", "image/png", "image/webp").contains(contentType)) {
            throw new BusinessException("Formato de imagen no permitido");
        }
        if (size != null && size > 5_000_000L) {
            throw new BusinessException("La imagen supera el tamano maximo permitido");
        }
    }

    private boolean containsPoint(Lote lote, double lat, double lng) {
        if (lote.getPoligono() == null || lote.getPoligono().isBlank()) {
            return false;
        }
        try {
            JsonNode ring = objectMapper.readTree(lote.getPoligono()).path("coordinates").get(0);
            boolean inside = false;
            for (int i = 0, j = ring.size() - 1; i < ring.size(); j = i++) {
                double xi = ring.get(i).get(0).asDouble();
                double yi = ring.get(i).get(1).asDouble();
                double xj = ring.get(j).get(0).asDouble();
                double yj = ring.get(j).get(1).asDouble();
                boolean intersects = ((yi > lat) != (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi + 0.0) + xi);
                if (intersects) {
                    inside = !inside;
                }
            }
            return inside;
        } catch (Exception ignored) {
            return false;
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private CatalogoPlagaResponse toCatalogoResponse(CatalogoPlaga item) {
        return new CatalogoPlagaResponse(item.getId(), item.getNombreComun(), item.getNombreCientifico(), item.getTipo(), item.getCultivosAfectados(), item.getDescripcion(), item.getSintomas(), item.getUmbralAccion(), item.getActivo(), item.getCreatedAt(), item.getUpdatedAt());
    }

    private DeteccionPlagaResponse toDeteccionResponse(DeteccionPlaga item) {
        return new DeteccionPlagaResponse(item.getId(), item.getLote().getId(), item.getLote().getNombre(), item.getCatalogoPlaga().getId(), item.getCatalogoPlaga().getNombreComun(), item.getCatalogoPlaga().getTipo(), item.getFechaDeteccion(), item.getCultivo(), item.getSeveridad(), item.getAreaAfectadaHa(), item.getPorcentajeAfectado(), item.getEstado(), item.getLatitud(), item.getLongitud(), item.getPrecisionMetros(), item.getOrigenGeolocalizacion(), item.getFotoUrl(), item.getFotoNombre(), item.getFotoContentType(), item.getFotoTamanioBytes(), item.getDescripcion(), item.getResponsable(), operarioNombre(item.getResponsable()), item.getCreatedAt(), item.getUpdatedAt());
    }

    private AplicacionFitosanitariaResponse toAplicacionResponse(AplicacionFitosanitaria item) {
        return new AplicacionFitosanitariaResponse(item.getId(), item.getDeteccion().getId(), item.getLote().getId(), item.getLote().getNombre(), item.getFechaAplicacion(), item.getProducto(), item.getPrincipioActivo(), item.getDosis(), item.getUnidadDosis(), item.getVolumenCaldoLHa(), item.getSuperficieTratadaHa(), item.getPeriodoCarenciaDias(), item.getPeriodoReingresoHoras(), item.getFechaReingresoSeguro(), item.getFechaCosechaSegura(), item.getMaquinariaId(), item.getOperarioResponsable(), operarioNombre(item.getOperarioResponsable()), item.getCondicionesClimaticas(), item.getObservaciones(), item.getCreatedAt());
    }

    private SeguimientoPlagaResponse toSeguimientoResponse(SeguimientoPlaga item) {
        DeteccionPlaga deteccion = item.getDeteccion();
        return new SeguimientoPlagaResponse(item.getId(), deteccion.getId(), deteccion.getCatalogoPlaga().getNombreComun(), deteccion.getLote().getNombre(), item.getFecha(), item.getResultado(), item.getSeveridad(), item.getObservaciones(), item.getResponsable(), operarioNombre(item.getResponsable()), item.getCreatedAt());
    }
}
