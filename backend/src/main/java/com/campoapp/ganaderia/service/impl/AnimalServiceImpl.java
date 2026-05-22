package com.campoapp.ganaderia.service.impl;

import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.ganaderia.dto.*;
import com.campoapp.ganaderia.entity.Animal;
import com.campoapp.ganaderia.entity.HistorialMedicoAnimal;
import com.campoapp.ganaderia.entity.MovimientoAnimal;
import com.campoapp.ganaderia.repository.AnimalRepository;
import com.campoapp.ganaderia.repository.HistorialMedicoAnimalRepository;
import com.campoapp.ganaderia.repository.MovimientoAnimalRepository;
import com.campoapp.ganaderia.service.AnimalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AnimalServiceImpl implements AnimalService {

    private final AnimalRepository animalRepository;
    private final MovimientoAnimalRepository movimientoRepository;
    private final HistorialMedicoAnimalRepository historialRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AnimalResponse> listAnimales(String caravana, String raza, String ubicacion, String estado) {
        return animalRepository.findFiltered(caravana, raza, ubicacion, estado).stream().map(this::toAnimalResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AnimalDetalleResponse getAnimal(String id) {
        Animal animal = getActiveAnimal(id);
        return new AnimalDetalleResponse(
                toAnimalResponse(animal),
                movimientoRepository.findByAnimalId(id).stream().map(this::toMovimientoResponse).toList(),
                historialRepository.findByAnimalId(id).stream().map(this::toHistorialResponse).toList()
        );
    }

    @Override
    public AnimalResponse createAnimal(AnimalRequest request) {
        validateCaravanaForCreate(request.caravana());
        Animal animal = Animal.builder()
                .caravana(request.caravana())
                .raza(request.raza())
                .sexo(request.sexo())
                .fechaNacimiento(request.fechaNacimiento())
                .fechaCompra(request.fechaCompra())
                .pesoActualKg(request.pesoActualKg())
                .rfidCodigo(request.rfidCodigo())
                .qrCodigo(request.qrCodigo())
                .estado(request.estado() == null || request.estado().isBlank() ? "ACTIVO" : request.estado())
                .ubicacionActual(request.ubicacionActual())
                .madre(resolveParent(request.madreId(), "madre"))
                .padre(resolveParent(request.padreId(), "padre"))
                .observaciones(request.observaciones())
                .build();
        return toAnimalResponse(animalRepository.save(animal));
    }

    @Override
    public AnimalResponse updateAnimal(String id, AnimalRequest request) {
        Animal animal = getActiveAnimal(id);
        validateCaravanaForUpdate(request.caravana(), id);
        animal.setCaravana(request.caravana());
        animal.setRaza(request.raza());
        animal.setSexo(request.sexo());
        animal.setFechaNacimiento(request.fechaNacimiento());
        animal.setFechaCompra(request.fechaCompra());
        animal.setPesoActualKg(request.pesoActualKg());
        animal.setRfidCodigo(request.rfidCodigo());
        animal.setQrCodigo(request.qrCodigo());
        animal.setEstado(request.estado() == null || request.estado().isBlank() ? animal.getEstado() : request.estado());
        animal.setUbicacionActual(request.ubicacionActual());
        animal.setMadre(resolveParent(request.madreId(), "madre"));
        animal.setPadre(resolveParent(request.padreId(), "padre"));
        animal.setObservaciones(request.observaciones());
        preventSelfParent(animal);
        return toAnimalResponse(animalRepository.save(animal));
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
        MovimientoAnimal movimiento = MovimientoAnimal.builder()
                .animal(animal)
                .fecha(request.fecha())
                .tipoMovimiento(request.tipoMovimiento())
                .ubicacionOrigen(request.ubicacionOrigen())
                .ubicacionDestino(request.ubicacionDestino())
                .motivo(request.motivo())
                .responsable(request.responsable())
                .observaciones(request.observaciones())
                .build();
        if (request.ubicacionDestino() != null && !request.ubicacionDestino().isBlank()) {
            animal.setUbicacionActual(request.ubicacionDestino());
            animalRepository.save(animal);
        }
        return toMovimientoResponse(movimientoRepository.save(movimiento));
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
        List<Animal> animales = animalRepository.findFiltered(null, null, null, estado);
        StringBuilder csv = new StringBuilder("caravana,rfid,qr,raza,sexo,estado,ubicacion_actual,fecha_nacimiento,fecha_compra,peso_actual_kg,madre,padre\n");
        animales.forEach(animal -> csv.append(String.join(",",
                safe(animal.getCaravana()),
                safe(animal.getRfidCodigo()),
                safe(animal.getQrCodigo()),
                safe(animal.getRaza()),
                safe(animal.getSexo()),
                safe(animal.getEstado()),
                safe(animal.getUbicacionActual()),
                safe(animal.getFechaNacimiento()),
                safe(animal.getFechaCompra()),
                safe(animal.getPesoActualKg()),
                animal.getMadre() != null ? safe(animal.getMadre().getCaravana()) : "",
                animal.getPadre() != null ? safe(animal.getPadre().getCaravana()) : ""
        )).append('\n'));
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
        if (animalRepository.existsByCaravanaAndDeletedAtIsNull(caravana)) {
            throw new BusinessException("La caravana ya existe");
        }
    }

    private void validateCaravanaForUpdate(String caravana, String id) {
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
        return new AnimalResponse(
                animal.getId(),
                animal.getCaravana(),
                animal.getRaza(),
                animal.getSexo(),
                animal.getFechaNacimiento(),
                animal.getFechaCompra(),
                animal.getPesoActualKg(),
                animal.getRfidCodigo(),
                animal.getQrCodigo(),
                animal.getEstado(),
                animal.getUbicacionActual(),
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
                movimiento.getUbicacionOrigen(),
                movimiento.getUbicacionDestino(),
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
}
