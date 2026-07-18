package com.campoapp.ganaderia.service.impl;

import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.ganaderia.dto.*;
import com.campoapp.ganaderia.entity.*;
import com.campoapp.ganaderia.repository.*;
import com.campoapp.ganaderia.service.AlimentacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class AlimentacionServiceImpl implements AlimentacionService {
    private final AnimalRepository animalRepository;
    private final DietaNutricionalRepository dietaRepository;
    private final DietaIngredienteRepository ingredienteRepository;
    private final RegistroAlimentacionRepository registroRepository;
    private final PesajeAnimalRepository pesajeRepository;
    private final PotreroRepository potreroRepository;
    private final OperarioNombreResolver operarioNombreResolver;

    @Override
    @Transactional(readOnly = true)
    public AlimentacionResumenResponse getResumen(LocalDate desde, LocalDate hasta) {
        return new AlimentacionResumenResponse(
                getDashboard(hasta),
                listDietas(),
                listRegistros(null, desde, hasta),
                listPesajes(null, desde, hasta)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AlimentacionDashboardResponse getDashboard(LocalDate referencia) {
        LocalDate today = referencia != null ? referencia : LocalDate.now();
        YearMonth month = YearMonth.from(today);
        List<RegistroAlimentacion> registrosMes = registroRepository.findFiltered(null, month.atDay(1), month.atEndOfMonth());
        List<PesajeAnimal> pesajes = pesajeRepository.findFiltered(null, today.minusDays(90), today);

        BigDecimal kgMes = registrosMes.stream().map(RegistroAlimentacion::getCantidadKg).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal costoMes = registrosMes.stream().map(RegistroAlimentacion::getCostoTotal).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal gananciaPromedio = calculateAverageGain(pesajes);
        BigDecimal conversion = gananciaPromedio.compareTo(BigDecimal.ZERO) > 0
                ? kgMes.divide(gananciaPromedio, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new AlimentacionDashboardResponse(
                (int) dietaRepository.findByDeletedAtIsNullOrderByUpdatedAtDesc().stream().filter(DietaNutricional::getActiva).count(),
                kgMes,
                costoMes,
                gananciaPromedio,
                conversion,
                buildAlerts(pesajes)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<DietaResponse> listDietas() {
        return dietaRepository.findByDeletedAtIsNullOrderByUpdatedAtDesc().stream().map(this::toDietaResponse).toList();
    }

    @Override
    public DietaResponse createDieta(DietaRequest request) {
        DietaNutricional dieta = DietaNutricional.builder()
                .nombre(request.nombre())
                .tipoAnimal(request.tipoAnimal())
                .objetivo(request.objetivo())
                .materiaSecaKg(request.materiaSecaKg())
                .costoDiario(request.costoDiario())
                .activa(request.activa() == null || request.activa())
                .observaciones(request.observaciones())
                .build();
        DietaNutricional saved = dietaRepository.save(dieta);
        if (request.ingredientes() != null) {
            request.ingredientes().forEach(item -> ingredienteRepository.save(DietaIngrediente.builder()
                    .dieta(saved)
                    .ingrediente(item.ingrediente())
                    .proporcionPct(item.proporcionPct())
                    .costoKg(item.costoKg())
                    .materiaSecaPct(item.materiaSecaPct())
                    .build()));
        }
        return toDietaResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistroAlimentacionResponse> listRegistros(String animalId, LocalDate desde, LocalDate hasta) {
        return toRegistroResponses(registroRepository.findFiltered(blankToNull(animalId), desde, hasta));
    }

    @Override
    public RegistroAlimentacionResponse registrarAlimentacion(RegistroAlimentacionRequest request) {
        Animal animal = request.animalId() == null || request.animalId().isBlank() ? null : getAnimal(request.animalId());
        DietaNutricional dieta = request.dietaId() == null || request.dietaId().isBlank() ? null : getDieta(request.dietaId());
        Potrero potrero = resolvePotrero(request.potreroId(), request.potrero());
        RegistroAlimentacion registro = RegistroAlimentacion.builder()
                .animal(animal)
                .dieta(dieta)
                .fecha(request.fecha())
                .alimento(request.alimento())
                .cantidadKg(request.cantidadKg())
                .costoTotal(request.costoTotal())
                .potreroRef(potrero)
                .potrero(potrero != null ? potrero.getNombre() : request.potrero())
                .responsable(request.responsable())
                .observaciones(request.observaciones())
                .build();
        return toRegistroResponses(List.of(registroRepository.save(registro))).get(0);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PesajeResponse> listPesajes(String animalId, LocalDate desde, LocalDate hasta) {
        return toPesajeResponses(pesajeRepository.findFiltered(blankToNull(animalId), desde, hasta));
    }

    @Override
    public PesajeResponse registrarPesaje(PesajeRequest request) {
        Animal animal = getAnimal(request.animalId());
        PesajeAnimal pesaje = PesajeAnimal.builder()
                .animal(animal)
                .fecha(request.fecha())
                .pesoKg(request.pesoKg())
                .condicionCorporal(request.condicionCorporal())
                .metodo(request.metodo())
                .responsable(request.responsable())
                .observaciones(request.observaciones())
                .build();
        animal.setPesoActualKg(request.pesoKg());
        return toPesajeResponses(List.of(pesajeRepository.save(pesaje))).get(0);
    }

    private BigDecimal calculateAverageGain(List<PesajeAnimal> pesajes) {
        return pesajes.stream()
                .collect(java.util.stream.Collectors.groupingBy(p -> p.getAnimal().getId()))
                .values()
                .stream()
                .map(this::calculateGain)
                .filter(value -> value.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(Math.max(1, pesajes.stream().map(p -> p.getAnimal().getId()).distinct().count())), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateGain(List<PesajeAnimal> animalPesajes) {
        List<PesajeAnimal> sorted = animalPesajes.stream().sorted(Comparator.comparing(PesajeAnimal::getFecha)).toList();
        if (sorted.size() < 2) return BigDecimal.ZERO;
        PesajeAnimal first = sorted.get(0);
        PesajeAnimal last = sorted.get(sorted.size() - 1);
        long days = Math.max(1, ChronoUnit.DAYS.between(first.getFecha(), last.getFecha()));
        return last.getPesoKg().subtract(first.getPesoKg()).divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP);
    }

    private List<AlimentacionDashboardResponse.AlertaNutricionalResponse> buildAlerts(List<PesajeAnimal> pesajes) {
        return pesajes.stream()
                .collect(java.util.stream.Collectors.groupingBy(p -> p.getAnimal().getId()))
                .values()
                .stream()
                .map(list -> list.stream().max(Comparator.comparing(PesajeAnimal::getFecha)).orElse(null))
                .filter(Objects::nonNull)
                .filter(p -> p.getCondicionCorporal() != null && (p.getCondicionCorporal().compareTo(BigDecimal.valueOf(2.5)) < 0 || p.getCondicionCorporal().compareTo(BigDecimal.valueOf(4.5)) > 0))
                .map(p -> new AlimentacionDashboardResponse.AlertaNutricionalResponse(
                        p.getAnimal().getId(),
                        p.getAnimal().getCaravana(),
                        "CONDICION_CORPORAL",
                        p.getCondicionCorporal().compareTo(BigDecimal.valueOf(2.5)) < 0 ? "ALTA" : "MEDIA",
                        "BCS fuera del rango operativo: " + p.getCondicionCorporal()
                ))
                .limit(8)
                .toList();
    }

    private DietaResponse toDietaResponse(DietaNutricional dieta) {
        return new DietaResponse(
                dieta.getId(), dieta.getNombre(), dieta.getTipoAnimal(), dieta.getObjetivo(), dieta.getMateriaSecaKg(),
                dieta.getCostoDiario(), dieta.getActiva(), dieta.getObservaciones(),
                ingredienteRepository.findByDietaIdAndDeletedAtIsNullOrderByIngredienteAsc(dieta.getId()).stream().map(this::toIngredienteResponse).toList(),
                dieta.getUpdatedAt()
        );
    }

    private DietaIngredienteResponse toIngredienteResponse(DietaIngrediente item) {
        return new DietaIngredienteResponse(item.getId(), item.getIngrediente(), item.getProporcionPct(), item.getCostoKg(), item.getMateriaSecaPct());
    }

    // Mapea la lista completa resolviendo los responsables en un solo lookup batch (sin N+1).
    private List<RegistroAlimentacionResponse> toRegistroResponses(List<RegistroAlimentacion> registros) {
        Map<String, String> nombres = operarioNombreResolver.resolverNombres(
                registros.stream().map(RegistroAlimentacion::getResponsable).toList());
        return registros.stream().map(item -> toRegistroResponse(item, nombres)).toList();
    }

    private RegistroAlimentacionResponse toRegistroResponse(RegistroAlimentacion registro, Map<String, String> operarioNombres) {
        Potrero potrero = registro.getPotreroRef();
        return new RegistroAlimentacionResponse(
                registro.getId(),
                registro.getAnimal() != null ? registro.getAnimal().getId() : null,
                registro.getAnimal() != null ? registro.getAnimal().getCaravana() : null,
                registro.getDieta() != null ? registro.getDieta().getId() : null,
                registro.getDieta() != null ? registro.getDieta().getNombre() : null,
                registro.getFecha(), registro.getAlimento(), registro.getCantidadKg(), registro.getCostoTotal(),
                potrero != null ? potrero.getId() : null,
                // potreroNombre resuelve la referencia; fallback al texto libre legacy si no hay potrero asociado.
                potrero != null ? potrero.getNombre() : registro.getPotrero(),
                potrero != null ? potrero.getNombre() : registro.getPotrero(),
                registro.getResponsable(),
                operarioNombreResolver.resolver(registro.getResponsable(), operarioNombres),
                registro.getObservaciones(), registro.getCreatedAt()
        );
    }

    private List<PesajeResponse> toPesajeResponses(List<PesajeAnimal> pesajes) {
        Map<String, String> nombres = operarioNombreResolver.resolverNombres(
                pesajes.stream().map(PesajeAnimal::getResponsable).toList());
        return pesajes.stream().map(item -> toPesajeResponse(item, nombres)).toList();
    }

    private PesajeResponse toPesajeResponse(PesajeAnimal pesaje, Map<String, String> operarioNombres) {
        return new PesajeResponse(pesaje.getId(), pesaje.getAnimal().getId(), pesaje.getAnimal().getCaravana(), pesaje.getFecha(), pesaje.getPesoKg(), pesaje.getCondicionCorporal(), pesaje.getMetodo(), pesaje.getResponsable(), operarioNombreResolver.resolver(pesaje.getResponsable(), operarioNombres), pesaje.getObservaciones(), pesaje.getCreatedAt());
    }

    private Animal getAnimal(String id) {
        return animalRepository.findActiveById(id).orElseThrow(() -> new ResourceNotFoundException("Animal no encontrado"));
    }

    private DietaNutricional getDieta(String id) {
        return dietaRepository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException("Dieta no encontrada"));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private Potrero resolvePotrero(String potreroId, String legacyName) {
        if (potreroId != null && !potreroId.isBlank()) {
            return potreroRepository.findActiveById(potreroId)
                    .orElseThrow(() -> new ResourceNotFoundException("Potrero no encontrado"));
        }
        if (legacyName == null || legacyName.isBlank()) {
            return null;
        }
        return findPotreroByLegacyName(legacyName).orElse(null);
    }

    private Optional<Potrero> findPotreroByLegacyName(String value) {
        String normalized = normalizeLocation(value);
        return potreroRepository.findAllActive().stream()
                .filter(p -> normalizeLocation(p.getNombre()).equals(normalized)
                        || ("potrero " + normalizeLocation(p.getNombre())).equals(normalized))
                .findFirst();
    }

    private String normalizeLocation(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }
}
