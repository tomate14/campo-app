package com.campoapp.ganaderia.service.impl;

import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.ganaderia.dto.*;
import com.campoapp.ganaderia.entity.*;
import com.campoapp.ganaderia.repository.*;
import com.campoapp.ganaderia.service.ReproduccionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class ReproduccionServiceImpl implements ReproduccionService {
    private static final int GENEALOGIA_MAX_GENERACIONES = 3;

    private final AnimalRepository animalRepository;
    private final MontaRepository montaRepository;
    private final InseminacionRepository inseminacionRepository;
    private final ControlPrenezRepository controlPrenezRepository;
    private final PartoRepository partoRepository;
    private final IndiceGeneticoRepository indiceGeneticoRepository;

    @Override
    @Transactional(readOnly = true)
    public ReproduccionResumenResponse getResumen(LocalDate desde, LocalDate hasta) {
        return new ReproduccionResumenResponse(
                getDashboard(LocalDate.now()),
                listMontas(desde, hasta),
                listInseminaciones(desde, hasta),
                listControlesPrenez(null),
                listPartos(desde, hasta),
                listIndices()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ReproduccionDashboardResponse getDashboard(LocalDate referencia) {
        LocalDate today = referencia != null ? referencia : LocalDate.now();
        List<Monta> montas = montaRepository.findFiltered(null, null);
        List<Inseminacion> inseminaciones = inseminacionRepository.findFiltered(null, null);
        List<ControlPrenez> controles = controlPrenezRepository.findFiltered(null);
        List<Parto> partos = partoRepository.findFiltered(null, null);
        long servicios = montas.size() + inseminaciones.size();
        long prenezActivas = controles.stream().filter(item -> "PRENADA".equalsIgnoreCase(item.getEstado())).count();
        long diagnosticosPositivos = controles.stream().filter(item -> "PRENADA".equalsIgnoreCase(item.getEstado())).count();
        long partosViables = partos.stream().filter(item -> "VIABLE".equalsIgnoreCase(item.getViabilidadTernero())).count();

        return new ReproduccionDashboardResponse(
                montas.size(),
                inseminaciones.size(),
                prenezActivas,
                partos.size(),
                percent(diagnosticosPositivos, controles.size()),
                percent(partosViables, partos.size()),
                servicios == 0 || diagnosticosPositivos == 0 ? BigDecimal.ZERO : BigDecimal.valueOf(servicios).divide(BigDecimal.valueOf(diagnosticosPositivos), 2, RoundingMode.HALF_UP),
                buildAlertas(today),
                buildRecomendaciones().stream().limit(5).toList()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<MontaResponse> listMontas(LocalDate desde, LocalDate hasta) {
        return montaRepository.findFiltered(desde, hasta).stream().map(this::toMontaResponse).toList();
    }

    @Override
    public MontaResponse registrarMonta(MontaRequest request) {
        Animal vaca = getAnimal(request.vacaId());
        Animal toro = getAnimal(request.toroId());
        requireFemale(vaca, "vaca");
        requireMale(toro, "toro");
        preventDirectKin(vaca, toro);
        Monta monta = Monta.builder()
                .vaca(vaca)
                .toro(toro)
                .fecha(request.fecha())
                .resultado(defaultString(request.resultado(), "PENDIENTE"))
                .observaciones(request.observaciones())
                .build();
        return toMontaResponse(montaRepository.save(monta));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InseminacionResponse> listInseminaciones(LocalDate desde, LocalDate hasta) {
        return inseminacionRepository.findFiltered(desde, hasta).stream().map(this::toInseminacionResponse).toList();
    }

    @Override
    public InseminacionResponse registrarInseminacion(InseminacionRequest request) {
        Animal vaca = getAnimal(request.vacaId());
        requireFemale(vaca, "vaca");
        Inseminacion inseminacion = Inseminacion.builder()
                .vaca(vaca)
                .fecha(request.fecha())
                .geneticaUsada(request.geneticaUsada())
                .tecnico(request.tecnico())
                .costo(request.costo())
                .resultado(defaultString(request.resultado(), "PENDIENTE"))
                .observaciones(request.observaciones())
                .build();
        return toInseminacionResponse(inseminacionRepository.save(inseminacion));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ControlPrenezResponse> listControlesPrenez(String estado) {
        return controlPrenezRepository.findFiltered(blankToNull(estado)).stream().map(this::toControlPrenezResponse).toList();
    }

    @Override
    public ControlPrenezResponse registrarControlPrenez(ControlPrenezRequest request) {
        Animal vaca = getAnimal(request.vacaId());
        requireFemale(vaca, "vaca");
        ControlPrenez control = ControlPrenez.builder()
                .vaca(vaca)
                .fechaDiagnostico(request.fechaDiagnostico())
                .estado(request.estado())
                .fechaEstimadaParto(request.fechaEstimadaParto())
                .nivelRiesgoParto(defaultString(request.nivelRiesgoParto(), "MEDIO"))
                .veterinario(request.veterinario())
                .observaciones(request.observaciones())
                .build();
        return toControlPrenezResponse(controlPrenezRepository.save(control));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartoResponse> listPartos(LocalDate desde, LocalDate hasta) {
        return partoRepository.findFiltered(desde, hasta).stream().map(this::toPartoResponse).toList();
    }

    @Override
    public PartoResponse registrarParto(PartoRequest request) {
        Animal madre = getAnimal(request.madreId());
        requireFemale(madre, "madre");
        Animal ternero = request.terneroId() == null || request.terneroId().isBlank() ? null : getAnimal(request.terneroId());
        Parto parto = Parto.builder()
                .madre(madre)
                .ternero(ternero)
                .fecha(request.fecha())
                .complicaciones(request.complicaciones())
                .viabilidadTernero(defaultString(request.viabilidadTernero(), "VIABLE"))
                .observaciones(request.observaciones())
                .build();
        return toPartoResponse(partoRepository.save(parto));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IndiceGeneticoResponse> listIndices() {
        return indiceGeneticoRepository.findAllActive().stream().map(this::toIndiceResponse).toList();
    }

    @Override
    public IndiceGeneticoResponse registrarIndice(IndiceGeneticoRequest request) {
        Animal animal = getAnimal(request.animalId());
        IndiceGenetico indice = IndiceGenetico.builder()
                .animal(animal)
                .fechaEvaluacion(request.fechaEvaluacion())
                .epd(request.epd())
                .dep(request.dep())
                .indiceProductivo(request.indiceProductivo())
                .fuente(request.fuente())
                .observaciones(request.observaciones())
                .build();
        return toIndiceResponse(indiceGeneticoRepository.save(indice));
    }

    @Override
    @Transactional(readOnly = true)
    public GenealogiaAnimalResponse getGenealogia(String animalId) {
        Animal animal = getAnimal(animalId);
        List<Animal> animales = animalRepository.findFiltered(null, null, "ACTIVO");
        List<GenealogiaAnimalResponse.NodoGenealogia> ancestros = new ArrayList<>();
        collectAncestors(animal.getMadre(), "MADRE", 1, ancestros);
        collectAncestors(animal.getPadre(), "PADRE", 1, ancestros);
        List<GenealogiaAnimalResponse.NodoGenealogia> descendencia = buildDescendencia(animal, animales, 1, new HashSet<>());
        return new GenealogiaAnimalResponse(toNodo(animal, "ANIMAL", 0, descendencia), ancestros, descendencia);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecomendacionCruzamientoResponse> getRecomendaciones() {
        return buildRecomendaciones();
    }

    private List<AlertaReproductivaResponse> buildAlertas(LocalDate today) {
        List<AlertaReproductivaResponse> alertas = new ArrayList<>();
        controlPrenezRepository.findUpcomingBirths(today.plusDays(30)).stream().limit(10).forEach(control -> {
            long dias = ChronoUnit.DAYS.between(today, control.getFechaEstimadaParto());
            String prioridad = priorityFromRisk(control.getNivelRiesgoParto(), dias);
            alertas.add(new AlertaReproductivaResponse(
                    "PARTO_PROXIMO",
                    control.getVaca().getId(),
                    control.getVaca().getCaravana(),
                    control.getFechaEstimadaParto(),
                    prioridad,
                    defaultString(control.getNivelRiesgoParto(), "MEDIO"),
                    dias < 0 ? "Parto estimado vencido" : "Parto estimado en " + dias + " dias"
            ));
        });
        return alertas;
    }

    private List<RecomendacionCruzamientoResponse> buildRecomendaciones() {
        List<Animal> animales = animalRepository.findFiltered(null, null, "ACTIVO");
        List<Animal> hembras = animales.stream().filter(this::isFemale).toList();
        List<Animal> machos = animales.stream().filter(this::isMale).toList();
        Map<String, BigDecimal> scoreByAnimal = new HashMap<>();
        indiceGeneticoRepository.findAllActive().forEach(indice ->
                scoreByAnimal.putIfAbsent(indice.getAnimal().getId(), geneticScore(indice))
        );

        List<RecomendacionCruzamientoResponse> recomendaciones = new ArrayList<>();
        for (Animal hembra : hembras) {
            machos.stream()
                    .filter(macho -> !areDirectKin(hembra, macho))
                    .max(Comparator.comparing(macho -> scoreByAnimal.getOrDefault(macho.getId(), BigDecimal.ZERO)))
                    .ifPresent(macho -> {
                        BigDecimal score = scoreByAnimal.getOrDefault(hembra.getId(), BigDecimal.ZERO)
                                .add(scoreByAnimal.getOrDefault(macho.getId(), BigDecimal.ZERO))
                                .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                        recomendaciones.add(new RecomendacionCruzamientoResponse(
                                hembra.getId(),
                                hembra.getCaravana(),
                                macho.getId(),
                                macho.getCaravana(),
                                score,
                                "Compatible por genealogia directa e indice genetico disponible",
                                true
                        ));
                    });
        }
        return recomendaciones.stream()
                .sorted(Comparator.comparing(RecomendacionCruzamientoResponse::score).reversed())
                .toList();
    }

    private BigDecimal geneticScore(IndiceGenetico indice) {
        BigDecimal epd = indice.getEpd() != null ? indice.getEpd() : BigDecimal.ZERO;
        BigDecimal dep = indice.getDep() != null ? indice.getDep() : BigDecimal.ZERO;
        BigDecimal productivo = indice.getIndiceProductivo() != null ? indice.getIndiceProductivo() : BigDecimal.ZERO;
        return epd.add(dep).add(productivo).divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
    }

    private void collectAncestors(Animal animal, String relation, int generation, List<GenealogiaAnimalResponse.NodoGenealogia> output) {
        if (animal == null || generation > GENEALOGIA_MAX_GENERACIONES) {
            return;
        }
        output.add(toNodo(animal, relation, generation));
        collectAncestors(animal.getMadre(), "MADRE", generation + 1, output);
        collectAncestors(animal.getPadre(), "PADRE", generation + 1, output);
    }

    private List<GenealogiaAnimalResponse.NodoGenealogia> buildDescendencia(Animal parent, List<Animal> animales, int generation, Set<String> visited) {
        if (parent == null || generation > 3 || !visited.add(parent.getId())) {
            return List.of();
        }
        return animales.stream()
                .filter(child -> isParent(parent, child))
                .sorted(Comparator.comparing(Animal::getCaravana))
                .map(child -> toNodo(child, "DESCENDENCIA", generation, buildDescendencia(child, animales, generation + 1, new HashSet<>(visited))))
                .toList();
    }

    private Animal getAnimal(String id) {
        return animalRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal no encontrado"));
    }

    private void requireFemale(Animal animal, String field) {
        if (animal.getSexo() != null && !animal.getSexo().isBlank() && !isFemale(animal)) {
            throw new BusinessException("El campo " + field + " debe referenciar una hembra");
        }
    }

    private void requireMale(Animal animal, String field) {
        if (animal.getSexo() != null && !animal.getSexo().isBlank() && !isMale(animal)) {
            throw new BusinessException("El campo " + field + " debe referenciar un macho");
        }
    }

    private boolean isFemale(Animal animal) {
        return matchesSexo(animal, "FEMENINO", "HEMBRA", "F", "FEMALE");
    }

    private boolean isMale(Animal animal) {
        return matchesSexo(animal, "MASCULINO", "MACHO", "TORO", "M", "MALE");
    }

    private boolean matchesSexo(Animal animal, String... values) {
        if (animal.getSexo() == null || animal.getSexo().isBlank()) {
            return false;
        }
        String sexo = normalizeSexo(animal.getSexo());
        return Arrays.stream(values).map(this::normalizeSexo).anyMatch(value -> value.equals(sexo));
    }

    private String normalizeSexo(String value) {
        return java.text.Normalizer.normalize(value.trim(), java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase(Locale.ROOT);
    }

    private void preventDirectKin(Animal a, Animal b) {
        if (areDirectKin(a, b)) {
            throw new BusinessException("No se recomienda registrar cruces con parentesco directo");
        }
    }

    private boolean areDirectKin(Animal a, Animal b) {
        return isParent(a, b) || isParent(b, a) || sameAnimal(a.getMadre(), b.getMadre()) || sameAnimal(a.getPadre(), b.getPadre());
    }

    private boolean isParent(Animal parent, Animal child) {
        return sameAnimal(parent, child.getMadre()) || sameAnimal(parent, child.getPadre());
    }

    private boolean sameAnimal(Animal a, Animal b) {
        return a != null && b != null && Objects.equals(a.getId(), b.getId());
    }

    private BigDecimal percent(long value, long total) {
        if (total == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(value).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);
    }

    private String defaultString(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private String priorityFromRisk(String risk, long daysUntilBirth) {
        if (daysUntilBirth < 0) {
            return "ALTA";
        }
        String normalized = normalizeText(defaultString(risk, "MEDIO"));
        if ("ALTO".equals(normalized) || "ALTA".equals(normalized)) {
            return "ALTA";
        }
        if ("BAJO".equals(normalized) || "BAJA".equals(normalized)) {
            return "BAJA";
        }
        return "MEDIA";
    }

    private String normalizeText(String value) {
        return java.text.Normalizer.normalize(value.trim(), java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase(Locale.ROOT);
    }

    private GenealogiaAnimalResponse.NodoGenealogia toNodo(Animal animal, String relacion, int generacion) {
        return toNodo(animal, relacion, generacion, List.of());
    }

    private GenealogiaAnimalResponse.NodoGenealogia toNodo(Animal animal, String relacion, int generacion, List<GenealogiaAnimalResponse.NodoGenealogia> hijos) {
        return new GenealogiaAnimalResponse.NodoGenealogia(animal.getId(), animal.getCaravana(), animal.getRaza(), animal.getSexo(), relacion, generacion, hijos);
    }

    private MontaResponse toMontaResponse(Monta item) {
        return new MontaResponse(item.getId(), item.getVaca().getId(), item.getVaca().getCaravana(), item.getToro().getId(), item.getToro().getCaravana(), item.getFecha(), item.getResultado(), item.getObservaciones(), item.getCreatedAt());
    }

    private InseminacionResponse toInseminacionResponse(Inseminacion item) {
        return new InseminacionResponse(item.getId(), item.getVaca().getId(), item.getVaca().getCaravana(), item.getFecha(), item.getGeneticaUsada(), item.getTecnico(), item.getCosto(), item.getResultado(), item.getObservaciones(), item.getCreatedAt());
    }

    private ControlPrenezResponse toControlPrenezResponse(ControlPrenez item) {
        return new ControlPrenezResponse(item.getId(), item.getVaca().getId(), item.getVaca().getCaravana(), item.getFechaDiagnostico(), item.getEstado(), item.getFechaEstimadaParto(), item.getNivelRiesgoParto(), item.getVeterinario(), item.getObservaciones(), item.getCreatedAt());
    }

    private PartoResponse toPartoResponse(Parto item) {
        return new PartoResponse(item.getId(), item.getMadre().getId(), item.getMadre().getCaravana(), item.getTernero() != null ? item.getTernero().getId() : null, item.getTernero() != null ? item.getTernero().getCaravana() : null, item.getFecha(), item.getComplicaciones(), item.getViabilidadTernero(), item.getObservaciones(), item.getCreatedAt());
    }

    private IndiceGeneticoResponse toIndiceResponse(IndiceGenetico item) {
        return new IndiceGeneticoResponse(item.getId(), item.getAnimal().getId(), item.getAnimal().getCaravana(), item.getFechaEvaluacion(), item.getEpd(), item.getDep(), item.getIndiceProductivo(), item.getFuente(), item.getObservaciones(), item.getCreatedAt());
    }
}
