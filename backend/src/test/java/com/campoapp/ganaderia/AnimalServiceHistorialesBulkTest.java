package com.campoapp.ganaderia;

import com.campoapp.ganaderia.dto.HistorialMedicoAnimalResponse;
import com.campoapp.ganaderia.dto.MovimientoAnimalResponse;
import com.campoapp.ganaderia.entity.Animal;
import com.campoapp.ganaderia.entity.HistorialMedicoAnimal;
import com.campoapp.ganaderia.entity.MovimientoAnimal;
import com.campoapp.ganaderia.entity.Potrero;
import com.campoapp.ganaderia.repository.AnimalPotreroRepository;
import com.campoapp.ganaderia.repository.AnimalRepository;
import com.campoapp.ganaderia.repository.CatalogoRazaBovinaRepository;
import com.campoapp.ganaderia.repository.HistorialMedicoAnimalRepository;
import com.campoapp.ganaderia.repository.MovimientoAnimalRepository;
import com.campoapp.ganaderia.repository.PotreroRepository;
import com.campoapp.ganaderia.service.impl.AnimalServiceImpl;
import com.campoapp.ganaderia.service.impl.OperarioNombreResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests de los listados bulk de movimientos e historial medico (replica offline de mobile):
 * animalId opcional pasado al repository, normalizacion de blancos y mapeo con nombres
 * de operarios resueltos en batch.
 */
@ExtendWith(MockitoExtension.class)
class AnimalServiceHistorialesBulkTest {

    @Mock private AnimalRepository animalRepository;
    @Mock private MovimientoAnimalRepository movimientoRepository;
    @Mock private HistorialMedicoAnimalRepository historialRepository;
    @Mock private PotreroRepository potreroRepository;
    @Mock private AnimalPotreroRepository animalPotreroRepository;
    @Mock private CatalogoRazaBovinaRepository razaRepository;
    @Mock private OperarioNombreResolver operarioNombreResolver;

    @InjectMocks
    private AnimalServiceImpl animalService;

    @BeforeEach
    void setUpResolver() {
        // Replica la regla real del resolver: si el valor crudo esta en el mapa devuelve el
        // nombre resuelto, si no devuelve el valor crudo tal cual (texto libre o vacio).
        lenient().when(operarioNombreResolver.resolver(any(), anyMap())).thenAnswer(invocation -> {
            String valorCrudo = invocation.getArgument(0);
            Map<String, String> nombres = invocation.getArgument(1);
            return valorCrudo == null || valorCrudo.isBlank() ? valorCrudo : nombres.getOrDefault(valorCrudo, valorCrudo);
        });
    }

    private Animal animal(String id, String caravana) {
        Animal animal = Animal.builder()
                .caravana(caravana)
                .raza("Angus")
                .sexo("HEMBRA")
                .estado("ACTIVO")
                .build();
        animal.setId(id);
        return animal;
    }

    private Potrero potrero(String id, String nombre) {
        Potrero potrero = new Potrero();
        potrero.setId(id);
        potrero.setNombre(nombre);
        return potrero;
    }

    private MovimientoAnimal movimiento(String id, Animal animal, Potrero origen, Potrero destino, String responsable) {
        MovimientoAnimal movimiento = MovimientoAnimal.builder()
                .animal(animal)
                .fecha(LocalDateTime.of(2026, 7, 10, 9, 0))
                .tipoMovimiento(MovimientoAnimal.TipoMovimiento.TRANSFERENCIA)
                .potreroOrigen(origen)
                .potreroDestino(destino)
                .motivo("Rotacion")
                .responsable(responsable)
                .build();
        movimiento.setId(id);
        return movimiento;
    }

    private HistorialMedicoAnimal historial(String id, Animal animal, String veterinario) {
        HistorialMedicoAnimal historial = HistorialMedicoAnimal.builder()
                .animal(animal)
                .fecha(LocalDate.of(2026, 7, 12))
                .diagnostico("Aftosa")
                .tratamiento("Vacuna")
                .veterinario(veterinario)
                .build();
        historial.setId(id);
        return historial;
    }

    @Test
    void shouldListAllMovimientosResolvingNamesInBatch() {
        Animal a1 = animal("animal-1", "RP-001");
        Animal a2 = animal("animal-2", "RP-002");
        Potrero norte = potrero("potrero-1", "Potrero Norte");
        Potrero sur = potrero("potrero-2", "Potrero Sur");
        MovimientoAnimal m1 = movimiento("mov-1", a1, norte, sur, "op-1");
        MovimientoAnimal m2 = movimiento("mov-2", a2, null, norte, "Texto libre");
        m2.setUbicacionOrigen("Campo viejo");

        when(movimientoRepository.findFiltered(isNull())).thenReturn(List.of(m1, m2));
        when(operarioNombreResolver.resolverNombres(anyCollection())).thenReturn(Map.of("op-1", "Juan Perez"));

        List<MovimientoAnimalResponse> result = animalService.listMovimientos(null);

        assertThat(result).hasSize(2);
        MovimientoAnimalResponse first = result.get(0);
        assertThat(first.id()).isEqualTo("mov-1");
        assertThat(first.animalId()).isEqualTo("animal-1");
        assertThat(first.animalCaravana()).isEqualTo("RP-001");
        assertThat(first.potreroOrigenNombre()).isEqualTo("Potrero Norte");
        assertThat(first.potreroDestinoNombre()).isEqualTo("Potrero Sur");
        // El responsable con id de operario se resuelve al nombre completo via batch.
        assertThat(first.responsable()).isEqualTo("op-1");
        assertThat(first.responsableNombre()).isEqualTo("Juan Perez");

        MovimientoAnimalResponse second = result.get(1);
        assertThat(second.animalId()).isEqualTo("animal-2");
        // Sin potrero de origen: fallback a la ubicacion texto libre legacy.
        assertThat(second.potreroOrigenNombre()).isEqualTo("Campo viejo");
        assertThat(second.potreroDestinoNombre()).isEqualTo("Potrero Norte");
        // El responsable texto libre queda tal cual.
        assertThat(second.responsableNombre()).isEqualTo("Texto libre");

        // Un solo lookup batch de nombres para toda la lista (sin N+1).
        verify(operarioNombreResolver).resolverNombres(List.of("op-1", "Texto libre"));
        verify(movimientoRepository).findFiltered(isNull());
    }

    @Test
    void shouldFilterMovimientosByAnimalId() {
        Animal a1 = animal("animal-1", "RP-001");
        when(movimientoRepository.findFiltered("animal-1"))
                .thenReturn(List.of(movimiento("mov-1", a1, null, null, null)));
        when(operarioNombreResolver.resolverNombres(anyCollection())).thenReturn(Map.of());

        List<MovimientoAnimalResponse> result = animalService.listMovimientos("animal-1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).animalId()).isEqualTo("animal-1");
        verify(movimientoRepository).findFiltered("animal-1");
    }

    @Test
    void shouldNormalizeBlankAnimalIdToNullOnMovimientos() {
        when(movimientoRepository.findFiltered(isNull())).thenReturn(List.of());
        when(operarioNombreResolver.resolverNombres(anyCollection())).thenReturn(Map.of());

        List<MovimientoAnimalResponse> result = animalService.listMovimientos("   ");

        assertThat(result).isEmpty();
        verify(movimientoRepository).findFiltered(isNull());
    }

    @Test
    void shouldListAllHistorialMedicoResolvingNamesInBatch() {
        Animal a1 = animal("animal-1", "RP-001");
        Animal a2 = animal("animal-2", "RP-002");
        HistorialMedicoAnimal h1 = historial("hist-1", a1, "op-2");
        HistorialMedicoAnimal h2 = historial("hist-2", a2, "Dra. externa");

        when(historialRepository.findFiltered(isNull())).thenReturn(List.of(h1, h2));
        when(operarioNombreResolver.resolverNombres(anyCollection())).thenReturn(Map.of("op-2", "Ana Gomez"));

        List<HistorialMedicoAnimalResponse> result = animalService.listHistorialMedico(null);

        assertThat(result).hasSize(2);
        HistorialMedicoAnimalResponse first = result.get(0);
        assertThat(first.id()).isEqualTo("hist-1");
        assertThat(first.animalId()).isEqualTo("animal-1");
        assertThat(first.animalCaravana()).isEqualTo("RP-001");
        assertThat(first.diagnostico()).isEqualTo("Aftosa");
        // El veterinario con id de operario se resuelve al nombre completo via batch.
        assertThat(first.veterinario()).isEqualTo("op-2");
        assertThat(first.veterinarioNombre()).isEqualTo("Ana Gomez");

        // El veterinario texto libre queda tal cual.
        assertThat(result.get(1).veterinarioNombre()).isEqualTo("Dra. externa");

        verify(operarioNombreResolver).resolverNombres(List.of("op-2", "Dra. externa"));
        verify(historialRepository).findFiltered(isNull());
    }

    @Test
    void shouldFilterHistorialMedicoByAnimalId() {
        Animal a2 = animal("animal-2", "RP-002");
        when(historialRepository.findFiltered("animal-2"))
                .thenReturn(List.of(historial("hist-2", a2, null)));
        when(operarioNombreResolver.resolverNombres(anyCollection())).thenReturn(Map.of());

        List<HistorialMedicoAnimalResponse> result = animalService.listHistorialMedico("animal-2");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).animalId()).isEqualTo("animal-2");
        verify(historialRepository).findFiltered("animal-2");
    }
}
