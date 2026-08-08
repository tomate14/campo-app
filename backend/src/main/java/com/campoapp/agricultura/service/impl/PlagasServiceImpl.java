package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.plagas.*;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.plagas.*;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.plagas.*;
import com.campoapp.agricultura.service.PlagasService;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.common.storage.FileStorageService;
import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.repository.OperarioRepository;
import com.campoapp.utilidades.service.CatalogoUtilidadRegistry;
import com.campoapp.utilidades.service.UtilidadNombreResolver;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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
    private final UtilidadNombreResolver utilidadNombreResolver;
    private final CatalogoPlagaImagenRepository imagenRepository;
    private final FileStorageService fileStorageService;

    @Override
    public List<CatalogoPlagaResponse> listarCatalogo(String tipo) {
        List<CatalogoPlaga> items = catalogoRepository.search(tipo);
        Map<String, String> tipos = tiposDeCatalogo(items);
        Map<String, String> cultivos = cultivosDeCatalogo(items);
        Map<String, List<CatalogoPlagaImagenResponse>> imagenes = imagenesPorPlaga(items);
        return items.stream().map(item -> toCatalogoResponse(item, tipos, cultivos, imagenes)).toList();
    }

    @Override
    public Page<CatalogoPlagaResponse> listarCatalogoPaginado(String tipo, int page, int size) {
        Page<CatalogoPlaga> pagina = catalogoRepository.searchPage(tipo, pageRequest(page, size));
        Map<String, String> tipos = tiposDeCatalogo(pagina.getContent());
        Map<String, String> cultivos = cultivosDeCatalogo(pagina.getContent());
        Map<String, List<CatalogoPlagaImagenResponse>> imagenes = imagenesPorPlaga(pagina.getContent());
        return pagina.map(item -> toCatalogoResponse(item, tipos, cultivos, imagenes));
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
                .zonaTipica(request.zonaTipica())
                .activo(request.activo() == null || request.activo())
                .build();
        return toCatalogoResponse(catalogoRepository.save(item));
    }

    @Override
    @Transactional
    public CatalogoPlagaResponse actualizarCatalogo(String id, CatalogoPlagaRequest request) {
        CatalogoPlaga item = findCatalogo(id);
        item.setNombreComun(request.nombreComun());
        item.setNombreCientifico(request.nombreCientifico());
        item.setTipo(request.tipo());
        item.setCultivosAfectados(request.cultivosAfectados());
        item.setDescripcion(request.descripcion());
        item.setSintomas(request.sintomas());
        item.setUmbralAccion(request.umbralAccion());
        item.setZonaTipica(request.zonaTipica());
        if (request.activo() != null) {
            item.setActivo(request.activo());
        }
        return toCatalogoResponse(catalogoRepository.save(item));
    }

    @Override
    @Transactional
    public CatalogoPlagaImagenResponse agregarImagenCatalogo(String catalogoPlagaId, MultipartFile foto, boolean esPrincipal) {
        CatalogoPlaga plaga = findCatalogo(catalogoPlagaId);
        // Guarda primero el archivo fisico; si falla, no se crea la fila.
        String path = fileStorageService.storePlagaImage(foto);
        List<CatalogoPlagaImagen> existentes = imagenRepository
                .findByCatalogoPlagaIdAndDeletedAtIsNullOrderByEsPrincipalDescOrdenAscCreatedAtAsc(catalogoPlagaId);
        if (esPrincipal && !existentes.isEmpty()) {
            existentes.forEach(img -> img.setEsPrincipal(false));
            imagenRepository.saveAll(existentes);
        }
        int nextOrden = existentes.stream()
                .map(img -> img.getOrden() == null ? 0 : img.getOrden())
                .max(Integer::compareTo)
                .orElse(-1) + 1;
        CatalogoPlagaImagen imagen = CatalogoPlagaImagen.builder()
                .catalogoPlagaId(plaga.getId())
                .path(path)
                .nombre(foto.getOriginalFilename())
                .contentType(foto.getContentType())
                .tamanioBytes(foto.getSize())
                .esPrincipal(esPrincipal)
                .orden(nextOrden)
                .build();
        return toImagenResponse(imagenRepository.save(imagen));
    }

    @Override
    public List<CatalogoPlagaImagenResponse> listarImagenesCatalogo(String catalogoPlagaId) {
        findCatalogo(catalogoPlagaId);
        return imagenRepository
                .findByCatalogoPlagaIdAndDeletedAtIsNullOrderByEsPrincipalDescOrdenAscCreatedAtAsc(catalogoPlagaId)
                .stream().map(this::toImagenResponse).toList();
    }

    @Override
    @Transactional
    public void eliminarImagenCatalogo(String catalogoPlagaId, String imagenId) {
        findCatalogo(catalogoPlagaId);
        CatalogoPlagaImagen imagen = imagenRepository.findByIdAndDeletedAtIsNull(imagenId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagen no encontrada con id: " + imagenId));
        if (!imagen.getCatalogoPlagaId().equals(catalogoPlagaId)) {
            throw new ResourceNotFoundException("Imagen no encontrada con id: " + imagenId);
        }
        imagen.softDelete();
        imagenRepository.save(imagen);
        // Borrado fisico best-effort: si el archivo no existe no rompe la operacion.
        fileStorageService.deleteQuietly(imagen.getPath());
    }

    @Override
    public List<PlagaSugeridaResponse> sugeridas(String catalogoPlagaId) {
        CatalogoPlaga base = findCatalogo(catalogoPlagaId);
        String baseGenero = genero(base.getNombreCientifico());
        Set<String> baseCultivos = cultivosSet(base.getCultivosAfectados());
        Set<String> baseSintomas = tokensSintomas(base.getSintomas());
        // Feature 73: cultivos_afectados son ids; resolvemos a valores para el texto del motivo.
        // La interseccion siempre es subconjunto de baseCultivos, asi que basta resolver esos ids.
        Map<String, String> cultivoNombres = utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.CULTIVO, baseCultivos);

        List<Sugerida> scored = new ArrayList<>();
        for (CatalogoPlaga candidata : catalogoRepository.search(null)) {
            if (candidata.getId().equals(base.getId()) || !Boolean.TRUE.equals(candidata.getActivo())) {
                continue;
            }
            int score = 0;
            List<String> motivos = new ArrayList<>();

            String genero = genero(candidata.getNombreCientifico());
            if (baseGenero != null && genero != null && baseGenero.equalsIgnoreCase(genero)) {
                score += 3;
                motivos.add("Mismo género (" + capitalizar(baseGenero) + ")");
            }

            Set<String> interCultivos = new LinkedHashSet<>(baseCultivos);
            interCultivos.retainAll(cultivosSet(candidata.getCultivosAfectados()));
            if (!interCultivos.isEmpty()) {
                score += 2;
                // Resolvemos cada id de cultivo a su valor para no mostrar el token crudo (ej: "cult-maiz").
                String nombres = interCultivos.stream()
                        .map(id -> resolverUtilidad(CatalogoUtilidadRegistry.CULTIVO, id, cultivoNombres))
                        .collect(Collectors.joining(", "));
                motivos.add("Comparte cultivos: " + nombres);
            }

            if (base.getTipo() != null && base.getTipo().equals(candidata.getTipo())) {
                score += 1;
                motivos.add("Mismo tipo");
            }

            Set<String> interSintomas = new HashSet<>(baseSintomas);
            interSintomas.retainAll(tokensSintomas(candidata.getSintomas()));
            if (interSintomas.size() >= 2) {
                score += 1;
                motivos.add("Síntomas similares");
            }

            if (score > 0) {
                scored.add(new Sugerida(candidata, score, motivos));
            }
        }

        List<Sugerida> top = scored.stream()
                .sorted(Comparator.comparingInt(Sugerida::score).reversed()
                        .thenComparing(s -> s.plaga().getNombreComun(), Comparator.nullsLast(String::compareTo)))
                .limit(5)
                .toList();

        List<CatalogoPlaga> plagasTop = top.stream().map(Sugerida::plaga).toList();
        Map<String, List<CatalogoPlagaImagenResponse>> imagenes = imagenesPorPlaga(plagasTop);
        Map<String, String> tipos = tiposDeCatalogo(plagasTop);
        return top.stream().map(s -> {
            CatalogoPlaga p = s.plaga();
            List<CatalogoPlagaImagenResponse> imgs = imagenes.getOrDefault(p.getId(), List.of());
            String principal = imgs.isEmpty() ? null : imgs.get(0).url();
            return new PlagaSugeridaResponse(p.getId(), p.getNombreComun(), p.getNombreCientifico(), p.getTipo(),
                    resolverUtilidad(CatalogoUtilidadRegistry.TIPO_PLAGA, p.getTipo(), tipos), principal, s.score(), s.motivos());
        }).toList();
    }

    // Tupla interna para el ranking de sugeridas.
    private record Sugerida(CatalogoPlaga plaga, int score, List<String> motivos) {}

    @Override
    public List<DeteccionPlagaResponse> listarDetecciones(String loteId, EstadoDeteccionPlaga estado, SeveridadPlaga severidad, String cultivo) {
        return toDeteccionResponses(deteccionRepository.search(loteId, estado, severidad, cultivo));
    }

    @Override
    public Page<DeteccionPlagaResponse> listarDeteccionesPaginadas(String loteId, EstadoDeteccionPlaga estado, SeveridadPlaga severidad, String cultivo, int page, int size) {
        Page<DeteccionPlaga> pagina = deteccionRepository.searchPage(loteId, estado, severidad, cultivo, pageRequest(page, size));
        Map<String, String> tipos = tiposDeDeteccion(pagina.getContent());
        Map<String, String> cultivos = cultivosDeDeteccion(pagina.getContent());
        return pagina.map(item -> toDeteccionResponse(item, tipos, cultivos));
    }

    @Override
    public DeteccionPlagaResponse obtenerDeteccion(String id) {
        return toDeteccionResponse(findDeteccion(id));
    }

    @Override
    @Transactional
    public DeteccionPlagaResponse crearDeteccion(DeteccionPlagaRequest request) {
        // Path JSON: los datos de foto salen del request (validamos tipo/tamano).
        validatePhoto(request.fotoContentType(), request.fotoTamanioBytes());
        DeteccionPlaga deteccion = buildDeteccion(request);
        deteccion.setFotoUrl(request.fotoUrl());
        deteccion.setFotoNombre(request.fotoNombre());
        deteccion.setFotoContentType(request.fotoContentType());
        deteccion.setFotoTamanioBytes(request.fotoTamanioBytes());
        return toDeteccionResponse(deteccionRepository.save(deteccion));
    }

    @Override
    @Transactional
    public DeteccionPlagaResponse crearDeteccionConFoto(DeteccionPlagaRequest request, MultipartFile foto) {
        DeteccionPlaga deteccion = buildDeteccion(request);
        // Path con-foto: los datos reales de la foto salen del archivo (ignoramos los del request);
        // storeImage ya valida tipo/tamano.
        if (foto != null && !foto.isEmpty()) {
            String rel = fileStorageService.storeImage(foto, "plagas-detecciones");
            deteccion.setFotoUrl("/uploads/" + rel);
            deteccion.setFotoNombre(foto.getOriginalFilename());
            deteccion.setFotoContentType(foto.getContentType());
            deteccion.setFotoTamanioBytes(foto.getSize());
        }
        return toDeteccionResponse(deteccionRepository.save(deteccion));
    }

    // Arma la entidad de deteccion con todos los campos salvo la foto (la setea cada caller).
    private DeteccionPlaga buildDeteccion(DeteccionPlagaRequest request) {
        Lote lote = findLote(request.loteId());
        CatalogoPlaga catalogo = findCatalogo(request.catalogoPlagaId());
        validateCoordinates(request.latitud(), request.longitud());
        String responsableId = resolveOperarioId(request.responsableId(), request.responsable(), false);

        return DeteccionPlaga.builder()
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
                .descripcion(request.descripcion())
                .responsable(responsableId)
                .build();
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
        return toDeteccionResponses(deteccionRepository.findMapPinsByLote(loteId));
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

    // Batch id -> valor del catalogo TIPO_PLAGA para una lista de items de catalogo.
    private Map<String, String> tiposDeCatalogo(List<CatalogoPlaga> items) {
        return utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.TIPO_PLAGA,
                items.stream().map(CatalogoPlaga::getTipo).toList());
    }

    // Batch id -> valor de TIPO_PLAGA para una lista de detecciones (tipo sale del catalogo de la plaga).
    private Map<String, String> tiposDeDeteccion(List<DeteccionPlaga> items) {
        return utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.TIPO_PLAGA,
                items.stream().map(d -> d.getCatalogoPlaga().getTipo()).toList());
    }

    // Batch id -> valor de CULTIVO para una lista de detecciones.
    private Map<String, String> cultivosDeDeteccion(List<DeteccionPlaga> items) {
        return utilidadNombreResolver.resolverNombres(
                CatalogoUtilidadRegistry.CULTIVO,
                items.stream().map(DeteccionPlaga::getCultivo).toList());
    }

    private List<DeteccionPlagaResponse> toDeteccionResponses(List<DeteccionPlaga> items) {
        Map<String, String> tipos = tiposDeDeteccion(items);
        Map<String, String> cultivos = cultivosDeDeteccion(items);
        return items.stream().map(item -> toDeteccionResponse(item, tipos, cultivos)).toList();
    }

    // Usa el mapa batch si el id esta presente; si no, hace el lookup individual.
    private String resolverUtilidad(String categoria, String id, Map<String, String> nombres) {
        if (id != null && nombres.containsKey(id)) {
            return nombres.get(id);
        }
        return utilidadNombreResolver.resolver(categoria, id);
    }

    private CatalogoPlagaResponse toCatalogoResponse(CatalogoPlaga item) {
        return toCatalogoResponse(item, Map.of(), cultivosDeCatalogo(List.of(item)), imagenesPorPlaga(List.of(item)));
    }

    private CatalogoPlagaResponse toCatalogoResponse(CatalogoPlaga item, Map<String, String> tipoNombres, Map<String, String> cultivoNombres, Map<String, List<CatalogoPlagaImagenResponse>> imagenesPorPlaga) {
        List<CatalogoPlagaImagenResponse> imagenes = imagenesPorPlaga.getOrDefault(item.getId(), List.of());
        // La lista viene ordenada principal-primero, asi que el primer elemento es la principal (o null).
        String imagenPrincipalUrl = imagenes.isEmpty() ? null : imagenes.get(0).url();
        // Feature 73: cultivosAfectados guarda ids; resolvemos el CSV de ids -> CSV de valores para mostrar.
        String cultivosAfectadosNombres = resolverCsvCultivos(item.getCultivosAfectados(), cultivoNombres);
        return new CatalogoPlagaResponse(item.getId(), item.getNombreComun(), item.getNombreCientifico(), item.getTipo(), resolverUtilidad(CatalogoUtilidadRegistry.TIPO_PLAGA, item.getTipo(), tipoNombres), item.getCultivosAfectados(), cultivosAfectadosNombres, item.getDescripcion(), item.getSintomas(), item.getUmbralAccion(), item.getZonaTipica(), item.getActivo(), imagenes, imagenPrincipalUrl, item.getGbifGenero(), item.getGbifFamilia(), item.getCreatedAt(), item.getUpdatedAt());
    }

    // Batch id -> valor de CULTIVO para una lista de plagas: junta todos los ids del CSV cultivos_afectados
    // de cada plaga y los resuelve en un solo query (evita N+1 en los listados).
    private Map<String, String> cultivosDeCatalogo(List<CatalogoPlaga> items) {
        List<String> ids = items.stream()
                .flatMap(item -> cultivosIds(item.getCultivosAfectados()).stream())
                .toList();
        return utilidadNombreResolver.resolverNombres(CatalogoUtilidadRegistry.CULTIVO, ids);
    }

    // Resuelve el CSV de ids de cultivo a un CSV de valores (ej: "cult-maiz,cult-sorgo" -> "MAIZ, SORGO").
    // Cada id no matcheado cae a su valor crudo (mismo criterio que UtilidadNombreResolver).
    private String resolverCsvCultivos(String csvIds, Map<String, String> cultivoNombres) {
        List<String> ids = cultivosIds(csvIds);
        if (ids.isEmpty()) {
            return null;
        }
        return ids.stream()
                .map(id -> resolverUtilidad(CatalogoUtilidadRegistry.CULTIVO, id, cultivoNombres))
                .collect(Collectors.joining(", "));
    }

    // Split del CSV de cultivos: trim + ignorar vacios, preservando el orden.
    private List<String> cultivosIds(String csv) {
        if (blankToNull(csv) == null) {
            return List.of();
        }
        List<String> out = new ArrayList<>();
        for (String token : csv.split(",")) {
            String clean = token.trim();
            if (!clean.isEmpty()) {
                out.add(clean);
            }
        }
        return out;
    }

    private CatalogoPlagaImagenResponse toImagenResponse(CatalogoPlagaImagen img) {
        return new CatalogoPlagaImagenResponse(img.getId(), "/uploads/" + img.getPath(), img.getNombre(), img.getContentType(), img.getTamanioBytes(), Boolean.TRUE.equals(img.getEsPrincipal()), img.getOrden() == null ? 0 : img.getOrden());
    }

    // Carga batch de imagenes agrupadas por id de plaga (evita N+1 en los listados).
    private Map<String, List<CatalogoPlagaImagenResponse>> imagenesPorPlaga(List<CatalogoPlaga> items) {
        List<String> ids = items.stream().map(CatalogoPlaga::getId).toList();
        if (ids.isEmpty()) {
            return Map.of();
        }
        return imagenRepository.findByCatalogoPlagaIdInAndDeletedAtIsNull(ids).stream()
                .sorted(imagenComparator())
                .collect(Collectors.groupingBy(
                        CatalogoPlagaImagen::getCatalogoPlagaId,
                        LinkedHashMap::new,
                        Collectors.mapping(this::toImagenResponse, Collectors.toList())));
    }

    // Orden de imagenes: principal primero, luego por orden asc y antiguedad asc.
    private Comparator<CatalogoPlagaImagen> imagenComparator() {
        return Comparator
                .comparingInt((CatalogoPlagaImagen i) -> Boolean.TRUE.equals(i.getEsPrincipal()) ? 0 : 1)
                .thenComparingInt(i -> i.getOrden() == null ? 0 : i.getOrden())
                .thenComparing(CatalogoPlagaImagen::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
    }

    // Primera palabra del nombre cientifico = genero taxonomico.
    private String genero(String nombreCientifico) {
        String value = blankToNull(nombreCientifico);
        if (value == null) {
            return null;
        }
        String first = value.trim().split("\\s+")[0];
        return first.isBlank() ? null : first;
    }

    private String capitalizar(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }
        return Character.toUpperCase(value.charAt(0)) + value.substring(1).toLowerCase(Locale.ROOT);
    }

    // Ids de cultivo del CSV (trim, sin uppercase: son ids case-sensitive de utilidad_cultivo)
    // para comparar interseccion exacta entre plagas.
    private Set<String> cultivosSet(String cultivos) {
        if (blankToNull(cultivos) == null) {
            return Set.of();
        }
        Set<String> out = new LinkedHashSet<>();
        for (String c : cultivos.split(",")) {
            String t = c.trim();
            if (!t.isEmpty()) {
                out.add(t);
            }
        }
        return out;
    }

    // Tokens de sintomas: minusculas, palabras de >=4 chars.
    private Set<String> tokensSintomas(String sintomas) {
        if (blankToNull(sintomas) == null) {
            return Set.of();
        }
        Set<String> out = new HashSet<>();
        for (String token : sintomas.toLowerCase(Locale.ROOT).split("\\s+")) {
            String clean = token.trim();
            if (clean.length() >= 4) {
                out.add(clean);
            }
        }
        return out;
    }

    private DeteccionPlagaResponse toDeteccionResponse(DeteccionPlaga item) {
        return toDeteccionResponse(item, Map.of(), Map.of());
    }

    private DeteccionPlagaResponse toDeteccionResponse(DeteccionPlaga item, Map<String, String> tipoNombres, Map<String, String> cultivoNombres) {
        String tipoId = item.getCatalogoPlaga().getTipo();
        return new DeteccionPlagaResponse(item.getId(), item.getLote().getId(), item.getLote().getNombre(), item.getCatalogoPlaga().getId(), item.getCatalogoPlaga().getNombreComun(), tipoId, resolverUtilidad(CatalogoUtilidadRegistry.TIPO_PLAGA, tipoId, tipoNombres), item.getFechaDeteccion(), item.getCultivo(), resolverUtilidad(CatalogoUtilidadRegistry.CULTIVO, item.getCultivo(), cultivoNombres), item.getSeveridad(), item.getAreaAfectadaHa(), item.getPorcentajeAfectado(), item.getEstado(), item.getLatitud(), item.getLongitud(), item.getPrecisionMetros(), item.getOrigenGeolocalizacion(), item.getFotoUrl(), item.getFotoNombre(), item.getFotoContentType(), item.getFotoTamanioBytes(), item.getDescripcion(), item.getResponsable(), operarioNombre(item.getResponsable()), item.getCreatedAt(), item.getUpdatedAt());
    }

    private AplicacionFitosanitariaResponse toAplicacionResponse(AplicacionFitosanitaria item) {
        return new AplicacionFitosanitariaResponse(item.getId(), item.getDeteccion().getId(), item.getLote().getId(), item.getLote().getNombre(), item.getFechaAplicacion(), item.getProducto(), item.getPrincipioActivo(), item.getDosis(), item.getUnidadDosis(), item.getVolumenCaldoLHa(), item.getSuperficieTratadaHa(), item.getPeriodoCarenciaDias(), item.getPeriodoReingresoHoras(), item.getFechaReingresoSeguro(), item.getFechaCosechaSegura(), item.getMaquinariaId(), item.getOperarioResponsable(), operarioNombre(item.getOperarioResponsable()), item.getCondicionesClimaticas(), item.getObservaciones(), item.getCreatedAt());
    }

    private SeguimientoPlagaResponse toSeguimientoResponse(SeguimientoPlaga item) {
        DeteccionPlaga deteccion = item.getDeteccion();
        return new SeguimientoPlagaResponse(item.getId(), deteccion.getId(), deteccion.getCatalogoPlaga().getNombreComun(), deteccion.getLote().getNombre(), item.getFecha(), item.getResultado(), item.getSeveridad(), item.getObservaciones(), item.getResponsable(), operarioNombre(item.getResponsable()), item.getCreatedAt());
    }
}
