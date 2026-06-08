package com.campoapp.ganaderia.service.impl;

import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.ganaderia.dto.*;
import com.campoapp.ganaderia.entity.*;
import com.campoapp.ganaderia.repository.*;
import com.campoapp.ganaderia.service.SanidadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SanidadServiceImpl implements SanidadService {

    private final AnimalRepository animalRepository;
    private final VacunaCatalogoRepository vacunaCatalogoRepository;
    private final AplicacionVacunaRepository aplicacionVacunaRepository;
    private final TratamientoMedicamentoRepository tratamientoMedicamentoRepository;
    private final DiagnosticoSanitarioRepository diagnosticoSanitarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VacunaCatalogoResponse> listVacunas(Boolean obligatoria) {
        List<VacunaCatalogo> vacunas = obligatoria == null
                ? vacunaCatalogoRepository.findByDeletedAtIsNullOrderByNombreAsc()
                : vacunaCatalogoRepository.findByDeletedAtIsNullAndObligatoriaOrderByNombreAsc(obligatoria);
        return vacunas.stream().map(this::toVacunaResponse).toList();
    }

    @Override
    public VacunaCatalogoResponse createVacuna(VacunaCatalogoRequest request) {
        if (vacunaCatalogoRepository.existsByCodigoAndDeletedAtIsNull(request.codigo())) {
            throw new BusinessException("Ya existe una vacuna con ese codigo");
        }

        VacunaCatalogo vacuna = VacunaCatalogo.builder()
                .codigo(request.codigo())
                .nombre(request.nombre())
                .descripcion(request.descripcion())
                .obligatoria(Boolean.TRUE.equals(request.obligatoria()))
                .especie(request.especie() == null || request.especie().isBlank() ? "BOVINA" : request.especie())
                .frecuenciaDias(request.frecuenciaDias())
                .edadMinDias(request.edadMinDias())
                .edadMaxDias(request.edadMaxDias())
                .dosisRecomendada(request.dosisRecomendada())
                .viaAplicacion(request.viaAplicacion())
                .laboratorio(request.laboratorio())
                .costoReferencia(request.costoReferencia())
                .stockDisponible(request.stockDisponible())
                .activo(request.activo() == null || request.activo())
                .build();

        return toVacunaResponse(vacunaCatalogoRepository.save(vacuna));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AplicacionVacunaResponse> listAplicaciones(String animalId, String vacunaId, LocalDate desde, LocalDate hasta) {
        return aplicacionVacunaRepository.findFiltered(blankToNull(animalId), blankToNull(vacunaId), desde, hasta)
                .stream()
                .map(this::toAplicacionResponse)
                .toList();
    }

    @Override
    public AplicacionVacunaResponse registrarAplicacion(AplicacionVacunaRequest request) {
        Animal animal = getAnimal(request.animalId());
        VacunaCatalogo vacuna = getVacuna(request.vacunaId());

        LocalDate proximaDosis = request.proximaDosisFecha();
        if (proximaDosis == null && vacuna.getFrecuenciaDias() != null) {
            proximaDosis = request.fechaAplicacion().plusDays(vacuna.getFrecuenciaDias());
        }

        AplicacionVacuna aplicacion = AplicacionVacuna.builder()
                .animal(animal)
                .vacuna(vacuna)
                .fechaAplicacion(request.fechaAplicacion())
                .proximaDosisFecha(proximaDosis)
                .operario(request.operario())
                .loteMarca(request.loteMarca())
                .costoAplicado(request.costoAplicado() != null ? request.costoAplicado() : vacuna.getCostoReferencia())
                .observaciones(request.observaciones())
                .build();

        return toAplicacionResponse(aplicacionVacunaRepository.save(aplicacion));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TratamientoMedicamentoResponse> listTratamientos(String animalId, LocalDate desde, LocalDate hasta) {
        return tratamientoMedicamentoRepository.findFiltered(blankToNull(animalId), desde, hasta)
                .stream()
                .map(this::toTratamientoResponse)
                .toList();
    }

    @Override
    public TratamientoMedicamentoResponse registrarTratamiento(TratamientoMedicamentoRequest request) {
        Animal animal = getAnimal(request.animalId());
        TratamientoMedicamento tratamiento = TratamientoMedicamento.builder()
                .animal(animal)
                .fechaInicio(request.fechaInicio())
                .fechaFin(request.fechaFin())
                .medicamento(request.medicamento())
                .dosis(request.dosis())
                .viaAplicacion(request.viaAplicacion())
                .responsable(request.responsable())
                .motivo(request.motivo())
                .costo(request.costo())
                .observaciones(request.observaciones())
                .build();
        return toTratamientoResponse(tratamientoMedicamentoRepository.save(tratamiento));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiagnosticoSanitarioResponse> listDiagnosticos(String animalId, String estado) {
        return diagnosticoSanitarioRepository.findFiltered(blankToNull(animalId), blankToNull(estado))
                .stream()
                .map(this::toDiagnosticoResponse)
                .toList();
    }

    @Override
    public DiagnosticoSanitarioResponse registrarDiagnostico(DiagnosticoSanitarioRequest request) {
        Animal animal = getAnimal(request.animalId());
        DiagnosticoSanitario diagnostico = DiagnosticoSanitario.builder()
                .animal(animal)
                .fechaDiagnostico(request.fechaDiagnostico())
                .enfermedad(request.enfermedad())
                .severidad(request.severidad() == null || request.severidad().isBlank() ? "MEDIA" : request.severidad())
                .estado(request.estado() == null || request.estado().isBlank() ? "ABIERTO" : request.estado())
                .veterinario(request.veterinario())
                .tratamientoIndicado(request.tratamientoIndicado())
                .observaciones(request.observaciones())
                .build();
        return toDiagnosticoResponse(diagnosticoSanitarioRepository.save(diagnostico));
    }

    @Override
    @Transactional(readOnly = true)
    public SanidadDashboardResponse getDashboard(LocalDate referencia) {
        LocalDate today = referencia != null ? referencia : LocalDate.now();
        YearMonth month = YearMonth.from(today);
        LocalDate monthStart = month.atDay(1);
        LocalDate monthEnd = month.atEndOfMonth();

        List<AplicacionVacuna> aplicacionesMes = aplicacionVacunaRepository.findFiltered(null, null, monthStart, monthEnd);
        BigDecimal costoMes = aplicacionesMes.stream()
                .map(AplicacionVacuna::getCostoAplicado)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(
                        tratamientoMedicamentoRepository.findFiltered(null, monthStart, monthEnd).stream()
                                .map(TratamientoMedicamento::getCosto)
                                .filter(java.util.Objects::nonNull)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                );

        List<AplicacionVacuna> aplicacionesConAlerta = aplicacionVacunaRepository.findUpcomingAlerts(today.plusDays(15));
        List<SanidadDashboardResponse.AlertaVacunaResponse> alertas = aplicacionesConAlerta
                .stream()
                .limit(10)
                .map(item -> new SanidadDashboardResponse.AlertaVacunaResponse(
                        item.getId(),
                        item.getAnimal().getId(),
                        item.getAnimal().getCaravana(),
                        item.getVacuna().getNombre(),
                        item.getProximaDosisFecha(),
                        ChronoUnit.DAYS.between(today, item.getProximaDosisFecha()),
                        item.getProximaDosisFecha().isBefore(today) ? "VENCIDA" : "PROXIMA"
                ))
                .toList();
        List<SanidadDashboardResponse.ResumenAlertaVacunaResponse> alertasPorVacuna = buildResumenAlertasPorVacuna(aplicacionesConAlerta, today);

        List<DiagnosticoSanitarioResponse> diagnosticosRecientes = diagnosticoSanitarioRepository.findFiltered(null, null)
                .stream()
                .limit(8)
                .map(this::toDiagnosticoResponse)
                .toList();

        List<TratamientoMedicamentoResponse> tratamientosRecientes = tratamientoMedicamentoRepository.findFiltered(null, null, null)
                .stream()
                .limit(8)
                .map(this::toTratamientoResponse)
                .toList();

        return new SanidadDashboardResponse(
                vacunaCatalogoRepository.findByDeletedAtIsNullOrderByNombreAsc().size(),
                aplicacionesMes.size(),
                diagnosticoSanitarioRepository.countAbiertos(),
                tratamientoMedicamentoRepository.countActivos(today),
                costoMes,
                alertas,
                alertasPorVacuna,
                diagnosticosRecientes,
                tratamientosRecientes
        );
    }

    private List<SanidadDashboardResponse.ResumenAlertaVacunaResponse> buildResumenAlertasPorVacuna(List<AplicacionVacuna> aplicaciones, LocalDate today) {
        Map<String, List<AplicacionVacuna>> porVacuna = aplicaciones.stream()
                .filter(item -> item.getVacuna() != null && item.getProximaDosisFecha() != null)
                .collect(Collectors.groupingBy(item -> item.getVacuna().getId()));

        return porVacuna.values().stream()
                .map(items -> {
                    AplicacionVacuna sample = items.get(0);
                    long vencidas = items.stream().filter(item -> item.getProximaDosisFecha().isBefore(today)).count();
                    long proximas = items.size() - vencidas;
                    LocalDate fechaMasVencida = items.stream()
                            .map(AplicacionVacuna::getProximaDosisFecha)
                            .filter(date -> date.isBefore(today))
                            .min(LocalDate::compareTo)
                            .orElse(null);
                    LocalDate proximaFecha = items.stream()
                            .map(AplicacionVacuna::getProximaDosisFecha)
                            .filter(date -> !date.isBefore(today))
                            .min(LocalDate::compareTo)
                            .orElseGet(() -> items.stream()
                                    .map(AplicacionVacuna::getProximaDosisFecha)
                                    .filter(Objects::nonNull)
                                    .min(LocalDate::compareTo)
                                    .orElse(null));
                    long animalesAfectados = items.stream()
                            .map(item -> item.getAnimal() != null ? item.getAnimal().getId() : null)
                            .filter(Objects::nonNull)
                            .distinct()
                            .count();
                    return new SanidadDashboardResponse.ResumenAlertaVacunaResponse(
                            sample.getVacuna().getId(),
                            sample.getVacuna().getNombre(),
                            sample.getVacuna().getCodigo(),
                            sample.getVacuna().getObligatoria(),
                            animalesAfectados,
                            vencidas,
                            proximas,
                            fechaMasVencida,
                            proximaFecha,
                            proximaFecha != null ? ChronoUnit.DAYS.between(today, proximaFecha) : 0
                    );
                })
                .sorted(Comparator
                        .comparingLong(SanidadDashboardResponse.ResumenAlertaVacunaResponse::vencidas).reversed()
                        .thenComparing(Comparator.comparingLong(SanidadDashboardResponse.ResumenAlertaVacunaResponse::proximasAVencer).reversed())
                        .thenComparing(SanidadDashboardResponse.ResumenAlertaVacunaResponse::vacunaNombre))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public String exportarReporteSanitario(LocalDate desde, LocalDate hasta) {
        LocalDate safeDesde = desde != null ? desde : LocalDate.now().minusMonths(6);
        LocalDate safeHasta = hasta != null ? hasta : LocalDate.now();
        List<AplicacionVacunaResponse> aplicaciones = listAplicaciones(null, null, safeDesde, safeHasta);
        List<TratamientoMedicamentoResponse> tratamientos = listTratamientos(null, safeDesde, safeHasta);
        List<DiagnosticoSanitarioResponse> diagnosticos = listDiagnosticos(null, null);

        StringBuilder csv = new StringBuilder("tipo,animal,detalle,fecha,estado,responsable,costo\n");
        aplicaciones.forEach(item -> csv.append(String.join(",",
                "VACUNA",
                safe(item.animalCaravana()),
                safe(item.vacunaNombre()),
                safe(item.fechaAplicacion()),
                safe(item.proximaDosisFecha()),
                safe(item.operario()),
                safe(item.costoAplicado())
        )).append('\n'));
        tratamientos.forEach(item -> csv.append(String.join(",",
                "TRATAMIENTO",
                safe(item.animalCaravana()),
                safe(item.medicamento()),
                safe(item.fechaInicio()),
                safe(item.fechaFin()),
                safe(item.responsable()),
                safe(item.costo())
        )).append('\n'));
        diagnosticos.stream()
                .filter(item -> item.fechaDiagnostico() == null || (!item.fechaDiagnostico().isBefore(safeDesde) && !item.fechaDiagnostico().isAfter(safeHasta)))
                .forEach(item -> csv.append(String.join(",",
                        "DIAGNOSTICO",
                        safe(item.animalCaravana()),
                        safe(item.enfermedad()),
                        safe(item.fechaDiagnostico()),
                        safe(item.estado()),
                        safe(item.veterinario()),
                        ""
                )).append('\n'));
        return csv.toString();
    }

    private Animal getAnimal(String animalId) {
        return animalRepository.findActiveById(animalId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal no encontrado"));
    }

    private VacunaCatalogo getVacuna(String vacunaId) {
        return vacunaCatalogoRepository.findByIdAndDeletedAtIsNull(vacunaId)
                .orElseThrow(() -> new ResourceNotFoundException("Vacuna no encontrada"));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private VacunaCatalogoResponse toVacunaResponse(VacunaCatalogo vacuna) {
        return new VacunaCatalogoResponse(
                vacuna.getId(),
                vacuna.getCodigo(),
                vacuna.getNombre(),
                vacuna.getDescripcion(),
                vacuna.getObligatoria(),
                vacuna.getEspecie(),
                vacuna.getFrecuenciaDias(),
                vacuna.getEdadMinDias(),
                vacuna.getEdadMaxDias(),
                vacuna.getDosisRecomendada(),
                vacuna.getViaAplicacion(),
                vacuna.getLaboratorio(),
                vacuna.getCostoReferencia(),
                vacuna.getStockDisponible(),
                vacuna.getActivo(),
                vacuna.getUpdatedAt()
        );
    }

    private AplicacionVacunaResponse toAplicacionResponse(AplicacionVacuna aplicacion) {
        return new AplicacionVacunaResponse(
                aplicacion.getId(),
                aplicacion.getAnimal().getId(),
                aplicacion.getAnimal().getCaravana(),
                aplicacion.getVacuna().getId(),
                aplicacion.getVacuna().getNombre(),
                aplicacion.getVacuna().getObligatoria(),
                aplicacion.getFechaAplicacion(),
                aplicacion.getProximaDosisFecha(),
                aplicacion.getOperario(),
                aplicacion.getLoteMarca(),
                aplicacion.getCostoAplicado(),
                aplicacion.getObservaciones(),
                aplicacion.getCreatedAt()
        );
    }

    private TratamientoMedicamentoResponse toTratamientoResponse(TratamientoMedicamento tratamiento) {
        return new TratamientoMedicamentoResponse(
                tratamiento.getId(),
                tratamiento.getAnimal().getId(),
                tratamiento.getAnimal().getCaravana(),
                tratamiento.getFechaInicio(),
                tratamiento.getFechaFin(),
                tratamiento.getMedicamento(),
                tratamiento.getDosis(),
                tratamiento.getViaAplicacion(),
                tratamiento.getResponsable(),
                tratamiento.getMotivo(),
                tratamiento.getCosto(),
                tratamiento.getObservaciones(),
                tratamiento.getCreatedAt()
        );
    }

    private DiagnosticoSanitarioResponse toDiagnosticoResponse(DiagnosticoSanitario diagnostico) {
        return new DiagnosticoSanitarioResponse(
                diagnostico.getId(),
                diagnostico.getAnimal().getId(),
                diagnostico.getAnimal().getCaravana(),
                diagnostico.getFechaDiagnostico(),
                diagnostico.getEnfermedad(),
                diagnostico.getSeveridad(),
                diagnostico.getEstado(),
                diagnostico.getVeterinario(),
                diagnostico.getTratamientoIndicado(),
                diagnostico.getObservaciones(),
                diagnostico.getCreatedAt()
        );
    }

    private String safe(Object value) {
        return value == null ? "" : String.valueOf(value).replace(",", " ");
    }
}
