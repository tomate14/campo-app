package com.campoapp.ganaderia;

import com.campoapp.ganaderia.dto.AplicacionVacunaResponse;
import com.campoapp.ganaderia.dto.MovimientoAnimalResponse;
import com.campoapp.ganaderia.dto.PesajeResponse;
import com.campoapp.ganaderia.entity.Animal;
import com.campoapp.ganaderia.entity.AplicacionVacuna;
import com.campoapp.ganaderia.entity.MovimientoAnimal;
import com.campoapp.ganaderia.entity.PesajeAnimal;
import com.campoapp.ganaderia.entity.Potrero;
import com.campoapp.ganaderia.entity.VacunaCatalogo;
import com.campoapp.ganaderia.repository.AnimalPotreroRepository;
import com.campoapp.ganaderia.repository.AnimalRepository;
import com.campoapp.ganaderia.repository.AplicacionVacunaRepository;
import com.campoapp.ganaderia.repository.CatalogoRazaBovinaRepository;
import com.campoapp.ganaderia.repository.DiagnosticoSanitarioRepository;
import com.campoapp.ganaderia.repository.DietaIngredienteRepository;
import com.campoapp.ganaderia.repository.DietaNutricionalRepository;
import com.campoapp.ganaderia.repository.HistorialMedicoAnimalRepository;
import com.campoapp.ganaderia.repository.MovimientoAnimalRepository;
import com.campoapp.ganaderia.repository.PesajeAnimalRepository;
import com.campoapp.ganaderia.repository.PotreroRepository;
import com.campoapp.ganaderia.repository.RegistroAlimentacionRepository;
import com.campoapp.ganaderia.repository.TratamientoMedicamentoRepository;
import com.campoapp.ganaderia.repository.VacunaCatalogoRepository;
import com.campoapp.ganaderia.service.impl.AlimentacionServiceImpl;
import com.campoapp.ganaderia.service.impl.AnimalServiceImpl;
import com.campoapp.ganaderia.service.impl.OperarioNombreResolver;
import com.campoapp.ganaderia.service.impl.SanidadServiceImpl;
import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.repository.OperarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests de la feature 51: resolucion de nombres de operarios y potreros en los
 * historiales de ganaderia. Cubre: id de operario resuelto a nombre completo,
 * texto libre devuelto tal cual, potrero id -> nombre en movimientos y lookup
 * batch (un solo findAllById por listado, sin N+1).
 */
@ExtendWith(MockitoExtension.class)
class HistorialNombresOperarioTest {

    @Mock private AnimalRepository animalRepository;
    @Mock private MovimientoAnimalRepository movimientoRepository;
    @Mock private HistorialMedicoAnimalRepository historialRepository;
    @Mock private PotreroRepository potreroRepository;
    @Mock private AnimalPotreroRepository animalPotreroRepository;
    @Mock private CatalogoRazaBovinaRepository razaRepository;
    @Mock private OperarioRepository operarioRepository;
    @Mock private VacunaCatalogoRepository vacunaCatalogoRepository;
    @Mock private AplicacionVacunaRepository aplicacionVacunaRepository;
    @Mock private TratamientoMedicamentoRepository tratamientoMedicamentoRepository;
    @Mock private DiagnosticoSanitarioRepository diagnosticoSanitarioRepository;
    @Mock private DietaNutricionalRepository dietaRepository;
    @Mock private DietaIngredienteRepository ingredienteRepository;
    @Mock private RegistroAlimentacionRepository registroRepository;
    @Mock private PesajeAnimalRepository pesajeRepository;

    private AnimalServiceImpl animalService;
    private SanidadServiceImpl sanidadService;
    private AlimentacionServiceImpl alimentacionService;

    @BeforeEach
    void setUp() {
        // Resolver real con repository mockeado para verificar tambien el comportamiento batch.
        OperarioNombreResolver resolver = new OperarioNombreResolver(operarioRepository);
        animalService = new AnimalServiceImpl(animalRepository, movimientoRepository, historialRepository,
                potreroRepository, animalPotreroRepository, razaRepository, resolver);
        sanidadService = new SanidadServiceImpl(animalRepository, vacunaCatalogoRepository,
                aplicacionVacunaRepository, tratamientoMedicamentoRepository, diagnosticoSanitarioRepository, resolver);
        alimentacionService = new AlimentacionServiceImpl(animalRepository, dietaRepository, ingredienteRepository,
                registroRepository, pesajeRepository, potreroRepository, resolver);
    }

    private Animal animal(String id, String caravana) {
        Animal animal = Animal.builder().caravana(caravana).raza("Angus").sexo("HEMBRA").estado("ACTIVO").build();
        animal.setId(id);
        return animal;
    }

    private Potrero potrero(String id, String nombre) {
        Potrero potrero = new Potrero();
        potrero.setId(id);
        potrero.setNombre(nombre);
        return potrero;
    }

    private Operario operario(String id, String nombre, String apellido) {
        Operario operario = Operario.builder().nombre(nombre).apellido(apellido).build();
        operario.setId(id);
        return operario;
    }

    @Test
    void getMovimientosResuelveOperarioPorIdYNombresDePotreros() {
        Animal animal = animal("animal-1", "RP-001");
        Potrero origen = potrero("potrero-1", "Potrero Norte");
        Potrero destino = potrero("potrero-2", "Potrero Sur");

        MovimientoAnimal conOperario = MovimientoAnimal.builder()
                .animal(animal)
                .fecha(LocalDateTime.now())
                .tipoMovimiento(MovimientoAnimal.TipoMovimiento.TRANSFERENCIA)
                .potreroOrigen(origen)
                .potreroDestino(destino)
                .responsable("op-1")
                .build();
        conOperario.setId("mov-1");

        MovimientoAnimal conTextoLibre = MovimientoAnimal.builder()
                .animal(animal)
                .fecha(LocalDateTime.now())
                .tipoMovimiento(MovimientoAnimal.TipoMovimiento.INGRESO)
                .ubicacionDestino("Campo vecino")
                .responsable("Pedro el capataz")
                .build();
        conTextoLibre.setId("mov-2");

        when(animalRepository.findActiveById("animal-1")).thenReturn(Optional.of(animal));
        when(movimientoRepository.findByAnimalId("animal-1")).thenReturn(List.of(conOperario, conTextoLibre));
        when(operarioRepository.findAllById(anyList())).thenReturn(List.of(operario("op-1", "Juan", "Perez")));

        List<MovimientoAnimalResponse> result = animalService.getMovimientos("animal-1");

        assertThat(result).hasSize(2);

        // Id de operario resuelto a nombre completo, potreros resueltos a nombre (id crudo conservado).
        MovimientoAnimalResponse first = result.get(0);
        assertThat(first.responsable()).isEqualTo("op-1");
        assertThat(first.responsableNombre()).isEqualTo("Juan Perez");
        assertThat(first.potreroOrigenId()).isEqualTo("potrero-1");
        assertThat(first.potreroOrigenNombre()).isEqualTo("Potrero Norte");
        assertThat(first.potreroDestinoId()).isEqualTo("potrero-2");
        assertThat(first.potreroDestinoNombre()).isEqualTo("Potrero Sur");

        // Texto libre devuelto tal cual; sin potrero asociado cae a la ubicacion legacy.
        MovimientoAnimalResponse second = result.get(1);
        assertThat(second.responsableNombre()).isEqualTo("Pedro el capataz");
        assertThat(second.potreroOrigenId()).isNull();
        assertThat(second.potreroOrigenNombre()).isNull();
        assertThat(second.potreroDestinoNombre()).isEqualTo("Campo vecino");

        // Un solo lookup batch para toda la lista (sin N+1).
        verify(operarioRepository, times(1)).findAllById(anyList());
    }

    @Test
    void listAplicacionesPaginadasResuelveOperarioSobreElContenidoDeLaPagina() {
        Animal animal = animal("animal-1", "RP-001");
        VacunaCatalogo vacuna = VacunaCatalogo.builder().nombre("Aftosa").obligatoria(true).build();
        vacuna.setId("vac-1");

        AplicacionVacuna conOperario = AplicacionVacuna.builder()
                .animal(animal).vacuna(vacuna).fechaAplicacion(LocalDate.now()).operario("op-1").build();
        conOperario.setId("apl-1");
        AplicacionVacuna conTextoLibre = AplicacionVacuna.builder()
                .animal(animal).vacuna(vacuna).fechaAplicacion(LocalDate.now()).operario("Veterinaria externa").build();
        conTextoLibre.setId("apl-2");

        Page<AplicacionVacuna> repoPage = new PageImpl<>(List.of(conOperario, conTextoLibre), PageRequest.of(0, 20), 35);
        when(aplicacionVacunaRepository.findFilteredPage(isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(repoPage);
        when(operarioRepository.findAllById(List.of("op-1", "Veterinaria externa")))
                .thenReturn(List.of(operario("op-1", "Juan", "Perez")));

        Page<AplicacionVacunaResponse> result = sanidadService.listAplicacionesPaginadas(null, null, null, null, 0, 20);

        // La paginacion se conserva y la resolucion se hace sobre el contenido de la pagina.
        assertThat(result.getTotalElements()).isEqualTo(35);
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).operario()).isEqualTo("op-1");
        assertThat(result.getContent().get(0).operarioNombre()).isEqualTo("Juan Perez");
        assertThat(result.getContent().get(1).operarioNombre()).isEqualTo("Veterinaria externa");
        verify(operarioRepository, times(1)).findAllById(anyList());
    }

    @Test
    void listPesajesDevuelveTextoLibreTalCualYNuloSiNoHayResponsable() {
        Animal animal = animal("animal-1", "RP-001");
        PesajeAnimal conTextoLibre = PesajeAnimal.builder()
                .animal(animal).fecha(LocalDate.now()).pesoKg(BigDecimal.valueOf(420)).responsable("Bascula automatica").build();
        conTextoLibre.setId("pes-1");
        PesajeAnimal sinResponsable = PesajeAnimal.builder()
                .animal(animal).fecha(LocalDate.now()).pesoKg(BigDecimal.valueOf(415)).build();
        sinResponsable.setId("pes-2");

        when(pesajeRepository.findFiltered("animal-1", null, null)).thenReturn(List.of(conTextoLibre, sinResponsable));
        when(operarioRepository.findAllById(List.of("Bascula automatica"))).thenReturn(List.of());

        List<PesajeResponse> result = alimentacionService.listPesajes("animal-1", null, null);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).responsableNombre()).isEqualTo("Bascula automatica");
        assertThat(result.get(1).responsable()).isNull();
        assertThat(result.get(1).responsableNombre()).isNull();
    }
}
