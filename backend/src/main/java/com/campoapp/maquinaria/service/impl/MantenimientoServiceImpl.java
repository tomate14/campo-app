package com.campoapp.maquinaria.service.impl;

import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.maquinaria.dto.*;
import com.campoapp.maquinaria.entity.*;
import com.campoapp.maquinaria.repository.*;
import com.campoapp.maquinaria.service.MantenimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class MantenimientoServiceImpl implements MantenimientoService {
    private final MaquinariaRepository maquinariaRepository;
    private final PlanMantenimientoRepository planRepository;
    private final MantenimientoProgramadoRepository programadoRepository;
    private final IntervencionMantenimientoRepository intervencionRepository;
    private final RepuestoUtilizadoRepository repuestoRepository;

    @Override
    @Transactional(readOnly = true)
    public MantenimientoResumenResponse getResumen(String maquinariaId, String estado) {
        return new MantenimientoResumenResponse(
                getDashboard(),
                listPlanes(),
                listProgramaciones(blankToNull(maquinariaId), blankToNull(estado)),
                listIntervenciones(blankToNull(maquinariaId), null).stream().limit(12).toList()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public MantenimientoDashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();
        YearMonth current = YearMonth.now();
        BigDecimal costoMes = intervencionRepository.findByFechaBetweenAndDeletedAtIsNull(current.atDay(1), current.atEndOfMonth()).stream()
                .map(IntervencionMantenimiento::getCostoTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long enTaller = maquinariaRepository.findFiltered(null, null, null).stream()
                .filter(m -> "EN_REPARACION".equals(m.getEstado()) || "MANTENIMIENTO".equals(m.getEstado()) || "REPARACION".equals(m.getEstado()))
                .count();
        List<String> alertas = programadoRepository.findFiltered(null, "PENDIENTE").stream()
                .filter(p -> !p.getFechaProgramada().isAfter(today.plusDays(15)))
                .map(p -> p.getMaquinaria().getCodigo() + " requiere mantenimiento el " + p.getFechaProgramada())
                .limit(5)
                .toList();
        return new MantenimientoDashboardResponse(
                planRepository.findByActivoTrueAndDeletedAtIsNullOrderByNombreAsc().size(),
                programadoRepository.countByEstadoAndDeletedAtIsNull("PENDIENTE"),
                programadoRepository.countByEstadoAndFechaProgramadaBeforeAndDeletedAtIsNull("PENDIENTE", today),
                enTaller,
                costoMes,
                alertas
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlanMantenimientoResponse> listPlanes() {
        return planRepository.findByDeletedAtIsNullOrderByUpdatedAtDesc().stream().map(this::toPlanResponse).toList();
    }

    @Override
    public PlanMantenimientoResponse createPlan(PlanMantenimientoRequest request) {
        Maquinaria maquinaria = request.maquinariaId() == null || request.maquinariaId().isBlank() ? null : getMaquinaria(request.maquinariaId());
        PlanMantenimiento plan = PlanMantenimiento.builder()
                .maquinaria(maquinaria)
                .tipoMaquinaria(request.tipoMaquinaria())
                .modelo(request.modelo())
                .nombre(request.nombre())
                .descripcion(request.descripcion())
                .intervaloHoras(request.intervaloHoras())
                .intervaloDias(request.intervaloDias())
                .prioridad(defaultValue(request.prioridad(), "MEDIA"))
                .activo(request.activo() == null || request.activo())
                .build();
        return toPlanResponse(planRepository.save(plan));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MantenimientoProgramadoResponse> listProgramaciones(String maquinariaId, String estado) {
        return programadoRepository.findFiltered(blankToNull(maquinariaId), blankToNull(estado)).stream().map(this::toProgramadoResponse).toList();
    }

    @Override
    public MantenimientoProgramadoResponse createProgramacion(MantenimientoProgramadoRequest request) {
        MantenimientoProgramado programado = MantenimientoProgramado.builder()
                .maquinaria(getMaquinaria(request.maquinariaId()))
                .plan(getPlanOrNull(request.planId()))
                .fechaProgramada(request.fechaProgramada())
                .horometroObjetivo(request.horometroObjetivo())
                .estado(defaultValue(request.estado(), "PENDIENTE"))
                .responsable(request.responsable())
                .observaciones(request.observaciones())
                .build();
        return toProgramadoResponse(programadoRepository.save(programado));
    }

    @Override
    public MantenimientoProgramadoResponse updateProgramacionEstado(String id, String estado) {
        MantenimientoProgramado programado = getProgramacion(id);
        programado.setEstado(defaultValue(estado, "PENDIENTE"));
        return toProgramadoResponse(programadoRepository.save(programado));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IntervencionMantenimientoResponse> listIntervenciones(String maquinariaId, String tipo) {
        return intervencionRepository.findFiltered(blankToNull(maquinariaId), blankToNull(tipo)).stream().map(this::toIntervencionResponse).toList();
    }

    @Override
    public IntervencionMantenimientoResponse createIntervencion(IntervencionMantenimientoRequest request) {
        Maquinaria maquinaria = getMaquinaria(request.maquinariaId());
        MantenimientoProgramado programacion = getProgramacionOrNull(request.programacionId());
        IntervencionMantenimiento intervencion = IntervencionMantenimiento.builder()
                .maquinaria(maquinaria)
                .plan(getPlanOrNull(request.planId()))
                .programacion(programacion)
                .fecha(request.fecha())
                .tipo(request.tipo())
                .tareasRealizadas(request.tareasRealizadas())
                .operario(request.operario())
                .horasMaquina(request.horasMaquina())
                .manoObraCosto(nvl(request.manoObraCosto()))
                .repuestosCosto(nvl(request.repuestosCosto()))
                .costoTotal(resolveCostoTotal(request))
                .estadoResultante(request.estadoResultante())
                .observaciones(request.observaciones())
                .build();
        IntervencionMantenimiento saved = intervencionRepository.save(intervencion);
        if (request.repuestos() != null) {
            request.repuestos().forEach(r -> repuestoRepository.save(toRepuesto(saved, r)));
        }
        if (programacion != null) {
            programacion.setEstado("COMPLETADO");
            programadoRepository.save(programacion);
        }
        if (request.estadoResultante() != null && !request.estadoResultante().isBlank()) {
            maquinaria.setEstado(request.estadoResultante());
            maquinariaRepository.save(maquinaria);
        }
        return toIntervencionResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepuestoUtilizadoResponse> listRepuestos(String intervencionId) {
        return repuestoRepository.findByIntervencionIdAndDeletedAtIsNullOrderByDescripcionAsc(intervencionId).stream().map(this::toRepuestoResponse).toList();
    }

    private Maquinaria getMaquinaria(String id) {
        return maquinariaRepository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Maquinaria no encontrada"));
    }

    private PlanMantenimiento getPlan(String id) {
        return planRepository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Plan de mantenimiento no encontrado"));
    }

    private PlanMantenimiento getPlanOrNull(String id) {
        return id == null || id.isBlank() ? null : getPlan(id);
    }

    private MantenimientoProgramado getProgramacion(String id) {
        return programadoRepository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Mantenimiento programado no encontrado"));
    }

    private MantenimientoProgramado getProgramacionOrNull(String id) {
        return id == null || id.isBlank() ? null : getProgramacion(id);
    }

    private RepuestoUtilizado toRepuesto(IntervencionMantenimiento intervencion, RepuestoUtilizadoRequest request) {
        BigDecimal total = request.costoTotal() != null ? request.costoTotal() : nvl(request.cantidad()).multiply(nvl(request.costoUnitario()));
        return RepuestoUtilizado.builder()
                .intervencion(intervencion)
                .codigo(request.codigo())
                .descripcion(request.descripcion())
                .cantidad(request.cantidad())
                .costoUnitario(request.costoUnitario())
                .costoTotal(total)
                .proveedor(request.proveedor())
                .build();
    }

    private PlanMantenimientoResponse toPlanResponse(PlanMantenimiento p) {
        return new PlanMantenimientoResponse(p.getId(), p.getMaquinaria() == null ? null : p.getMaquinaria().getId(), p.getMaquinaria() == null ? null : p.getMaquinaria().getCodigo(), p.getTipoMaquinaria(), p.getModelo(), p.getNombre(), p.getDescripcion(), p.getIntervaloHoras(), p.getIntervaloDias(), p.getPrioridad(), p.getActivo(), p.getCreatedAt(), p.getUpdatedAt());
    }

    private MantenimientoProgramadoResponse toProgramadoResponse(MantenimientoProgramado p) {
        return new MantenimientoProgramadoResponse(p.getId(), p.getMaquinaria().getId(), p.getMaquinaria().getCodigo(), p.getPlan() == null ? null : p.getPlan().getId(), p.getPlan() == null ? null : p.getPlan().getNombre(), p.getFechaProgramada(), p.getHorometroObjetivo(), p.getEstado(), p.getResponsable(), p.getObservaciones(), "PENDIENTE".equals(p.getEstado()) && p.getFechaProgramada().isBefore(LocalDate.now()), p.getCreatedAt(), p.getUpdatedAt());
    }

    private IntervencionMantenimientoResponse toIntervencionResponse(IntervencionMantenimiento i) {
        return new IntervencionMantenimientoResponse(i.getId(), i.getMaquinaria().getId(), i.getMaquinaria().getCodigo(), i.getPlan() == null ? null : i.getPlan().getId(), i.getPlan() == null ? null : i.getPlan().getNombre(), i.getProgramacion() == null ? null : i.getProgramacion().getId(), i.getFecha(), i.getTipo(), i.getTareasRealizadas(), i.getOperario(), i.getHorasMaquina(), i.getManoObraCosto(), i.getRepuestosCosto(), i.getCostoTotal(), i.getEstadoResultante(), i.getObservaciones(), listRepuestos(i.getId()), i.getCreatedAt());
    }

    private RepuestoUtilizadoResponse toRepuestoResponse(RepuestoUtilizado r) {
        return new RepuestoUtilizadoResponse(r.getId(), r.getIntervencion().getId(), r.getCodigo(), r.getDescripcion(), r.getCantidad(), r.getCostoUnitario(), r.getCostoTotal(), r.getProveedor());
    }

    private BigDecimal resolveCostoTotal(IntervencionMantenimientoRequest request) {
        return request.costoTotal() != null ? request.costoTotal() : nvl(request.manoObraCosto()).add(nvl(request.repuestosCosto()));
    }

    private BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String defaultValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
