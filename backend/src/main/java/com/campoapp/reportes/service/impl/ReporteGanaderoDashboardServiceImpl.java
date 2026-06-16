package com.campoapp.reportes.service.impl;

import com.campoapp.ganaderia.entity.*;
import com.campoapp.ganaderia.repository.*;
import com.campoapp.reportes.dto.ReporteGanaderoDashboardResponse;
import com.campoapp.reportes.service.ReporteGanaderoDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteGanaderoDashboardServiceImpl implements ReporteGanaderoDashboardService {
    private static final String[] RODEO_ORDER = {"Vacas", "Toros", "Vaquillonas", "Terneros", "Novillos", "Otros"};
    private static final Map<String, String> RODEO_COLORS = Map.of(
            "Vacas", "#9FE870",
            "Toros", "#6EA8FF",
            "Vaquillonas", "#9A7DFF",
            "Terneros", "#FFB84D",
            "Novillos", "#4CD8C4",
            "Otros", "#A6B0CF"
    );
    private static final Map<String, String> SEVERIDAD_COLORS = Map.of(
            "BAJA", "#9FE870",
            "MEDIA", "#FFB84D",
            "ALTA", "#FF8A4D",
            "CRITICA", "#FF6B6B"
    );

    private final AnimalRepository animalRepository;
    private final AnimalPotreroRepository animalPotreroRepository;
    private final PotreroRepository potreroRepository;
    private final PesajeAnimalRepository pesajeRepository;
    private final RegistroAlimentacionRepository registroAlimentacionRepository;
    private final DietaNutricionalRepository dietaRepository;
    private final AplicacionVacunaRepository aplicacionVacunaRepository;
    private final DiagnosticoSanitarioRepository diagnosticoRepository;
    private final TratamientoMedicamentoRepository tratamientoRepository;
    private final ControlPrenezRepository controlPrenezRepository;
    private final PartoRepository partoRepository;

    @Override
    @Transactional(readOnly = true)
    public ReporteGanaderoDashboardResponse dashboard() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate previousMonthStart = monthStart.minusMonths(1);
        LocalDate previousMonthEnd = monthStart.minusDays(1);

        List<Animal> activeAnimals = animalRepository.findFiltered(null, null, null, "ACTIVO");
        List<Potrero> activePotreros = potreroRepository.findAllActive().stream()
                .filter(p -> !"INACTIVO".equalsIgnoreCase(nullSafe(p.getEstado())))
                .toList();
        List<AnimalPotrero> activeAssignments = activeAnimalPotreroAssignments(activeAnimals);
        Map<String, Long> animalCountByPotrero = animalCountByPotrero(activeAssignments);
        List<PesajeAnimal> recentWeights = pesajeRepository.findFiltered(null, today.minusDays(90), today);
        List<RegistroAlimentacion> feedRecords = registroAlimentacionRepository.findFiltered(null, today.minusMonths(5).withDayOfMonth(1), today);
        List<DietaNutricional> diets = dietaRepository.findByDeletedAtIsNullOrderByUpdatedAtDesc();
        List<AplicacionVacuna> vaccineAlerts = aplicacionVacunaRepository.findUpcomingAlerts(today.plusDays(30));
        List<AplicacionVacuna> allVaccineApplications = aplicacionVacunaRepository.findFiltered(null, null, null, null);
        List<DiagnosticoSanitario> diagnostics = diagnosticoRepository.findFiltered(null, null);
        List<TratamientoMedicamento> treatments = tratamientoRepository.findFiltered(null, null, null);
        List<ControlPrenez> pregnancyControls = controlPrenezRepository.findFiltered(null);
        List<Parto> births = partoRepository.findFiltered(today.minusMonths(12), today.plusMonths(6));

        BigDecimal averageWeight = average(activeAnimals.stream().map(Animal::getPesoActualKg).filter(Objects::nonNull).toList());
        BigDecimal dailyGain = averageDailyGain(recentWeights);
        long activePregnancies = pregnancyControls.stream().filter(c -> equalsIgnoreCase(c.getEstado(), "PRENADA")).count();
        long upcomingBirths = pregnancyControls.stream()
                .filter(c -> c.getFechaEstimadaParto() != null)
                .filter(c -> !c.getFechaEstimadaParto().isBefore(today) && !c.getFechaEstimadaParto().isAfter(today.plusDays(30)))
                .count();
        long upcomingVaccines = vaccineAlerts.stream()
                .filter(a -> a.getProximaDosisFecha() != null && !a.getProximaDosisFecha().isBefore(today))
                .count();
        long healthAlerts = diagnostics.stream()
                .filter(d -> equalsIgnoreCase(d.getEstado(), "ABIERTO"))
                .filter(d -> equalsIgnoreCase(d.getSeveridad(), "ALTA") || equalsIgnoreCase(d.getSeveridad(), "CRITICA"))
                .count()
                + vaccineAlerts.stream().filter(a -> a.getProximaDosisFecha() != null && a.getProximaDosisFecha().isBefore(today)).count();
        BigDecimal averageOccupancy = averageOccupancy(activePotreros, animalCountByPotrero);
        long activeDiets = diets.stream().filter(d -> Boolean.TRUE.equals(d.getActiva())).count();
        long withoutLocation = activeAnimals.size() - activeAssignments.stream()
                .map(assignment -> assignment.getAnimal().getId())
                .collect(Collectors.toSet())
                .size();

        BigDecimal feedCostMonth = sum(feedRecords.stream()
                .filter(r -> !r.getFecha().isBefore(monthStart))
                .map(RegistroAlimentacion::getCostoTotal)
                .filter(Objects::nonNull)
                .toList());
        BigDecimal feedCostPreviousMonth = sum(registroAlimentacionRepository.findFiltered(null, previousMonthStart, previousMonthEnd).stream()
                .map(RegistroAlimentacion::getCostoTotal)
                .filter(Objects::nonNull)
                .toList());

        return new ReporteGanaderoDashboardResponse(
                LocalDateTime.now(),
                List.of(
                        kpi("ANIMALES_ACTIVOS", "Animales activos", String.valueOf(activeAnimals.size()), "Rodeo operativo", "green", BigDecimal.valueOf(activeAnimals.size()), "+0%"),
                        kpi("PESO_PROMEDIO", "Peso promedio", formatKg(averageWeight), "Promedio del rodeo activo", "blue", averageWeight, "+0%"),
                        kpi("GANANCIA_DIARIA", "Ganancia diaria", dailyGain == null ? null : formatDecimal(dailyGain) + " kg/dia", "Pesajes ultimos 90 dias", "green", dailyGain, "+0%"),
                        kpi("PRENADAS_ACTIVAS", "Prenadas activas", String.valueOf(activePregnancies), "Controles positivos", "purple", BigDecimal.valueOf(activePregnancies), "+0%"),
                        kpi("PARTOS_PROXIMOS", "Partos proximos", String.valueOf(upcomingBirths), "Proximos 30 dias", "orange", BigDecimal.valueOf(upcomingBirths), "+0%"),
                        kpi("VACUNAS_PROXIMAS", "Vacunas proximas", String.valueOf(upcomingVaccines), "Proximos 30 dias", "blue", BigDecimal.valueOf(upcomingVaccines), "+0%"),
                        kpi("ALERTAS_SANITARIAS", "Alertas sanitarias", String.valueOf(healthAlerts), "Vencidas y criticas", "red", BigDecimal.valueOf(healthAlerts), "+0%"),
                        kpi("OCUPACION_POTREROS", "Ocupacion promedio", formatPct(averageOccupancy), "Potreros activos", "green", averageOccupancy, "+0%"),
                        kpi("DIETAS_ACTIVAS", "Dietas activas", String.valueOf(activeDiets), "Planes nutricionales vigentes", "green", BigDecimal.valueOf(activeDiets), "+0%"),
                        kpi("SIN_UBICACION", "Animales sin ubicacion", String.valueOf(withoutLocation), "Requieren asignacion", "orange", BigDecimal.valueOf(withoutLocation), "+0%")
                ),
                distribucionRodeo(activeAnimals),
                animalesPorPotrero(activeAssignments),
                ocupacionPotreros(activePotreros, animalCountByPotrero),
                calendarioSanitario(allVaccineApplications, today),
                diagnosticosPorSeveridad(diagnostics),
                tratamientosActivos(treatments, diagnostics, today, monthStart),
                estadoReproductivo(pregnancyControls, activeAnimals, today),
                partosEstimadosPorMes(pregnancyControls, births, today),
                genealogiaTrazabilidad(activeAnimals, activeAssignments),
                consumoAlimentoPorPotrero(feedRecords, today),
                new ReporteGanaderoDashboardResponse.CostoAlimentacion(feedCostMonth, variation(feedCostMonth, feedCostPreviousMonth), "USD"),
                new ReporteGanaderoDashboardResponse.ConversionAlimenticia(conversionAlimenticia(feedRecords, recentWeights), "kg alimento / kg ganado"),
                dietasActivas(diets),
                alertasOperativas(vaccineAlerts, activePotreros, animalCountByPotrero, pregnancyControls, recentWeights, activeAnimals, diagnostics, today)
        );
    }

    private ReporteGanaderoDashboardResponse.Kpi kpi(String codigo, String titulo, String valor, String subtitulo, String tono, BigDecimal valorNumerico, String tendencia) {
        return new ReporteGanaderoDashboardResponse.Kpi(codigo, titulo, valor == null ? "Sin datos" : valor, subtitulo, tono, valorNumerico, tendencia);
    }

    private List<ReporteGanaderoDashboardResponse.DistribucionRodeo> distribucionRodeo(List<Animal> animals) {
        Map<String, Long> counts = animals.stream().collect(Collectors.groupingBy(this::categoriaRodeo, Collectors.counting()));
        long total = Math.max(1, animals.size());
        return Arrays.stream(RODEO_ORDER)
                .map(category -> new ReporteGanaderoDashboardResponse.DistribucionRodeo(
                        category,
                        counts.getOrDefault(category, 0L),
                        pct(counts.getOrDefault(category, 0L), total),
                        RODEO_COLORS.getOrDefault(category, "#A6B0CF")
                ))
                .toList();
    }

    private String categoriaRodeo(Animal animal) {
        long ageMonths = animal.getFechaNacimiento() == null ? 999 : ChronoUnit.MONTHS.between(animal.getFechaNacimiento(), LocalDate.now());
        String sex = nullSafe(animal.getSexo()).toUpperCase(Locale.ROOT);
        if (ageMonths < 12) {
            return "Terneros";
        }
        if (sex.startsWith("F")) {
            return ageMonths >= 24 ? "Vacas" : "Vaquillonas";
        }
        if (sex.startsWith("M")) {
            return ageMonths >= 24 ? "Toros" : "Novillos";
        }
        return "Otros";
    }

    private List<ReporteGanaderoDashboardResponse.BarraCategoria> animalesPorPotrero(List<AnimalPotrero> assignments) {
        Map<String, Long> grouped = assignments.stream()
                .filter(assignment -> assignment.getPotrero() != null)
                .collect(Collectors.groupingBy(assignment -> assignment.getPotrero().getNombre(), Collectors.counting()));
        long max = Math.max(1L, grouped.values().stream().mapToLong(Long::longValue).max().orElse(1L));
        return grouped.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(6)
                .map(entry -> new ReporteGanaderoDashboardResponse.BarraCategoria(entry.getKey(), entry.getValue(), pct(entry.getValue(), max), "#9FE870"))
                .toList();
    }

    private List<ReporteGanaderoDashboardResponse.PotreroOcupacion> ocupacionPotreros(List<Potrero> potreros, Map<String, Long> animalCountByPotrero) {
        return potreros.stream()
                .sorted(Comparator.comparing((Potrero p) -> occupancyRatio(p, animalCountByPotrero.getOrDefault(p.getId(), 0L))).reversed())
                .limit(6)
                .map(p -> new ReporteGanaderoDashboardResponse.PotreroOcupacion(
                        p.getNombre(),
                        safeLongToInt(animalCountByPotrero.getOrDefault(p.getId(), 0L)),
                        safeInt(p.getCapacidadAnimales()),
                        occupancyRatio(p, animalCountByPotrero.getOrDefault(p.getId(), 0L)),
                        p.getEstado(),
                        p.getRecursoForrajero()
                ))
                .toList();
    }

    private List<ReporteGanaderoDashboardResponse.CalendarioSanitario> calendarioSanitario(List<AplicacionVacuna> applications, LocalDate today) {
        return applications.stream()
                .filter(a -> a.getProximaDosisFecha() != null && a.getVacuna() != null)
                .collect(Collectors.groupingBy(a -> a.getVacuna().getNombre()))
                .entrySet().stream()
                .map(entry -> {
                    List<AplicacionVacuna> items = entry.getValue();
                    long expired = items.stream().filter(a -> a.getProximaDosisFecha().isBefore(today)).count();
                    long upcoming = items.stream().filter(a -> !a.getProximaDosisFecha().isBefore(today) && !a.getProximaDosisFecha().isAfter(today.plusDays(30))).count();
                    long scheduled = items.stream().filter(a -> a.getProximaDosisFecha().isAfter(today.plusDays(30))).count();
                    boolean required = items.stream().map(AplicacionVacuna::getVacuna).filter(Objects::nonNull).anyMatch(v -> Boolean.TRUE.equals(v.getObligatoria()));
                    return new ReporteGanaderoDashboardResponse.CalendarioSanitario(entry.getKey(), expired, upcoming, scheduled, required);
                })
                .sorted(Comparator.comparing(ReporteGanaderoDashboardResponse.CalendarioSanitario::vencidas).reversed()
                        .thenComparing(ReporteGanaderoDashboardResponse.CalendarioSanitario::proximas, Comparator.reverseOrder()))
                .limit(6)
                .toList();
    }

    private List<ReporteGanaderoDashboardResponse.DiagnosticoSeveridad> diagnosticosPorSeveridad(List<DiagnosticoSanitario> diagnostics) {
        Map<String, Long> counts = diagnostics.stream()
                .filter(d -> equalsIgnoreCase(d.getEstado(), "ABIERTO"))
                .collect(Collectors.groupingBy(d -> nullSafe(d.getSeveridad()).toUpperCase(Locale.ROOT), Collectors.counting()));
        long total = Math.max(1L, counts.values().stream().mapToLong(Long::longValue).sum());
        return List.of("BAJA", "MEDIA", "ALTA", "CRITICA").stream()
                .map(severity -> new ReporteGanaderoDashboardResponse.DiagnosticoSeveridad(
                        severity,
                        counts.getOrDefault(severity, 0L),
                        pct(counts.getOrDefault(severity, 0L), total),
                        SEVERIDAD_COLORS.getOrDefault(severity, "#A6B0CF")
                ))
                .toList();
    }

    private ReporteGanaderoDashboardResponse.TratamientosActivos tratamientosActivos(List<TratamientoMedicamento> treatments, List<DiagnosticoSanitario> diagnostics, LocalDate today, LocalDate monthStart) {
        List<TratamientoMedicamento> active = treatments.stream()
                .filter(t -> t.getFechaFin() == null || !t.getFechaFin().isBefore(today))
                .toList();
        long animals = active.stream().map(TratamientoMedicamento::getAnimal).filter(Objects::nonNull).map(Animal::getId).distinct().count();
        long openDiagnostics = diagnostics.stream().filter(d -> equalsIgnoreCase(d.getEstado(), "ABIERTO")).count();
        long critical = diagnostics.stream().filter(d -> equalsIgnoreCase(d.getEstado(), "ABIERTO")).filter(d -> equalsIgnoreCase(d.getSeveridad(), "CRITICA")).count();
        BigDecimal cost = sum(treatments.stream()
                .filter(t -> t.getFechaInicio() != null && !t.getFechaInicio().isBefore(monthStart))
                .map(TratamientoMedicamento::getCosto)
                .filter(Objects::nonNull)
                .toList());
        return new ReporteGanaderoDashboardResponse.TratamientosActivos(animals, openDiagnostics, critical, cost);
    }

    private ReporteGanaderoDashboardResponse.EstadoReproductivo estadoReproductivo(List<ControlPrenez> controls, List<Animal> animals, LocalDate today) {
        long pregnants = controls.stream().filter(c -> equalsIgnoreCase(c.getEstado(), "PRENADA")).count();
        long empty = controls.stream().filter(c -> equalsIgnoreCase(c.getEstado(), "VACIA")).count();
        long inControl = controls.stream().filter(c -> equalsIgnoreCase(c.getEstado(), "EN_CONTROL") || equalsIgnoreCase(c.getEstado(), "DUDOSA")).count();
        long nextBirths = controls.stream()
                .filter(c -> c.getFechaEstimadaParto() != null)
                .filter(c -> !c.getFechaEstimadaParto().isBefore(today) && !c.getFechaEstimadaParto().isAfter(today.plusDays(30)))
                .count();
        long bulls = animals.stream().filter(a -> nullSafe(a.getSexo()).toUpperCase(Locale.ROOT).startsWith("M")).count();
        return new ReporteGanaderoDashboardResponse.EstadoReproductivo(pregnants, empty, inControl, nextBirths, bulls);
    }

    private List<ReporteGanaderoDashboardResponse.SeriePunto> partosEstimadosPorMes(List<ControlPrenez> controls, List<Parto> births, LocalDate today) {
        YearMonth start = YearMonth.from(today);
        Map<YearMonth, Long> estimated = controls.stream()
                .filter(c -> c.getFechaEstimadaParto() != null)
                .collect(Collectors.groupingBy(c -> YearMonth.from(c.getFechaEstimadaParto()), Collectors.counting()));
        Map<YearMonth, Long> realBirths = births.stream()
                .filter(p -> p.getFecha() != null && !p.getFecha().isBefore(today.withDayOfMonth(1)))
                .collect(Collectors.groupingBy(p -> YearMonth.from(p.getFecha()), Collectors.counting()));
        return java.util.stream.IntStream.range(0, 6)
                .mapToObj(start::plusMonths)
                .map(month -> new ReporteGanaderoDashboardResponse.SeriePunto(
                        capitalize(month.getMonth().name().substring(0, 3).toLowerCase(Locale.ROOT)),
                        BigDecimal.valueOf(estimated.getOrDefault(month, 0L) + realBirths.getOrDefault(month, 0L))
                ))
                .toList();
    }

    private ReporteGanaderoDashboardResponse.GenealogiaTrazabilidad genealogiaTrazabilidad(List<Animal> animals, List<AnimalPotrero> assignments) {
        long total = Math.max(1, animals.size());
        Set<String> animalsWithLocation = assignments.stream()
                .map(AnimalPotrero::getAnimal)
                .filter(Objects::nonNull)
                .map(Animal::getId)
                .collect(Collectors.toSet());
        long sinMadre = animals.stream().filter(a -> a.getMadre() == null).count();
        long sinPadre = animals.stream().filter(a -> a.getPadre() == null).count();
        long sinRaza = animals.stream().filter(a -> isBlank(a.getRaza())).count();
        long sinFecha = animals.stream().filter(a -> a.getFechaNacimiento() == null).count();
        long sinTrazabilidad = animals.stream().filter(a -> !animalsWithLocation.contains(a.getId()) || isBlank(a.getCaravana())).count();
        long completas = animals.stream()
                .filter(a -> a.getMadre() != null && a.getPadre() != null && !isBlank(a.getRaza()) && a.getFechaNacimiento() != null && animalsWithLocation.contains(a.getId()))
                .count();
        return new ReporteGanaderoDashboardResponse.GenealogiaTrazabilidad(pct(completas, total), sinMadre, sinPadre, sinRaza, sinFecha, sinTrazabilidad);
    }

    private List<ReporteGanaderoDashboardResponse.SerieCategoria> consumoAlimentoPorPotrero(List<RegistroAlimentacion> records, LocalDate today) {
        YearMonth start = YearMonth.from(today.minusMonths(5));
        Map<String, List<RegistroAlimentacion>> byPotrero = records.stream()
                .filter(r -> r.getPotreroRef() != null || !isBlank(r.getPotrero()))
                .collect(Collectors.groupingBy(this::potreroKeyForFeedRecord));
        return byPotrero.entrySet().stream()
                .sorted(Comparator.comparing((Map.Entry<String, List<RegistroAlimentacion>> e) -> sum(e.getValue().stream().map(RegistroAlimentacion::getCantidadKg).filter(Objects::nonNull).toList())).reversed())
                .limit(6)
                .map(entry -> {
                    Map<YearMonth, BigDecimal> byMonth = entry.getValue().stream()
                            .filter(r -> r.getFecha() != null && r.getCantidadKg() != null)
                            .collect(Collectors.groupingBy(r -> YearMonth.from(r.getFecha()), Collectors.mapping(RegistroAlimentacion::getCantidadKg, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));
                    List<ReporteGanaderoDashboardResponse.SeriePunto> points = java.util.stream.IntStream.range(0, 6)
                            .mapToObj(start::plusMonths)
                            .map(month -> new ReporteGanaderoDashboardResponse.SeriePunto(capitalize(month.getMonth().name().substring(0, 3).toLowerCase(Locale.ROOT)), scale(byMonth.getOrDefault(month, BigDecimal.ZERO), 2)))
                            .toList();
                    return new ReporteGanaderoDashboardResponse.SerieCategoria(potreroLabelForFeedRecords(entry.getValue()), points, sum(entry.getValue().stream().map(RegistroAlimentacion::getCantidadKg).filter(Objects::nonNull).toList()));
                })
                .toList();
    }

    private List<ReporteGanaderoDashboardResponse.DietaActiva> dietasActivas(List<DietaNutricional> diets) {
        return diets.stream()
                .filter(d -> Boolean.TRUE.equals(d.getActiva()))
                .limit(8)
                .map(d -> new ReporteGanaderoDashboardResponse.DietaActiva(d.getNombre(), d.getTipoAnimal(), d.getObjetivo(), d.getMateriaSecaKg(), d.getCostoDiario()))
                .toList();
    }

    private List<ReporteGanaderoDashboardResponse.AlertaOperativa> alertasOperativas(List<AplicacionVacuna> vaccines, List<Potrero> potreros, Map<String, Long> animalCountByPotrero, List<ControlPrenez> controls, List<PesajeAnimal> weights, List<Animal> animals, List<DiagnosticoSanitario> diagnostics, LocalDate today) {
        List<ReporteGanaderoDashboardResponse.AlertaOperativa> alerts = new ArrayList<>();
        vaccines.stream()
                .filter(v -> v.getProximaDosisFecha() != null && !v.getProximaDosisFecha().isAfter(today.plusDays(3)))
                .limit(3)
                .forEach(v -> alerts.add(new ReporteGanaderoDashboardResponse.AlertaOperativa(
                        "Sanidad",
                        "Vacuna " + v.getVacuna().getNombre(),
                        v.getAnimal().getCaravana() + " vence el " + v.getProximaDosisFecha(),
                        v.getProximaDosisFecha().isBefore(today) ? "ALTA" : "MEDIA",
                        LocalDateTime.now()
                )));
        potreros.stream()
                .filter(p -> occupancyRatio(p, animalCountByPotrero.getOrDefault(p.getId(), 0L)).compareTo(BigDecimal.valueOf(100)) >= 0)
                .limit(2)
                .forEach(p -> alerts.add(new ReporteGanaderoDashboardResponse.AlertaOperativa("Potreros", p.getNombre() + " excede carga recomendada", safeLongToInt(animalCountByPotrero.getOrDefault(p.getId(), 0L)) + " / " + safeInt(p.getCapacidadAnimales()), "ALTA", LocalDateTime.now())));
        controls.stream()
                .filter(c -> c.getFechaEstimadaParto() != null && !c.getFechaEstimadaParto().isBefore(today) && !c.getFechaEstimadaParto().isAfter(today.plusDays(7)))
                .limit(2)
                .forEach(c -> alerts.add(new ReporteGanaderoDashboardResponse.AlertaOperativa("Reproduccion", "Parto proximo", c.getVaca().getCaravana() + " estimado para " + c.getFechaEstimadaParto(), "MEDIA", LocalDateTime.now())));
        Set<String> weightedAnimalIds = weights.stream().map(PesajeAnimal::getAnimal).filter(Objects::nonNull).map(Animal::getId).collect(Collectors.toSet());
        long withoutRecentWeight = animals.stream().filter(a -> !weightedAnimalIds.contains(a.getId())).count();
        if (withoutRecentWeight > 0) {
            alerts.add(new ReporteGanaderoDashboardResponse.AlertaOperativa("Pesajes", "Animales sin pesaje actualizado", withoutRecentWeight + " animales sin pesaje en ultimos 90 dias", "MEDIA", LocalDateTime.now()));
        }
        diagnostics.stream()
                .filter(d -> equalsIgnoreCase(d.getEstado(), "ABIERTO") && equalsIgnoreCase(d.getSeveridad(), "CRITICA"))
                .limit(2)
                .forEach(d -> alerts.add(new ReporteGanaderoDashboardResponse.AlertaOperativa("Sanidad", "Caso critico abierto", d.getAnimal().getCaravana() + " - " + d.getEnfermedad(), "ALTA", LocalDateTime.now())));
        return alerts.stream()
                .sorted(Comparator.comparing((ReporteGanaderoDashboardResponse.AlertaOperativa a) -> priorityRank(a.prioridad())).reversed())
                .limit(8)
                .toList();
    }

    private BigDecimal conversionAlimenticia(List<RegistroAlimentacion> records, List<PesajeAnimal> weights) {
        BigDecimal totalFeed = sum(records.stream().map(RegistroAlimentacion::getCantidadKg).filter(Objects::nonNull).toList());
        BigDecimal totalGain = totalGain(weights);
        if (totalFeed.compareTo(BigDecimal.ZERO) <= 0 || totalGain.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return totalFeed.divide(totalGain, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal totalGain(List<PesajeAnimal> weights) {
        return weights.stream()
                .filter(w -> w.getAnimal() != null && w.getPesoKg() != null && w.getFecha() != null)
                .collect(Collectors.groupingBy(w -> w.getAnimal().getId()))
                .values().stream()
                .map(items -> items.stream().sorted(Comparator.comparing(PesajeAnimal::getFecha)).toList())
                .filter(items -> items.size() >= 2)
                .map(items -> items.get(items.size() - 1).getPesoKg().subtract(items.get(0).getPesoKg()))
                .filter(gain -> gain.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal averageDailyGain(List<PesajeAnimal> weights) {
        List<BigDecimal> gains = weights.stream()
                .filter(w -> w.getAnimal() != null && w.getPesoKg() != null && w.getFecha() != null)
                .collect(Collectors.groupingBy(w -> w.getAnimal().getId()))
                .values().stream()
                .map(items -> items.stream().sorted(Comparator.comparing(PesajeAnimal::getFecha)).toList())
                .filter(items -> items.size() >= 2)
                .map(items -> {
                    PesajeAnimal first = items.get(0);
                    PesajeAnimal last = items.get(items.size() - 1);
                    long days = Math.max(1, ChronoUnit.DAYS.between(first.getFecha(), last.getFecha()));
                    return last.getPesoKg().subtract(first.getPesoKg()).divide(BigDecimal.valueOf(days), 3, RoundingMode.HALF_UP);
                })
                .filter(value -> value.compareTo(BigDecimal.ZERO) > 0)
                .toList();
        return average(gains);
    }

    private BigDecimal averageOccupancy(List<Potrero> potreros, Map<String, Long> animalCountByPotrero) {
        return average(potreros.stream()
                .filter(p -> safeInt(p.getCapacidadAnimales()) > 0)
                .map(p -> occupancyRatio(p, animalCountByPotrero.getOrDefault(p.getId(), 0L)))
                .toList());
    }

    private BigDecimal occupancyRatio(Potrero potrero, long cargaActual) {
        int capacity = safeInt(potrero.getCapacidadAnimales());
        if (capacity <= 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(cargaActual)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(capacity), 2, RoundingMode.HALF_UP);
    }

    private Map<String, Long> animalCountByPotrero(List<AnimalPotrero> assignments) {
        return assignments.stream()
                .filter(assignment -> assignment.getPotrero() != null)
                .collect(Collectors.groupingBy(assignment -> assignment.getPotrero().getId(), Collectors.counting()));
    }

    private List<AnimalPotrero> activeAnimalPotreroAssignments(List<Animal> animals) {
        List<String> animalIds = animals.stream().map(Animal::getId).toList();
        if (animalIds.isEmpty()) {
            return List.of();
        }
        return animalPotreroRepository.findActiveByAnimalIds(animalIds);
    }

    private BigDecimal variation(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return current.subtract(previous).multiply(BigDecimal.valueOf(100)).divide(previous, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal average(List<BigDecimal> values) {
        if (values == null || values.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return values.stream().reduce(BigDecimal.ZERO, BigDecimal::add).divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal sum(List<BigDecimal> values) {
        return scale(values.stream().filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add), 2);
    }

    private BigDecimal pct(long value, long total) {
        if (total <= 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(value).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal scale(BigDecimal value, int scale) {
        return value == null ? BigDecimal.ZERO : value.setScale(scale, RoundingMode.HALF_UP);
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private int safeLongToInt(Long value) {
        return value == null ? 0 : Math.toIntExact(value);
    }

    private boolean equalsIgnoreCase(String value, String expected) {
        return value != null && value.equalsIgnoreCase(expected);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private String formatKg(BigDecimal value) {
        return value == null ? "Sin datos" : formatDecimal(value) + " kg";
    }

    private String formatPct(BigDecimal value) {
        return value == null ? "0%" : formatDecimal(value) + "%";
    }

    private String formatDecimal(BigDecimal value) {
        return value == null ? "0" : value.stripTrailingZeros().toPlainString();
    }

    private String capitalize(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1).toLowerCase(Locale.ROOT);
    }

    private int priorityRank(String priority) {
        return switch (nullSafe(priority).toUpperCase(Locale.ROOT)) {
            case "ALTA" -> 3;
            case "MEDIA" -> 2;
            case "BAJA" -> 1;
            default -> 0;
        };
    }

    private String potreroKeyForFeedRecord(RegistroAlimentacion record) {
        if (record.getPotreroRef() != null) {
            return record.getPotreroRef().getId();
        }
        return record.getPotrero().trim();
    }

    private String potreroLabelForFeedRecords(List<RegistroAlimentacion> records) {
        return records.stream()
                .filter(record -> record.getPotreroRef() != null)
                .map(record -> record.getPotreroRef().getNombre())
                .findFirst()
                .orElse(records.isEmpty() ? "Sin potrero" : records.get(0).getPotrero());
    }
}
