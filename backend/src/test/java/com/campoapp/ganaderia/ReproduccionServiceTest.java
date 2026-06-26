package com.campoapp.ganaderia;

import com.campoapp.common.exception.BusinessException;
import com.campoapp.ganaderia.dto.MontaRequest;
import com.campoapp.ganaderia.entity.Animal;
import com.campoapp.ganaderia.repository.*;
import com.campoapp.ganaderia.service.impl.ReproduccionServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReproduccionServiceTest {
    @Mock private AnimalRepository animalRepository;
    @Mock private MontaRepository montaRepository;
    @Mock private InseminacionRepository inseminacionRepository;
    @Mock private ControlPrenezRepository controlPrenezRepository;
    @Mock private PartoRepository partoRepository;
    @Mock private IndiceGeneticoRepository indiceGeneticoRepository;

    @InjectMocks
    private ReproduccionServiceImpl reproduccionService;

    @Test
    void shouldRejectMontaWhenCowIsMale() {
        Animal vaca = animal("vaca-1", "C001", "MACHO");
        Animal toro = animal("toro-1", "T001", "MACHO");
        when(animalRepository.findActiveById("vaca-1")).thenReturn(Optional.of(vaca));
        when(animalRepository.findActiveById("toro-1")).thenReturn(Optional.of(toro));

        MontaRequest request = new MontaRequest("vaca-1", "toro-1", LocalDate.now(), "PENDIENTE", null);

        assertThatThrownBy(() -> reproduccionService.registrarMonta(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("hembra");
    }

    @Test
    void shouldNotRecommendDirectParentCrossing() {
        Animal madre = animal("madre-1", "M001", "HEMBRA");
        Animal hijo = animal("hijo-1", "H001", "MACHO");
        hijo.setMadre(madre);
        when(animalRepository.findFiltered(null, null, "ACTIVO")).thenReturn(List.of(madre, hijo));
        when(indiceGeneticoRepository.findAllActive()).thenReturn(List.of());

        assertThat(reproduccionService.getRecomendaciones()).isEmpty();
    }

    @Test
    void shouldAcceptSpanishFrontendSexValues() {
        Animal vaca = animal("vaca-1", "C001", "Femenino");
        Animal toro = animal("toro-1", "T001", "Masculino");
        when(animalRepository.findActiveById("vaca-1")).thenReturn(Optional.of(vaca));
        when(animalRepository.findActiveById("toro-1")).thenReturn(Optional.of(toro));
        when(montaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        MontaRequest request = new MontaRequest("vaca-1", "toro-1", LocalDate.now(), "PENDIENTE", null);

        assertThatCode(() -> reproduccionService.registrarMonta(request)).doesNotThrowAnyException();
    }

    @Test
    void shouldReturnOnlyThreeDescendantGenerations() {
        Animal vaca = animal("vaca-1", "V001", "Femenino");
        Animal hija = animal("hija-1", "H001", "Femenino");
        Animal nieto = animal("nieto-1", "N001", "Masculino");
        Animal bisnieta = animal("bisnieta-1", "B001", "Femenino");
        Animal cuarta = animal("cuarta-1", "Q001", "Femenino");
        hija.setMadre(vaca);
        nieto.setMadre(hija);
        bisnieta.setMadre(nieto);
        cuarta.setMadre(bisnieta);
        when(animalRepository.findActiveById("vaca-1")).thenReturn(Optional.of(vaca));
        when(animalRepository.findFiltered(null, null, "ACTIVO")).thenReturn(List.of(vaca, hija, nieto, bisnieta, cuarta));

        var genealogia = reproduccionService.getGenealogia("vaca-1");

        assertThat(genealogia.animal().caravana()).isEqualTo("V001");
        assertThat(genealogia.animal().hijos()).extracting("caravana").containsExactly("H001");
        assertThat(genealogia.animal().hijos().get(0).hijos()).extracting("caravana").containsExactly("N001");
        assertThat(genealogia.animal().hijos().get(0).hijos().get(0).hijos()).extracting("caravana").containsExactly("B001");
        assertThat(genealogia.animal().hijos().get(0).hijos().get(0).hijos().get(0).hijos()).isEmpty();
    }

    @Test
    void shouldReturnParentsGrandparentsAndGreatGrandparents() {
        Animal bisabuela = animal("bisabuela-1", "11111", "Femenino");
        Animal abuela = animal("abuela-1", "22222", "Femenino");
        Animal madre = animal("madre-1", "33333", "Femenino");
        Animal padre = animal("padre-1", "44444", "Masculino");
        Animal ternero = animal("ternero-1", "55555", "Masculino");
        abuela.setMadre(bisabuela);
        madre.setMadre(abuela);
        ternero.setMadre(madre);
        ternero.setPadre(padre);
        when(animalRepository.findActiveById("ternero-1")).thenReturn(Optional.of(ternero));
        when(animalRepository.findFiltered(null, null, "ACTIVO")).thenReturn(List.of(bisabuela, abuela, madre, padre, ternero));

        var genealogia = reproduccionService.getGenealogia("ternero-1");

        assertThat(genealogia.animal().caravana()).isEqualTo("55555");
        assertThat(genealogia.ancestros())
                .filteredOn(node -> node.generacion() == 1)
                .extracting("caravana")
                .containsExactlyInAnyOrder("33333", "44444");
        assertThat(genealogia.ancestros())
                .filteredOn(node -> node.generacion() == 2)
                .extracting("caravana")
                .containsExactly("22222");
        assertThat(genealogia.ancestros())
                .filteredOn(node -> node.generacion() == 3)
                .extracting("caravana")
                .containsExactly("11111");
    }

    private Animal animal(String id, String caravana, String sexo) {
        Animal animal = Animal.builder()
                .caravana(caravana)
                .raza("ANGUS")
                .sexo(sexo)
                .estado("ACTIVO")
                .build();
        animal.setId(id);
        return animal;
    }
}
