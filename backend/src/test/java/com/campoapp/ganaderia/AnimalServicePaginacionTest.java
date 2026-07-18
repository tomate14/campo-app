package com.campoapp.ganaderia;

import com.campoapp.ganaderia.dto.AnimalResponse;
import com.campoapp.ganaderia.entity.Animal;
import com.campoapp.ganaderia.entity.AnimalPotrero;
import com.campoapp.ganaderia.entity.Potrero;
import com.campoapp.ganaderia.repository.AnimalPotreroRepository;
import com.campoapp.ganaderia.repository.AnimalRepository;
import com.campoapp.ganaderia.repository.CatalogoRazaBovinaRepository;
import com.campoapp.ganaderia.repository.HistorialMedicoAnimalRepository;
import com.campoapp.ganaderia.repository.MovimientoAnimalRepository;
import com.campoapp.ganaderia.repository.PotreroRepository;
import com.campoapp.ganaderia.service.impl.AnimalServiceImpl;
import com.campoapp.ganaderia.service.impl.OperarioNombreResolver;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests del listado paginado de animales: paso de filtros al repository,
 * normalizacion de paginado y mapeo de la pagina a AnimalResponse.
 */
@ExtendWith(MockitoExtension.class)
class AnimalServicePaginacionTest {

    @Mock private AnimalRepository animalRepository;
    @Mock private MovimientoAnimalRepository movimientoRepository;
    @Mock private HistorialMedicoAnimalRepository historialRepository;
    @Mock private PotreroRepository potreroRepository;
    @Mock private AnimalPotreroRepository animalPotreroRepository;
    @Mock private CatalogoRazaBovinaRepository razaRepository;
    @Mock private OperarioNombreResolver operarioNombreResolver;

    @InjectMocks
    private AnimalServiceImpl animalService;

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

    private AnimalPotrero assignment(Animal animal, Potrero potrero) {
        AnimalPotrero assignment = AnimalPotrero.builder()
                .animal(animal)
                .potrero(potrero)
                .activo(true)
                .build();
        assignment.setId("ap-" + animal.getId());
        return assignment;
    }

    @Test
    void shouldPassFiltersToRepositoryAndMapPage() {
        Animal madre = animal("animal-9", "RP-900");
        Animal a1 = animal("animal-1", "RP-001");
        a1.setMadre(madre);
        Animal a2 = animal("animal-2", "RP-002");
        Potrero potrero = potrero("potrero-1", "Potrero Norte");
        Page<Animal> repoPage = new PageImpl<>(List.of(a1, a2), PageRequest.of(0, 20), 45);

        when(animalRepository.findFilteredPage(eq("RP"), eq("potrero-1"), eq("ACTIVO"), any(Pageable.class)))
                .thenReturn(repoPage);
        when(animalPotreroRepository.findActiveByAnimalIds(List.of("animal-1", "animal-2")))
                .thenReturn(List.of(assignment(a1, potrero)));

        Page<AnimalResponse> result = animalService.listAnimalesPaginados("RP", "potrero-1", "ACTIVO", 0, 20);

        // El wrapper de pagina conserva los totales del repository.
        assertThat(result.getTotalElements()).isEqualTo(45);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getNumber()).isZero();
        assertThat(result.getSize()).isEqualTo(20);
        assertThat(result.getContent()).hasSize(2);

        // El primer animal tiene asignacion activa: potreroId/potreroNombre llenos.
        AnimalResponse first = result.getContent().get(0);
        assertThat(first.id()).isEqualTo("animal-1");
        assertThat(first.caravana()).isEqualTo("RP-001");
        assertThat(first.potreroId()).isEqualTo("potrero-1");
        assertThat(first.potreroNombre()).isEqualTo("Potrero Norte");
        assertThat(first.madreCaravana()).isEqualTo("RP-900");

        // El segundo no tiene asignacion: potrero nulo.
        AnimalResponse second = result.getContent().get(1);
        assertThat(second.id()).isEqualTo("animal-2");
        assertThat(second.potreroId()).isNull();
        assertThat(second.potreroNombre()).isNull();

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(animalRepository).findFilteredPage(eq("RP"), eq("potrero-1"), eq("ACTIVO"), pageableCaptor.capture());
        assertThat(pageableCaptor.getValue().getPageNumber()).isZero();
        assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(20);
    }

    @Test
    void shouldNormalizeBlankFiltersToNull() {
        when(animalRepository.findFilteredPage(isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(Page.empty(PageRequest.of(0, 20)));

        Page<AnimalResponse> result = animalService.listAnimalesPaginados("  ", "", null, 0, 20);

        assertThat(result.getContent()).isEmpty();
        verify(animalRepository).findFilteredPage(isNull(), isNull(), isNull(), any(Pageable.class));
    }

    @Test
    void shouldNormalizePageAndSizeOutOfRange() {
        when(animalRepository.findFilteredPage(isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(Page.empty(PageRequest.of(0, 100)));

        animalService.listAnimalesPaginados(null, null, null, -3, 500);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(animalRepository).findFilteredPage(isNull(), isNull(), isNull(), pageableCaptor.capture());
        // page negativo se lleva a 0 y size se acota a 100, igual que en sanidad.
        assertThat(pageableCaptor.getValue().getPageNumber()).isZero();
        assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(100);
    }
}
