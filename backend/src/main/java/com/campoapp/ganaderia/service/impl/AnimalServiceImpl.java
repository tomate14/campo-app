package com.campoapp.ganaderia.service.impl;

import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.ganaderia.dto.*;
import com.campoapp.ganaderia.entity.Animal;
import com.campoapp.ganaderia.entity.AnimalPotrero;
import com.campoapp.ganaderia.entity.CatalogoRazaBovina;
import com.campoapp.ganaderia.entity.HistorialMedicoAnimal;
import com.campoapp.ganaderia.entity.MovimientoAnimal;
import com.campoapp.ganaderia.entity.Potrero;
import com.campoapp.ganaderia.repository.AnimalRepository;
import com.campoapp.ganaderia.repository.AnimalPotreroRepository;
import com.campoapp.ganaderia.repository.CatalogoRazaBovinaRepository;
import com.campoapp.ganaderia.repository.HistorialMedicoAnimalRepository;
import com.campoapp.ganaderia.repository.MovimientoAnimalRepository;
import com.campoapp.ganaderia.repository.PotreroRepository;
import com.campoapp.ganaderia.service.AnimalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AnimalServiceImpl implements AnimalService {

    private final AnimalRepository animalRepository;
    private final MovimientoAnimalRepository movimientoRepository;
    private final HistorialMedicoAnimalRepository historialRepository;
    private final PotreroRepository potreroRepository;
    private final AnimalPotreroRepository animalPotreroRepository;
    private final CatalogoRazaBovinaRepository razaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AnimalResponse> listAnimales(String caravana, String raza, String ubicacion, String estado) {
        List<Animal> animals = animalRepository.findFiltered(caravana, raza, estado);
        Map<String, AnimalPotrero> assignments = activeAssignmentsByAnimalId(animals);
        return animals.stream()
                .map(animal -> toAnimalResponse(animal, assignments.get(animal.getId())))
                .filter(response -> matchesUbicacion(response, ubicacion))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatalogoRazaBovinaResponse> listRazasBovinas(String search) {
        List<CatalogoRazaBovina> razas = search == null || search.isBlank()
                ? razaRepository.findAllActive()
                : razaRepository.search(search);
        return razas.stream().map(this::toRazaResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AnimalDetalleResponse getAnimal(String id) {
        Animal animal = getActiveAnimal(id);
        AnimalPotrero assignment = animalPotreroRepository.findActiveByAnimalId(animal.getId()).orElse(null);
        return new AnimalDetalleResponse(
                toAnimalResponse(animal, assignment),
                movimientoRepository.findByAnimalId(id).stream().map(this::toMovimientoResponse).toList(),
                historialRepository.findByAnimalId(id).stream().map(this::toHistorialResponse).toList()
        );
    }

    @Override
    public AnimalResponse createAnimal(AnimalRequest request) {
        validateCaravanaForCreate(request.caravana());
        Potrero potrero = resolvePotreroForRequest(request.potreroId(), null, false);
        CatalogoRazaBovina raza = resolveRaza(request.razaId(), request.raza());
        Animal animal = Animal.builder()
                .caravana(request.caravana())
                .raza(raza.getNombre())
                .razaCatalogo(raza)
                .sexo(request.sexo())
                .fechaNacimiento(request.fechaNacimiento())
                .fechaCompra(request.fechaCompra())
                .pesoActualKg(request.pesoActualKg())
                .rfidCodigo(request.rfidCodigo())
                .qrCodigo(request.qrCodigo())
                .estado(request.estado() == null || request.estado().isBlank() ? "ACTIVO" : request.estado())
                .madre(resolveParent(request.madreId(), "madre"))
                .padre(resolveParent(request.padreId(), "padre"))
                .observaciones(request.observaciones())
                .build();
        Animal saved = animalRepository.save(animal);
        AnimalPotrero assignment = potrero == null ? null : assignInitialPotrero(saved, potrero, "Alta de animal", null, null);
        return toAnimalResponse(saved, assignment);
    }

    @Override
    public AnimalResponse updateAnimal(String id, AnimalRequest request) {
        Animal animal = getActiveAnimal(id);
        validateCaravanaForUpdate(request.caravana(), id);
        animal.setCaravana(request.caravana());
        CatalogoRazaBovina raza = resolveRaza(request.razaId(), request.raza());
        animal.setRaza(raza.getNombre());
        animal.setRazaCatalogo(raza);
        animal.setSexo(request.sexo());
        animal.setFechaNacimiento(request.fechaNacimiento());
        animal.setFechaCompra(request.fechaCompra());
        animal.setPesoActualKg(request.pesoActualKg());
        animal.setRfidCodigo(request.rfidCodigo());
        animal.setQrCodigo(request.qrCodigo());
        animal.setEstado(request.estado() == null || request.estado().isBlank() ? animal.getEstado() : request.estado());
        Potrero potrero = resolvePotreroForRequest(request.potreroId(), null, false);
        animal.setMadre(resolveParent(request.madreId(), "madre"));
        animal.setPadre(resolveParent(request.padreId(), "padre"));
        animal.setObservaciones(request.observaciones());
        preventSelfParent(animal);
        Animal saved = animalRepository.save(animal);
        AnimalPotrero assignment = potrero == null
                ? animalPotreroRepository.findActiveByAnimalId(saved.getId()).orElse(null)
                : moveAnimalToPotrero(saved, potrero, LocalDateTime.now(), "Actualizacion de animal", null, null, null);
        return toAnimalResponse(saved, assignment);
    }

    @Override
    public void deleteAnimal(String id) {
        Animal animal = getActiveAnimal(id);
        animal.softDelete();
        animalRepository.save(animal);
    }

    @Override
    public MovimientoAnimalResponse registrarMovimiento(MovimientoAnimalRequest request) {
        Animal animal = getActiveAnimal(request.animalId());
        AnimalPotrero activeAssignment = animalPotreroRepository.findActiveByAnimalId(animal.getId()).orElse(null);
        Potrero potreroOrigen = resolvePotreroOrigen(request.potreroOrigenId(), activeAssignment);
        Potrero potreroDestino = resolvePotreroForRequest(request.potreroDestinoId(), request.ubicacionDestino(), true);
        MovimientoAnimal movimiento = MovimientoAnimal.builder()
                .animal(animal)
                .fecha(request.fecha())
                .tipoMovimiento(request.tipoMovimiento())
                .potreroOrigen(potreroOrigen)
                .potreroDestino(potreroDestino)
                .ubicacionOrigen(potreroOrigen != null ? potreroOrigen.getNombre() : request.ubicacionOrigen())
                .ubicacionDestino(potreroDestino != null ? potreroDestino.getNombre() : request.ubicacionDestino())
                .motivo(request.motivo())
                .responsable(request.responsable())
                .observaciones(request.observaciones())
                .build();
        MovimientoAnimal saved = movimientoRepository.save(movimiento);
        if (potreroDestino != null) {
            moveAnimalToPotrero(animal, potreroDestino, request.fecha(), request.motivo(), request.responsable(), request.observaciones(), saved);
        }
        return toMovimientoResponse(saved);
    }

    @Override
    public HistorialMedicoAnimalResponse registrarHistorialMedico(HistorialMedicoAnimalRequest request) {
        Animal animal = getActiveAnimal(request.animalId());
        HistorialMedicoAnimal historial = HistorialMedicoAnimal.builder()
                .animal(animal)
                .fecha(request.fecha())
                .diagnostico(request.diagnostico())
                .tratamiento(request.tratamiento())
                .veterinario(request.veterinario())
                .observaciones(request.observaciones())
                .build();
        return toHistorialResponse(historialRepository.save(historial));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoAnimalResponse> getMovimientos(String animalId) {
        getActiveAnimal(animalId);
        return movimientoRepository.findByAnimalId(animalId).stream().map(this::toMovimientoResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistorialMedicoAnimalResponse> getHistorialMedico(String animalId) {
        getActiveAnimal(animalId);
        return historialRepository.findByAnimalId(animalId).stream().map(this::toHistorialResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public String exportarSenasaCsv(String estado) {
        List<Animal> animales = animalRepository.findFiltered(null, null, estado);
        Map<String, AnimalPotrero> assignments = activeAssignmentsByAnimalId(animales);
        StringBuilder csv = new StringBuilder("caravana,rfid,qr,raza,sexo,estado,potrero_actual,fecha_nacimiento,fecha_compra,peso_actual_kg,madre,padre\n");
        animales.forEach(animal -> {
            AnimalPotrero assignment = assignments.get(animal.getId());
            String ubicacion = assignment != null && assignment.getPotrero() != null ? assignment.getPotrero().getNombre() : null;
            csv.append(String.join(",",
                safe(animal.getCaravana()),
                safe(animal.getRfidCodigo()),
                safe(animal.getQrCodigo()),
                safe(animal.getRaza()),
                safe(animal.getSexo()),
                safe(animal.getEstado()),
                safe(ubicacion),
                safe(animal.getFechaNacimiento()),
                safe(animal.getFechaCompra()),
                safe(animal.getPesoActualKg()),
                animal.getMadre() != null ? safe(animal.getMadre().getCaravana()) : "",
                animal.getPadre() != null ? safe(animal.getPadre().getCaravana()) : ""
            )).append('\n');
        });
        return csv.toString();
    }

    private Animal getActiveAnimal(String id) {
        return animalRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal no encontrado"));
    }

    private Animal resolveParent(String id, String role) {
        if (id == null || id.isBlank()) {
            return null;
        }
        return animalRepository.findActiveById(id)
                .orElseThrow(() -> new BusinessException("No existe el animal asignado como " + role));
    }

    private void validateCaravanaForCreate(String caravana) {
        if (caravana == null || caravana.isBlank()) {
            throw new BusinessException("La caravana es obligatoria");
        }
        if (animalRepository.existsByCaravanaAndDeletedAtIsNull(caravana)) {
            throw new BusinessException("La caravana ya existe");
        }
    }

    private void validateCaravanaForUpdate(String caravana, String id) {
        if (caravana == null || caravana.isBlank()) {
            throw new BusinessException("La caravana es obligatoria");
        }
        if (animalRepository.existsByCaravanaAndIdNotAndDeletedAtIsNull(caravana, id)) {
            throw new BusinessException("La caravana ya existe");
        }
    }

    private void preventSelfParent(Animal animal) {
        if (animal.getMadre() != null && animal.getId().equals(animal.getMadre().getId())) {
            throw new BusinessException("Un animal no puede ser su propia madre");
        }
        if (animal.getPadre() != null && animal.getId().equals(animal.getPadre().getId())) {
            throw new BusinessException("Un animal no puede ser su propio padre");
        }
    }

    private AnimalResponse toAnimalResponse(Animal animal) {
        return toAnimalResponse(animal, animalPotreroRepository.findActiveByAnimalId(animal.getId()).orElse(null));
    }

    private AnimalResponse toAnimalResponse(Animal animal, AnimalPotrero assignment) {
        String potreroId = assignment != null && assignment.getPotrero() != null ? assignment.getPotrero().getId() : null;
        String potreroNombre = assignment != null && assignment.getPotrero() != null ? assignment.getPotrero().getNombre() : null;
        return new AnimalResponse(
                animal.getId(),
                animal.getCaravana(),
                animal.getRazaCatalogo() != null ? animal.getRazaCatalogo().getId() : null,
                animal.getRaza(),
                animal.getSexo(),
                animal.getFechaNacimiento(),
                animal.getFechaCompra(),
                animal.getPesoActualKg(),
                animal.getRfidCodigo(),
                animal.getQrCodigo(),
                animal.getEstado(),
                potreroId,
                potreroNombre,
                animal.getMadre() != null ? animal.getMadre().getId() : null,
                animal.getMadre() != null ? animal.getMadre().getCaravana() : null,
                animal.getPadre() != null ? animal.getPadre().getId() : null,
                animal.getPadre() != null ? animal.getPadre().getCaravana() : null,
                animal.getObservaciones(),
                animal.getCreatedAt(),
                animal.getUpdatedAt()
        );
    }

    private MovimientoAnimalResponse toMovimientoResponse(MovimientoAnimal movimiento) {
        return new MovimientoAnimalResponse(
                movimiento.getId(),
                movimiento.getAnimal().getId(),
                movimiento.getAnimal().getCaravana(),
                movimiento.getFecha(),
                movimiento.getTipoMovimiento(),
                movimiento.getPotreroOrigen() != null ? movimiento.getPotreroOrigen().getId() : null,
                movimiento.getPotreroDestino() != null ? movimiento.getPotreroDestino().getId() : null,
                movimiento.getPotreroOrigen() != null ? movimiento.getPotreroOrigen().getNombre() : movimiento.getUbicacionOrigen(),
                movimiento.getPotreroDestino() != null ? movimiento.getPotreroDestino().getNombre() : movimiento.getUbicacionDestino(),
                movimiento.getMotivo(),
                movimiento.getResponsable(),
                movimiento.getObservaciones(),
                movimiento.getCreatedAt()
        );
    }

    private HistorialMedicoAnimalResponse toHistorialResponse(HistorialMedicoAnimal historial) {
        return new HistorialMedicoAnimalResponse(
                historial.getId(),
                historial.getAnimal().getId(),
                historial.getAnimal().getCaravana(),
                historial.getFecha(),
                historial.getDiagnostico(),
                historial.getTratamiento(),
                historial.getVeterinario(),
                historial.getObservaciones(),
                historial.getCreatedAt()
        );
    }

    private String safe(Object value) {
        return value == null ? "" : String.valueOf(value).replace(",", " ");
    }

    private Map<String, AnimalPotrero> activeAssignmentsByAnimalId(List<Animal> animals) {
        List<String> ids = animals.stream().map(Animal::getId).toList();
        if (ids.isEmpty()) {
            return Map.of();
        }
        return animalPotreroRepository.findActiveByAnimalIds(ids).stream()
                .collect(Collectors.toMap(ap -> ap.getAnimal().getId(), Function.identity(), (left, right) -> left));
    }

    private boolean matchesUbicacion(AnimalResponse response, String ubicacion) {
        if (ubicacion == null || ubicacion.isBlank()) {
            return true;
        }
        String needle = ubicacion.toLowerCase(Locale.ROOT);
        return containsIgnoreCase(response.potreroNombre(), needle);
    }

    private boolean containsIgnoreCase(String value, String needle) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(needle);
    }

    private CatalogoRazaBovina resolveRaza(String razaId, String razaNombre) {
        if (razaId != null && !razaId.isBlank()) {
            return razaRepository.findByIdAndDeletedAtIsNullAndActivoTrue(razaId)
                    .orElseThrow(() -> new BusinessException("No existe la raza bovina indicada"));
        }
        if (razaNombre == null || razaNombre.isBlank()) {
            throw new BusinessException("La raza es obligatoria");
        }
        String normalized = normalizeCatalogValue(razaNombre);
        return razaRepository.findAllActive().stream()
                .filter(raza -> normalizeCatalogValue(raza.getNombre()).equals(normalized)
                        || normalizeCatalogValue(raza.getCodigo()).equals(normalized))
                .findFirst()
                .orElseThrow(() -> new BusinessException("La raza indicada no existe en el catalogo de razas bovinas"));
    }

    private String normalizeCatalogValue(String value) {
        return value == null ? "" : value.trim().replaceAll("[\\s-]+", "_").toLowerCase(Locale.ROOT);
    }

    private CatalogoRazaBovinaResponse toRazaResponse(CatalogoRazaBovina raza) {
        return new CatalogoRazaBovinaResponse(
                raza.getId(),
                raza.getCodigo(),
                raza.getNombre(),
                raza.getEspecie(),
                raza.getAptitud(),
                raza.getTipoGenetico(),
                raza.getOrigen(),
                raza.getDescripcion(),
                raza.getFuente(),
                raza.getActivo(),
                raza.getUpdatedAt()
        );
    }

    private Potrero resolvePotreroOrigen(String potreroOrigenId, AnimalPotrero activeAssignment) {
        if (potreroOrigenId != null && !potreroOrigenId.isBlank()) {
            return potreroRepository.findActiveById(potreroOrigenId)
                    .orElseThrow(() -> new BusinessException("No existe el potrero de origen"));
        }
        return activeAssignment == null ? null : activeAssignment.getPotrero();
    }

    private Potrero resolvePotreroForRequest(String potreroId, String legacyName, boolean requiredWhenLegacyProvided) {
        if (potreroId != null && !potreroId.isBlank()) {
            return potreroRepository.findActiveById(potreroId)
                    .orElseThrow(() -> new BusinessException("No existe el potrero indicado"));
        }
        if (legacyName == null || legacyName.isBlank()) {
            return null;
        }
        Optional<Potrero> potrero = findPotreroByLegacyName(legacyName);
        if (potrero.isPresent()) {
            return potrero.get();
        }
        if (requiredWhenLegacyProvided) {
            throw new BusinessException("La ubicacion indicada no corresponde a un potrero registrado");
        }
        return null;
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

    private AnimalPotrero assignInitialPotrero(Animal animal, Potrero potrero, String motivo, String responsable, String observaciones) {
        return animalPotreroRepository.save(AnimalPotrero.builder()
                .animal(animal)
                .potrero(potrero)
                .fechaDesde(LocalDateTime.now())
                .activo(true)
                .motivo(motivo)
                .responsable(responsable)
                .observaciones(observaciones)
                .build());
    }

    private AnimalPotrero moveAnimalToPotrero(Animal animal, Potrero potrero, LocalDateTime fecha, String motivo, String responsable, String observaciones, MovimientoAnimal movimiento) {
        AnimalPotrero current = animalPotreroRepository.findActiveByAnimalId(animal.getId()).orElse(null);
        if (current != null && current.getPotrero() != null && current.getPotrero().getId().equals(potrero.getId())) {
            return current;
        }
        if (current != null) {
            current.setActivo(false);
            current.setFechaHasta(fecha == null ? LocalDateTime.now() : fecha);
            animalPotreroRepository.save(current);
        }
        return animalPotreroRepository.save(AnimalPotrero.builder()
                .animal(animal)
                .potrero(potrero)
                .fechaDesde(fecha == null ? LocalDateTime.now() : fecha)
                .activo(true)
                .motivo(motivo)
                .responsable(responsable)
                .movimiento(movimiento)
                .observaciones(observaciones)
                .build());
    }
}
