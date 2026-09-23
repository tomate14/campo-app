package com.campoapp.operarios.service.impl;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.operarios.dto.OrdenTrabajoActividadRequest;
import com.campoapp.operarios.dto.OrdenTrabajoActividadResponse;
import com.campoapp.operarios.dto.OrdenTrabajoCierreRequest;
import com.campoapp.operarios.dto.OrdenTrabajoDashboardResponse;
import com.campoapp.operarios.dto.OrdenTrabajoEstadoRequest;
import com.campoapp.operarios.dto.OrdenTrabajoHistorialResponse;
import com.campoapp.operarios.dto.OrdenTrabajoRequest;
import com.campoapp.operarios.dto.OrdenTrabajoResponse;
import com.campoapp.operarios.dto.OrdenTrabajoResumenResponse;
import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.entity.OrdenTrabajo;
import com.campoapp.operarios.entity.OrdenTrabajoActividad;
import com.campoapp.operarios.entity.OrdenTrabajoHistorial;
import com.campoapp.operarios.repository.OperarioRepository;
import com.campoapp.operarios.repository.OrdenTrabajoActividadRepository;
import com.campoapp.operarios.repository.OrdenTrabajoHistorialRepository;
import com.campoapp.operarios.repository.OrdenTrabajoRepository;
import com.campoapp.operarios.service.OrdenTrabajoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdenTrabajoServiceImpl implements OrdenTrabajoService {

    private static final String ESTADO_PENDIENTE = "PENDIENTE";
    private static final String ESTADO_EN_PROGRESO = "EN_PROGRESO";
    private static final String ESTADO_COMPLETADA = "COMPLETADA";
    private static final String ESTADO_CANCELADA = "CANCELADA";
    private static final String ESTADO_RECHAZADA = "RECHAZADA";
    private static final String PRIORIDAD_MEDIA = "MEDIA";
    private static final Set<String> ESTADOS_CIERRE = Set.of(ESTADO_COMPLETADA, ESTADO_CANCELADA, ESTADO_RECHAZADA);

    private final OrdenTrabajoRepository ordenRepository;
    private final OrdenTrabajoActividadRepository actividadRepository;
    private final OrdenTrabajoHistorialRepository historialRepository;
    private final OperarioRepository operarioRepository;
    private final LoteRepository loteRepository;

    @Override
    public OrdenTrabajoResumenResponse resumen(String search, String estado, String operarioId, String loteId, String prioridad) {
        return resumen(search, estado, operarioId, loteId, prioridad, null, null);
    }

    @Override
    public OrdenTrabajoResumenResponse resumen(String search, String estado, String operarioId, String loteId, String prioridad, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return new OrdenTrabajoResumenResponse(dashboard(), listar(search, estado, operarioId, loteId, prioridad, fechaInicio, fechaFin));
    }

    @Override
    public List<OrdenTrabajoResponse> listar(String search, String estado, String operarioId, String loteId, String prioridad) {
        return listar(search, estado, operarioId, loteId, prioridad, null, null);
    }

    @Override
    public List<OrdenTrabajoResponse> listar(String search, String estado, String operarioId, String loteId, String prioridad, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return ordenRepository.search(blankToNull(search), blankToNull(estado), blankToNull(operarioId), blankToNull(loteId), blankToNull(prioridad), fechaInicio, fechaFin)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public OrdenTrabajoResponse buscarPorId(String id) {
        return toResponse(findOrden(id));
    }

    @Override
    @Transactional
    public OrdenTrabajoResponse crear(OrdenTrabajoRequest request) {
        Operario operario = findOperario(request.operarioId());
        Lote lote = resolveLote(request.loteId());
        OrdenTrabajo orden = OrdenTrabajo.builder()
                .codigo(nextCodigo())
                .titulo(required(request.titulo(), "titulo"))
                .descripcion(blankToNull(request.descripcion()))
                .lote(lote)
                .zona(blankToNull(request.zona()))
                .operario(operario)
                .prioridad(defaultText(request.prioridad(), PRIORIDAD_MEDIA))
                .estado(defaultText(request.estado(), ESTADO_PENDIENTE))
                .fechaProgramada(request.fechaProgramada())
                .fechaInicio(request.fechaInicio())
                .fechaFinEstimada(request.fechaFinEstimada())
                .fechaFinReal(request.fechaFinReal())
                .duracionEstimadaMin(validateMinutes(request.duracionEstimadaMin(), "duracionEstimadaMin"))
                .duracionRealMin(validateMinutes(request.duracionRealMin(), "duracionRealMin"))
                .resultado(blankToNull(request.resultado()))
                .observaciones(blankToNull(request.observaciones()))
                .build();
        OrdenTrabajo saved = ordenRepository.save(orden);
        addHistorial(saved, null, saved.getEstado(), "CREACION", fullName(operario), "Orden creada");
        return toResponse(saved);
    }

    @Override
    @Transactional
    public OrdenTrabajoResponse actualizar(String id, OrdenTrabajoRequest request) {
        OrdenTrabajo orden = findOrden(id);
        ensureNotClosed(orden);
        orden.setTitulo(required(request.titulo(), "titulo"));
        orden.setDescripcion(blankToNull(request.descripcion()));
        orden.setLote(resolveLote(request.loteId()));
        orden.setZona(blankToNull(request.zona()));
        orden.setOperario(findOperario(request.operarioId()));
        orden.setPrioridad(defaultText(request.prioridad(), PRIORIDAD_MEDIA));
        orden.setFechaProgramada(request.fechaProgramada());
        orden.setFechaInicio(request.fechaInicio());
        orden.setFechaFinEstimada(request.fechaFinEstimada());
        orden.setFechaFinReal(request.fechaFinReal());
        orden.setDuracionEstimadaMin(validateMinutes(request.duracionEstimadaMin(), "duracionEstimadaMin"));
        orden.setDuracionRealMin(validateMinutes(request.duracionRealMin(), "duracionRealMin"));
        orden.setResultado(blankToNull(request.resultado()));
        orden.setObservaciones(blankToNull(request.observaciones()));
        return toResponse(ordenRepository.save(orden));
    }

    @Override
    @Transactional
    public void eliminar(String id) {
        OrdenTrabajo orden = findOrden(id);
        orden.softDelete();
        ordenRepository.save(orden);
    }

    @Override
    @Transactional
    public OrdenTrabajoResponse cambiarEstado(String id, OrdenTrabajoEstadoRequest request) {
        OrdenTrabajo orden = findOrden(id);
        String previous = orden.getEstado();
        String next = required(request.estado(), "estado");
        orden.setEstado(next);
        if (ESTADO_EN_PROGRESO.equals(next) && orden.getFechaInicio() == null) {
            orden.setFechaInicio(LocalDateTime.now());
        }
        if (ESTADOS_CIERRE.contains(next) && orden.getFechaFinReal() == null) {
            orden.setFechaFinReal(LocalDateTime.now());
            orden.setDuracionRealMin(resolveDuration(orden));
        }
        OrdenTrabajo saved = ordenRepository.save(orden);
        addHistorial(saved, previous, next, "CAMBIO_ESTADO", blankToNull(request.responsable()), blankToNull(request.observaciones()));
        return toResponse(saved);
    }

    @Override
    @Transactional
    public OrdenTrabajoResponse agregarActividad(String id, OrdenTrabajoActividadRequest request) {
        OrdenTrabajo orden = findOrden(id);
        Operario operario = request.operarioId() == null || request.operarioId().isBlank() ? orden.getOperario() : findOperario(request.operarioId());
        OrdenTrabajoActividad actividad = OrdenTrabajoActividad.builder()
                .orden(orden)
                .operario(operario)
                .tipo(required(request.tipo(), "tipo"))
                .descripcion(required(request.descripcion(), "descripcion"))
                .inicio(request.inicio())
                .fin(request.fin())
                .duracionMin(resolveActivityDuration(request))
                .estado(defaultText(request.estado(), "REGISTRADA"))
                .evidenciaUrl(blankToNull(request.evidenciaUrl()))
                .observaciones(blankToNull(request.observaciones()))
                .build();
        actividadRepository.save(actividad);
        if (ESTADO_PENDIENTE.equals(orden.getEstado())) {
            cambiarEstado(id, new OrdenTrabajoEstadoRequest(ESTADO_EN_PROGRESO, fullName(operario), "Actividad registrada"));
        }
        return toResponse(orden);
    }

    @Override
    @Transactional
    public OrdenTrabajoResponse aceptar(String id, OrdenTrabajoCierreRequest request) {
        OrdenTrabajo orden = findOrden(id);
        orden.setResultado(blankToNull(request.resultado()));
        orden.setDuracionRealMin(validateMinutes(request.duracionRealMin(), "duracionRealMin"));
        return cambiarEstado(id, new OrdenTrabajoEstadoRequest(ESTADO_COMPLETADA, blankToNull(request.responsable()), "Trabajo aceptado"));
    }

    @Override
    @Transactional
    public OrdenTrabajoResponse rechazar(String id, OrdenTrabajoCierreRequest request) {
        OrdenTrabajo orden = findOrden(id);
        orden.setMotivoRechazo(required(request.motivo(), "motivo"));
        orden.setDuracionRealMin(validateMinutes(request.duracionRealMin(), "duracionRealMin"));
        return cambiarEstado(id, new OrdenTrabajoEstadoRequest(ESTADO_RECHAZADA, blankToNull(request.responsable()), orden.getMotivoRechazo()));
    }

    @Override
    @Transactional(readOnly = true)
    public OrdenTrabajoDashboardResponse dashboard() {
        List<OrdenTrabajo> ordenes = ordenRepository.search(null, null, null, null, null, null, null);
        return new OrdenTrabajoDashboardResponse(
                ordenes.size(),
                ordenRepository.countByDeletedAtIsNullAndEstado(ESTADO_PENDIENTE),
                ordenRepository.countByDeletedAtIsNullAndEstado(ESTADO_EN_PROGRESO),
                ordenRepository.countByDeletedAtIsNullAndEstado(ESTADO_COMPLETADA),
                ordenRepository.countByDeletedAtIsNullAndEstado(ESTADO_CANCELADA),
                ordenRepository.countByDeletedAtIsNullAndEstado(ESTADO_RECHAZADA),
                ordenRepository.countByDeletedAtIsNullAndEstadoNotInAndFechaFinEstimadaBefore(List.copyOf(ESTADOS_CIERRE), LocalDateTime.now()),
                actividadRepository.countByDeletedAtIsNull()
        );
    }

    private OrdenTrabajo findOrden(String id) {
        return ordenRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de trabajo no encontrada con id: " + id));
    }

    private Operario findOperario(String id) {
        return operarioRepository.findActiveById(required(id, "operarioId"))
                .orElseThrow(() -> new ResourceNotFoundException("Operario no encontrado con id: " + id));
    }

    private Lote resolveLote(String id) {
        if (id == null || id.isBlank()) {
            return null;
        }
        return loteRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado con id: " + id));
    }

    private String nextCodigo() {
        int year = Year.now().getValue();
        int index = (int) (ordenRepository.count() + 1);
        String candidate;
        do {
            candidate = "OT-" + year + "-" + String.format("%05d", index++);
        } while (ordenRepository.existsByCodigoAndDeletedAtIsNull(candidate));
        return candidate;
    }

    private void ensureNotClosed(OrdenTrabajo orden) {
        if (ESTADOS_CIERRE.contains(orden.getEstado())) {
            throw new BusinessException("No se puede editar una orden cerrada");
        }
    }

    private void addHistorial(OrdenTrabajo orden, String previous, String next, String action, String responsable, String observaciones) {
        historialRepository.save(OrdenTrabajoHistorial.builder()
                .orden(orden)
                .estadoAnterior(previous)
                .estadoNuevo(next)
                .accion(action)
                .responsable(responsable)
                .observaciones(observaciones)
                .build());
    }

    private OrdenTrabajoResponse toResponse(OrdenTrabajo orden) {
        return new OrdenTrabajoResponse(
                orden.getId(),
                orden.getCodigo(),
                orden.getTitulo(),
                orden.getDescripcion(),
                orden.getLote() == null ? null : orden.getLote().getId(),
                orden.getLote() == null ? null : orden.getLote().getNombre(),
                orden.getZona(),
                orden.getOperario().getId(),
                fullName(orden.getOperario()),
                orden.getPrioridad(),
                orden.getEstado(),
                orden.getFechaProgramada(),
                orden.getFechaInicio(),
                orden.getFechaFinEstimada(),
                orden.getFechaFinReal(),
                orden.getDuracionEstimadaMin(),
                orden.getDuracionRealMin(),
                orden.getResultado(),
                orden.getMotivoRechazo(),
                orden.getObservaciones(),
                actividadRepository.findByOrden(orden.getId()).stream().map(this::toActividadResponse).toList(),
                historialRepository.findByOrden(orden.getId()).stream().map(this::toHistorialResponse).toList(),
                orden.getCreatedAt(),
                orden.getUpdatedAt()
        );
    }

    private OrdenTrabajoActividadResponse toActividadResponse(OrdenTrabajoActividad actividad) {
        Operario operario = actividad.getOperario();
        return new OrdenTrabajoActividadResponse(
                actividad.getId(),
                actividad.getOrden().getId(),
                operario == null ? null : operario.getId(),
                operario == null ? null : fullName(operario),
                actividad.getTipo(),
                actividad.getDescripcion(),
                actividad.getInicio(),
                actividad.getFin(),
                actividad.getDuracionMin(),
                actividad.getEstado(),
                actividad.getEvidenciaUrl(),
                actividad.getObservaciones(),
                actividad.getCreatedAt()
        );
    }

    private OrdenTrabajoHistorialResponse toHistorialResponse(OrdenTrabajoHistorial historial) {
        return new OrdenTrabajoHistorialResponse(
                historial.getId(),
                historial.getOrden().getId(),
                historial.getEstadoAnterior(),
                historial.getEstadoNuevo(),
                historial.getAccion(),
                historial.getResponsable(),
                historial.getObservaciones(),
                historial.getCreatedAt()
        );
    }

    private Integer resolveDuration(OrdenTrabajo orden) {
        if (orden.getFechaInicio() == null || orden.getFechaFinReal() == null) {
            return orden.getDuracionRealMin();
        }
        return Math.toIntExact(Math.max(0, Duration.between(orden.getFechaInicio(), orden.getFechaFinReal()).toMinutes()));
    }

    private Integer resolveActivityDuration(OrdenTrabajoActividadRequest request) {
        Integer explicit = validateMinutes(request.duracionMin(), "duracionMin");
        if (explicit != null || request.inicio() == null || request.fin() == null) {
            return explicit;
        }
        return Math.toIntExact(Math.max(0, Duration.between(request.inicio(), request.fin()).toMinutes()));
    }

    private Integer validateMinutes(Integer value, String field) {
        if (value == null) {
            return null;
        }
        if (value < 0) {
            throw new BusinessException("El campo " + field + " no puede ser negativo");
        }
        return value;
    }

    private String fullName(Operario operario) {
        return (operario.getNombre() + " " + operario.getApellido()).trim();
    }

    private String required(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new BusinessException("El campo " + field + " es requerido");
        }
        return value.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
