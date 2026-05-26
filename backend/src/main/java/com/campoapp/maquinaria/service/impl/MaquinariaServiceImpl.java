package com.campoapp.maquinaria.service.impl;

import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.maquinaria.dto.*;
import com.campoapp.maquinaria.entity.*;
import com.campoapp.maquinaria.repository.*;
import com.campoapp.maquinaria.service.MaquinariaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class MaquinariaServiceImpl implements MaquinariaService {
    private final MaquinariaRepository maquinariaRepository;
    private final AsignacionMaquinariaRepository asignacionRepository;
    private final UsoMaquinariaRepository usoRepository;
    private final DocumentoMaquinariaRepository documentoRepository;
    private final HistorialEstadoMaquinariaRepository historialRepository;

    @Override
    @Transactional(readOnly = true)
    public MaquinariaResumenResponse getResumen(String tipo, String estado, String ubicacion) {
        List<MaquinariaResponse> maquinas = list(tipo, estado, ubicacion);
        return new MaquinariaResumenResponse(
                getDashboard(),
                maquinas,
                maquinas.stream().flatMap(m -> asignaciones(m.id()).stream()).filter(a -> a.fechaFin() == null).toList(),
                usoRepository.findByDeletedAtIsNullOrderByFechaDesc().stream().limit(12).map(this::toUsoResponse).toList(),
                maquinas.stream().flatMap(m -> documentos(m.id()).stream()).toList()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public MaquinariaDashboardResponse getDashboard() {
        List<Maquinaria> maquinas = maquinariaRepository.findFiltered(null, null, null);
        YearMonth current = YearMonth.now();
        List<UsoMaquinaria> usosMes = usoRepository.findByDeletedAtIsNullOrderByFechaDesc().stream()
                .filter(u -> YearMonth.from(u.getFecha()).equals(current)).toList();
        BigDecimal horas = usosMes.stream().map(UsoMaquinaria::getHorasTrabajadas).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal km = usosMes.stream().map(UsoMaquinaria::getKilometrosRecorridos).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        long vencidos = documentoRepository.countByVencimientoBeforeAndDeletedAtIsNull(LocalDate.now());
        List<String> alertas = maquinas.stream()
                .filter(m -> isRepairState(m.getEstado()) || "INACTIVA".equals(m.getEstado()))
                .map(m -> m.getCodigo() + " requiere seguimiento operativo")
                .limit(5)
                .toList();
        return new MaquinariaDashboardResponse(
                maquinas.size(),
                (int) maquinas.stream().filter(m -> "DISPONIBLE".equals(m.getEstado())).count(),
                (int) maquinas.stream().filter(m -> isRepairState(m.getEstado())).count(),
                (int) asignacionRepository.countByFechaFinIsNullAndDeletedAtIsNull(),
                vencidos,
                horas,
                km,
                alertas
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaquinariaResponse> list(String tipo, String estado, String ubicacion) {
        return maquinariaRepository.findFiltered(blankToNull(tipo), blankToNull(estado), blankToNull(ubicacion)).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MaquinariaResponse getById(String id) {
        return toResponse(getMaquinaria(id));
    }

    @Override
    public MaquinariaResponse create(MaquinariaRequest request) {
        Maquinaria maquinaria = Maquinaria.builder()
                .codigo(request.codigo())
                .tipo(request.tipo())
                .marca(request.marca())
                .modelo(request.modelo())
                .numeroSerie(request.numeroSerie())
                .anio(request.anio())
                .estado(defaultEstado(request.estado()))
                .ubicacionActual(request.ubicacionActual())
                .potenciaHp(request.potenciaHp())
                .capacidad(request.capacidad())
                .accesorios(request.accesorios())
                .horometro(request.horometro())
                .kilometraje(request.kilometraje())
                .costoAdquisicion(request.costoAdquisicion())
                .fechaAlta(request.fechaAlta())
                .observaciones(request.observaciones())
                .build();
        Maquinaria saved = maquinariaRepository.save(maquinaria);
        saveEstado(saved, null, saved.getEstado(), "Sistema", "Alta de maquinaria");
        return toResponse(saved);
    }

    @Override
    public MaquinariaResponse update(String id, MaquinariaRequest request) {
        Maquinaria maquinaria = getMaquinaria(id);
        String previous = maquinaria.getEstado();
        maquinaria.setCodigo(request.codigo());
        maquinaria.setTipo(request.tipo());
        maquinaria.setMarca(request.marca());
        maquinaria.setModelo(request.modelo());
        maquinaria.setNumeroSerie(request.numeroSerie());
        maquinaria.setAnio(request.anio());
        maquinaria.setEstado(defaultEstado(request.estado()));
        maquinaria.setUbicacionActual(request.ubicacionActual());
        maquinaria.setPotenciaHp(request.potenciaHp());
        maquinaria.setCapacidad(request.capacidad());
        maquinaria.setAccesorios(request.accesorios());
        maquinaria.setHorometro(request.horometro());
        maquinaria.setKilometraje(request.kilometraje());
        maquinaria.setCostoAdquisicion(request.costoAdquisicion());
        maquinaria.setFechaAlta(request.fechaAlta());
        maquinaria.setObservaciones(request.observaciones());
        if (!Objects.equals(previous, maquinaria.getEstado())) {
            saveEstado(maquinaria, previous, maquinaria.getEstado(), "Sistema", "Actualizacion de estado");
        }
        return toResponse(maquinariaRepository.save(maquinaria));
    }

    @Override
    public void delete(String id) {
        Maquinaria maquinaria = getMaquinaria(id);
        maquinaria.softDelete();
        maquinariaRepository.save(maquinaria);
    }

    @Override
    public MaquinariaResponse updateEstado(String id, EstadoMaquinariaRequest request) {
        Maquinaria maquinaria = getMaquinaria(id);
        String previous = maquinaria.getEstado();
        maquinaria.setEstado(request.estado());
        saveEstado(maquinaria, previous, request.estado(), request.responsable(), request.motivo());
        return toResponse(maquinariaRepository.save(maquinaria));
    }

    @Override
    public AsignacionMaquinariaResponse asignar(AsignacionMaquinariaRequest request) {
        Maquinaria maquinaria = getMaquinaria(request.maquinariaId());
        AsignacionMaquinaria asignacion = AsignacionMaquinaria.builder()
                .maquinaria(maquinaria)
                .operario(request.operario())
                .fechaInicio(request.fechaInicio())
                .fechaFin(request.fechaFin())
                .actividad(request.actividad())
                .ubicacion(request.ubicacion())
                .observaciones(request.observaciones())
                .build();
        if (request.ubicacion() != null && !request.ubicacion().isBlank()) {
            maquinaria.setUbicacionActual(request.ubicacion());
        }
        if (request.fechaFin() == null) {
            maquinaria.setEstado("ASIGNADA");
        }
        return toAsignacionResponse(asignacionRepository.save(asignacion));
    }

    @Override
    public UsoMaquinariaResponse registrarUso(UsoMaquinariaRequest request) {
        Maquinaria maquinaria = getMaquinaria(request.maquinariaId());
        UsoMaquinaria uso = UsoMaquinaria.builder()
                .maquinaria(maquinaria)
                .fecha(request.fecha())
                .actividad(request.actividad())
                .lote(request.lote())
                .operario(request.operario())
                .horasTrabajadas(request.horasTrabajadas())
                .kilometrosRecorridos(request.kilometrosRecorridos())
                .combustibleLitros(request.combustibleLitros())
                .observaciones(request.observaciones())
                .build();
        maquinaria.setHorometro(sum(maquinaria.getHorometro(), request.horasTrabajadas()));
        maquinaria.setKilometraje(sum(maquinaria.getKilometraje(), request.kilometrosRecorridos()));
        return toUsoResponse(usoRepository.save(uso));
    }

    @Override
    public DocumentoMaquinariaResponse registrarDocumento(DocumentoMaquinariaRequest request) {
        DocumentoMaquinaria documento = DocumentoMaquinaria.builder()
                .maquinaria(getMaquinaria(request.maquinariaId()))
                .tipoDocumento(request.tipoDocumento())
                .numero(request.numero())
                .vencimiento(request.vencimiento())
                .url(request.url())
                .observaciones(request.observaciones())
                .build();
        return toDocumentoResponse(documentoRepository.save(documento));
    }

    @Override @Transactional(readOnly = true)
    public List<AsignacionMaquinariaResponse> asignaciones(String maquinariaId) {
        return asignacionRepository.findByMaquinariaIdAndDeletedAtIsNullOrderByFechaInicioDesc(maquinariaId).stream().map(this::toAsignacionResponse).toList();
    }

    @Override @Transactional(readOnly = true)
    public List<UsoMaquinariaResponse> usos(String maquinariaId) {
        return usoRepository.findByMaquinariaIdAndDeletedAtIsNullOrderByFechaDesc(maquinariaId).stream().map(this::toUsoResponse).toList();
    }

    @Override @Transactional(readOnly = true)
    public List<DocumentoMaquinariaResponse> documentos(String maquinariaId) {
        return documentoRepository.findByMaquinariaIdAndDeletedAtIsNullOrderByVencimientoAsc(maquinariaId).stream().map(this::toDocumentoResponse).toList();
    }

    @Override @Transactional(readOnly = true)
    public List<HistorialEstadoMaquinariaResponse> historialEstados(String maquinariaId) {
        return historialRepository.findByMaquinariaIdAndDeletedAtIsNullOrderByFechaDesc(maquinariaId).stream().map(this::toHistorialResponse).toList();
    }

    private Maquinaria getMaquinaria(String id) {
        return maquinariaRepository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Maquinaria no encontrada"));
    }

    private void saveEstado(Maquinaria maquinaria, String anterior, String nuevo, String responsable, String motivo) {
        historialRepository.save(HistorialEstadoMaquinaria.builder()
                .maquinaria(maquinaria)
                .estadoAnterior(anterior)
                .estadoNuevo(nuevo)
                .fecha(LocalDateTime.now())
                .responsable(responsable)
                .motivo(motivo)
                .build());
    }

    private MaquinariaResponse toResponse(Maquinaria m) {
        return new MaquinariaResponse(m.getId(), m.getCodigo(), m.getTipo(), m.getMarca(), m.getModelo(), m.getNumeroSerie(), m.getAnio(), m.getEstado(), m.getUbicacionActual(), m.getPotenciaHp(), m.getCapacidad(), m.getAccesorios(), m.getHorometro(), m.getKilometraje(), m.getCostoAdquisicion(), m.getFechaAlta(), m.getObservaciones(), m.getCreatedAt(), m.getUpdatedAt());
    }

    private AsignacionMaquinariaResponse toAsignacionResponse(AsignacionMaquinaria a) {
        return new AsignacionMaquinariaResponse(a.getId(), a.getMaquinaria().getId(), a.getMaquinaria().getCodigo(), a.getOperario(), a.getFechaInicio(), a.getFechaFin(), a.getActividad(), a.getUbicacion(), a.getObservaciones());
    }

    private UsoMaquinariaResponse toUsoResponse(UsoMaquinaria u) {
        return new UsoMaquinariaResponse(u.getId(), u.getMaquinaria().getId(), u.getMaquinaria().getCodigo(), u.getFecha(), u.getActividad(), u.getLote(), u.getOperario(), u.getHorasTrabajadas(), u.getKilometrosRecorridos(), u.getCombustibleLitros(), u.getObservaciones());
    }

    private DocumentoMaquinariaResponse toDocumentoResponse(DocumentoMaquinaria d) {
        return new DocumentoMaquinariaResponse(d.getId(), d.getMaquinaria().getId(), d.getMaquinaria().getCodigo(), d.getTipoDocumento(), d.getNumero(), d.getVencimiento(), d.getUrl(), d.getObservaciones());
    }

    private HistorialEstadoMaquinariaResponse toHistorialResponse(HistorialEstadoMaquinaria h) {
        return new HistorialEstadoMaquinariaResponse(h.getId(), h.getMaquinaria().getId(), h.getMaquinaria().getCodigo(), h.getEstadoAnterior(), h.getEstadoNuevo(), h.getFecha(), h.getResponsable(), h.getMotivo());
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private String defaultEstado(String value) {
        return value == null || value.isBlank() ? "DISPONIBLE" : value;
    }

    private boolean isRepairState(String estado) {
        return "REPARACION".equals(estado) || "EN_REPARACION".equals(estado) || "MANTENIMIENTO".equals(estado);
    }

    private BigDecimal sum(BigDecimal current, BigDecimal increment) {
        return (current == null ? BigDecimal.ZERO : current).add(increment == null ? BigDecimal.ZERO : increment);
    }
}
