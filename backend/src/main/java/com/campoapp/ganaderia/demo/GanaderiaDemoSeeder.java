package com.campoapp.ganaderia.demo;

import com.campoapp.demo.DemoSeeder;
import com.campoapp.ganaderia.entity.Animal;
import com.campoapp.ganaderia.entity.AnimalPotrero;
import com.campoapp.ganaderia.entity.AplicacionVacuna;
import com.campoapp.ganaderia.entity.ControlPrenez;
import com.campoapp.ganaderia.entity.DiagnosticoSanitario;
import com.campoapp.ganaderia.entity.DietaIngrediente;
import com.campoapp.ganaderia.entity.DietaNutricional;
import com.campoapp.ganaderia.entity.Inseminacion;
import com.campoapp.ganaderia.entity.Monta;
import com.campoapp.ganaderia.entity.Parto;
import com.campoapp.ganaderia.entity.PesajeAnimal;
import com.campoapp.ganaderia.entity.Potrero;
import com.campoapp.ganaderia.entity.VacunaCatalogo;
import com.campoapp.ganaderia.repository.AnimalPotreroRepository;
import com.campoapp.ganaderia.repository.AnimalRepository;
import com.campoapp.ganaderia.repository.AplicacionVacunaRepository;
import com.campoapp.ganaderia.repository.ControlPrenezRepository;
import com.campoapp.ganaderia.repository.DiagnosticoSanitarioRepository;
import com.campoapp.ganaderia.repository.DietaIngredienteRepository;
import com.campoapp.ganaderia.repository.DietaNutricionalRepository;
import com.campoapp.ganaderia.repository.InseminacionRepository;
import com.campoapp.ganaderia.repository.MontaRepository;
import com.campoapp.ganaderia.repository.PartoRepository;
import com.campoapp.ganaderia.repository.PesajeAnimalRepository;
import com.campoapp.ganaderia.repository.PotreroRepository;
import com.campoapp.ganaderia.repository.VacunaCatalogoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Seeder de datos de demo del dominio GANADERIA (feature 76).
 *
 * Crea un dataset chico pero coherente que puebla todas las pantallas de ganaderia:
 * trazabilidad (animales), sanidad (vacunas + aplicaciones + diagnosticos),
 * reproduccion (montas, inseminaciones, controles de prenez, partos + genealogia),
 * alimentacion (dietas + pesajes) y potreros (asignaciones).
 *
 * Idempotente: cada fila usa un id fijo {@code demo-*} y solo se crea si no existe.
 * Devuelve la cantidad de filas nuevas realmente creadas.
 */
@Component
@RequiredArgsConstructor
public class GanaderiaDemoSeeder implements DemoSeeder {

    private final AnimalRepository animalRepo;
    private final VacunaCatalogoRepository vacunaRepo;
    private final AplicacionVacunaRepository aplicacionVacunaRepo;
    private final DiagnosticoSanitarioRepository diagnosticoRepo;
    private final MontaRepository montaRepo;
    private final InseminacionRepository inseminacionRepo;
    private final ControlPrenezRepository controlPrenezRepo;
    private final PartoRepository partoRepo;
    private final DietaNutricionalRepository dietaRepo;
    private final DietaIngredienteRepository dietaIngredienteRepo;
    private final PesajeAnimalRepository pesajeRepo;
    private final PotreroRepository potreroRepo;
    private final AnimalPotreroRepository animalPotreroRepo;

    /** Fecha base del dataset (relativa a "hoy") para que las series tengan sentido. */
    private static final LocalDate HOY = LocalDate.now();

    /** Contador de filas nuevas creadas en la corrida actual. */
    private int nuevas;

    /** Cache de animales demo (id -> entidad gestionada) para armar relaciones. */
    private final Map<String, Animal> animales = new LinkedHashMap<>();

    @Override
    public int orden() {
        return 50;
    }

    @Override
    public String nombre() {
        return "ganaderia";
    }

    @Override
    @Transactional
    public int sembrar() {
        nuevas = 0;
        animales.clear();

        sembrarAnimales();
        sembrarGenealogia();
        sembrarSanidad();
        sembrarReproduccion();
        sembrarAlimentacion();
        sembrarPotreros();

        return nuevas;
    }

    // ---------------------------------------------------------------------
    // Trazabilidad: ~24 animales repartidos por sexo y categoria.
    // Animal no tiene columna "categoria": la categoria queda expresada en la
    // caravana/observaciones. Sexo real usado en el sistema: "Femenino"/"Masculino".
    // ---------------------------------------------------------------------
    private void sembrarAnimales() {
        // Vacas adultas (hembras, madres potenciales).
        animal("demo-animal-1", "D-101", "Angus Negro", "Femenino", HOY.minusYears(6), kg(620), "Vaca adulta. Buena condicion corporal.");
        animal("demo-animal-2", "D-102", "Hereford", "Femenino", HOY.minusYears(5), kg(585), "Vaca adulta prenada.");
        animal("demo-animal-3", "D-103", "Braford", "Femenino", HOY.minusYears(7), kg(600), "Vaca de rodeo general.");
        animal("demo-animal-4", "D-104", "Brangus", "Femenino", HOY.minusYears(5), kg(575), "Vaca adulta, seguimiento medio.");
        animal("demo-animal-5", "D-105", "Angus Colorado", "Femenino", HOY.minusYears(6), kg(610), "Vaca adulta con cria al pie.");
        animal("demo-animal-6", "D-106", "Hereford", "Femenino", HOY.minusYears(4), kg(560), "Vaca joven, primer servicio.");
        animal("demo-animal-7", "D-107", "Shorthorn", "Femenino", HOY.minusYears(8), kg(630), "Vaca adulta veterana.");
        animal("demo-animal-8", "D-108", "Aberdeen Angus", "Femenino", HOY.minusYears(5), kg(595), "Vaca adulta, buen historial reproductivo.");

        // Vaquillonas de reposicion (hembras jovenes).
        animal("demo-animal-9", "D-201", "Angus Negro", "Femenino", HOY.minusMonths(20), kg(360), "Vaquillona de reposicion.");
        animal("demo-animal-10", "D-202", "Hereford", "Femenino", HOY.minusMonths(22), kg(375), "Vaquillona en recria.");
        animal("demo-animal-11", "D-203", "Braford", "Femenino", HOY.minusMonths(18), kg(340), "Vaquillona de reposicion.");
        animal("demo-animal-12", "D-204", "Brangus", "Femenino", HOY.minusMonths(21), kg(368), "Vaquillona en seguimiento.");

        // Terneras (hembras del ultimo servicio).
        animal("demo-animal-13", "D-301", "Angus Negro", "Femenino", HOY.minusMonths(6), kg(165), "Ternera al pie de la madre.");
        animal("demo-animal-14", "D-302", "Hereford", "Femenino", HOY.minusMonths(5), kg(150), "Ternera de destete proximo.");
        animal("demo-animal-15", "D-303", "Braford", "Femenino", HOY.minusMonths(7), kg(180), "Ternera con buena ganancia.");

        // Toros (padres / reproductores).
        animal("demo-animal-16", "D-401", "Angus Negro", "Masculino", HOY.minusYears(6), kg(920), "Toro reproductor principal.");
        animal("demo-animal-17", "D-402", "Braford", "Masculino", HOY.minusYears(5), kg(880), "Toro reproductor de rodeo indexado.");

        // Novillos de recria (machos de engorde).
        animal("demo-animal-18", "D-501", "Brangus", "Masculino", HOY.minusMonths(20), kg(365), "Novillo de recria.");
        animal("demo-animal-19", "D-502", "Hereford", "Masculino", HOY.minusMonths(22), kg(352), "Novillo en seguimiento de ganancia.");
        animal("demo-animal-20", "D-503", "Angus Negro", "Masculino", HOY.minusMonths(19), kg(348), "Novillo de recria.");
        animal("demo-animal-21", "D-504", "Shorthorn", "Masculino", HOY.minusMonths(23), kg(380), "Novillo proximo a terminacion.");

        // Terneros (machos del ultimo servicio).
        animal("demo-animal-22", "D-601", "Angus Negro", "Masculino", HOY.minusMonths(6), kg(175), "Ternero al pie de la madre.");
        animal("demo-animal-23", "D-602", "Hereford", "Masculino", HOY.minusMonths(5), kg(160), "Ternero de destete proximo.");
        animal("demo-animal-24", "D-603", "Braford", "Masculino", HOY.minusMonths(7), kg(190), "Ternero con buena ganancia.");
    }

    /** Crea un animal demo si no existe y lo cachea. */
    private void animal(String id, String caravana, String raza, String sexo, LocalDate nacimiento, BigDecimal peso, String obs) {
        Animal existente = animalRepo.findById(id).orElse(null);
        if (existente != null) {
            animales.put(id, existente);
            return;
        }
        Animal a = Animal.builder()
                .caravana(caravana)
                .raza(raza)
                .sexo(sexo)
                .fechaNacimiento(nacimiento)
                .pesoActualKg(peso)
                .rfidCodigo("RFID-" + caravana)
                .estado("ACTIVO")
                .observaciones(obs)
                .build();
        a.setId(id);
        animales.put(id, animalRepo.save(a));
        nuevas++;
    }

    // ---------------------------------------------------------------------
    // Genealogia: relaciones madre/padre entre animales demo. No crea filas
    // nuevas (actualiza animales existentes), por eso no incrementa el contador.
    // ---------------------------------------------------------------------
    private void sembrarGenealogia() {
        wireParents("demo-animal-13", "demo-animal-1", "demo-animal-16");
        wireParents("demo-animal-14", "demo-animal-2", "demo-animal-16");
        wireParents("demo-animal-15", "demo-animal-3", "demo-animal-17");
        wireParents("demo-animal-22", "demo-animal-5", "demo-animal-16");
        wireParents("demo-animal-23", "demo-animal-6", "demo-animal-16");
        wireParents("demo-animal-24", "demo-animal-8", "demo-animal-17");
    }

    private void wireParents(String criaId, String madreId, String padreId) {
        Animal cria = animales.get(criaId);
        Animal madre = animales.get(madreId);
        Animal padre = animales.get(padreId);
        if (cria == null || madre == null || padre == null) {
            return;
        }
        boolean cambio = false;
        if (cria.getMadre() == null) {
            cria.setMadre(madre);
            cambio = true;
        }
        if (cria.getPadre() == null) {
            cria.setPadre(padre);
            cambio = true;
        }
        if (cambio) {
            animalRepo.save(cria);
        }
    }

    // ---------------------------------------------------------------------
    // Sanidad: vacunas demo del catalogo + aplicaciones + diagnosticos.
    // ---------------------------------------------------------------------
    private void sembrarSanidad() {
        // El catalogo de vacunas de la migracion V6 usa ids UUID() aleatorios, no
        // referenciables. Creamos 2 vacunas demo con id fijo para poder referenciarlas.
        VacunaCatalogo aftosa = vacunaDemo("demo-vacuna-aftosa", "DEMO_AFTOSA", "Vacuna Aftosa (demo)",
                true, 180, 60, "5 ml", "Subcutanea", "Biogenesis Bago", bd(1850));
        VacunaCatalogo brucelosis = vacunaDemo("demo-vacuna-brucelosis", "DEMO_BRUCELOSIS", "Vacuna Brucelosis (demo)",
                true, 365, 90, "2 ml", "Subcutanea", "CDV", bd(1320));

        // Aplicaciones de aftosa a varias vacas y toros.
        aplicacionVacuna("demo-aplic-1", "demo-animal-1", aftosa, HOY.minusDays(40), "Juan Perez");
        aplicacionVacuna("demo-aplic-2", "demo-animal-2", aftosa, HOY.minusDays(40), "Juan Perez");
        aplicacionVacuna("demo-aplic-3", "demo-animal-3", aftosa, HOY.minusDays(38), "Juan Perez");
        aplicacionVacuna("demo-aplic-4", "demo-animal-16", aftosa, HOY.minusDays(35), "Juan Perez");
        aplicacionVacuna("demo-aplic-5", "demo-animal-17", aftosa, HOY.minusDays(35), "Juan Perez");
        // Aplicaciones de brucelosis a hembras jovenes.
        aplicacionVacuna("demo-aplic-6", "demo-animal-9", brucelosis, HOY.minusDays(20), "Maria Gomez");
        aplicacionVacuna("demo-aplic-7", "demo-animal-10", brucelosis, HOY.minusDays(20), "Maria Gomez");
        aplicacionVacuna("demo-aplic-8", "demo-animal-11", brucelosis, HOY.minusDays(18), "Maria Gomez");

        // Diagnosticos sanitarios (algunos abiertos, otros cerrados).
        diagnostico("demo-diag-1", "demo-animal-4", HOY.minusDays(15), "Mastitis subclinica", "MEDIA", "ABIERTO",
                "Dr. Lopez", "Antibiotico intramamario");
        diagnostico("demo-diag-2", "demo-animal-7", HOY.minusDays(30), "Cojera leve", "BAJA", "CERRADO",
                "Dr. Lopez", "Reposo y antiinflamatorio");
        diagnostico("demo-diag-3", "demo-animal-19", HOY.minusDays(8), "Parasitosis gastrointestinal", "MEDIA", "ABIERTO",
                "Dra. Ruiz", "Antiparasitario oral");
    }

    private VacunaCatalogo vacunaDemo(String id, String codigo, String nombre, boolean obligatoria,
                                      Integer frecuenciaDias, Integer edadMinDias, String dosis,
                                      String via, String laboratorio, BigDecimal costo) {
        VacunaCatalogo existente = vacunaRepo.findById(id).orElse(null);
        if (existente != null) {
            return existente;
        }
        VacunaCatalogo v = VacunaCatalogo.builder()
                .codigo(codigo)
                .nombre(nombre)
                .descripcion("Vacuna de demostracion (feature 76).")
                .obligatoria(obligatoria)
                .especie("BOVINA")
                .frecuenciaDias(frecuenciaDias)
                .edadMinDias(edadMinDias)
                .dosisRecomendada(dosis)
                .viaAplicacion(via)
                .laboratorio(laboratorio)
                .costoReferencia(costo)
                .stockDisponible(100)
                .activo(true)
                .build();
        v.setId(id);
        VacunaCatalogo guardada = vacunaRepo.save(v);
        nuevas++;
        return guardada;
    }

    private void aplicacionVacuna(String id, String animalId, VacunaCatalogo vacuna, LocalDate fecha, String operario) {
        if (aplicacionVacunaRepo.existsById(id)) {
            return;
        }
        Animal animal = animales.get(animalId);
        if (animal == null || vacuna == null) {
            return;
        }
        Integer frecuencia = vacuna.getFrecuenciaDias();
        AplicacionVacuna ap = AplicacionVacuna.builder()
                .animal(animal)
                .vacuna(vacuna)
                .fechaAplicacion(fecha)
                .proximaDosisFecha(frecuencia != null ? fecha.plusDays(frecuencia) : null)
                .operario(operario)
                .loteMarca("LOTE-DEMO")
                .costoAplicado(vacuna.getCostoReferencia())
                .observaciones("Aplicacion de demostracion.")
                .build();
        ap.setId(id);
        aplicacionVacunaRepo.save(ap);
        nuevas++;
    }

    private void diagnostico(String id, String animalId, LocalDate fecha, String enfermedad, String severidad,
                             String estado, String veterinario, String tratamiento) {
        if (diagnosticoRepo.existsById(id)) {
            return;
        }
        Animal animal = animales.get(animalId);
        if (animal == null) {
            return;
        }
        DiagnosticoSanitario d = DiagnosticoSanitario.builder()
                .animal(animal)
                .fechaDiagnostico(fecha)
                .enfermedad(enfermedad)
                .severidad(severidad)
                .estado(estado)
                .veterinario(veterinario)
                .tratamientoIndicado(tratamiento)
                .observaciones("Diagnostico de demostracion.")
                .build();
        d.setId(id);
        diagnosticoRepo.save(d);
        nuevas++;
    }

    // ---------------------------------------------------------------------
    // Reproduccion: montas, inseminaciones, controles de prenez y partos.
    // ---------------------------------------------------------------------
    private void sembrarReproduccion() {
        // Montas naturales (vaca x toro).
        monta("demo-monta-1", "demo-animal-1", "demo-animal-16", HOY.minusMonths(4), "PRENADA");
        monta("demo-monta-2", "demo-animal-5", "demo-animal-16", HOY.minusMonths(3), "PRENADA");

        // Inseminaciones artificiales.
        inseminacion("demo-insem-1", "demo-animal-2", HOY.minusMonths(4), "Semen Angus GEN-A12", "Tec. Alvarez", bd(4500), "PRENADA");
        inseminacion("demo-insem-2", "demo-animal-8", HOY.minusMonths(2), "Semen Hereford GEN-H07", "Tec. Alvarez", bd(4200), "PENDIENTE");

        // Controles de prenez (estado "PRENADA" es el que cuenta el dashboard).
        controlPrenez("demo-prenez-1", "demo-animal-1", HOY.minusMonths(2), "PRENADA", HOY.plusMonths(5), "BAJO", "Dr. Lopez");
        controlPrenez("demo-prenez-2", "demo-animal-2", HOY.minusMonths(2), "PRENADA", HOY.plusMonths(5), "MEDIO", "Dr. Lopez");
        controlPrenez("demo-prenez-3", "demo-animal-5", HOY.minusMonths(1), "PRENADA", HOY.plusMonths(6), "BAJO", "Dr. Lopez");
        controlPrenez("demo-prenez-4", "demo-animal-6", HOY.minusMonths(1), "VACIA", null, "MEDIO", "Dr. Lopez");

        // Partos con ternero asociado (genealogia coherente con sembrarGenealogia).
        parto("demo-parto-1", "demo-animal-5", "demo-animal-22", HOY.minusMonths(6), "VIABLE", null);
        parto("demo-parto-2", "demo-animal-6", "demo-animal-23", HOY.minusMonths(5), "VIABLE", "Parto asistido sin complicaciones.");
    }

    private void monta(String id, String vacaId, String toroId, LocalDate fecha, String resultado) {
        if (montaRepo.existsById(id)) {
            return;
        }
        Animal vaca = animales.get(vacaId);
        Animal toro = animales.get(toroId);
        if (vaca == null || toro == null) {
            return;
        }
        Monta m = Monta.builder()
                .vaca(vaca)
                .toro(toro)
                .fecha(fecha)
                .resultado(resultado)
                .observaciones("Monta de demostracion.")
                .build();
        m.setId(id);
        montaRepo.save(m);
        nuevas++;
    }

    private void inseminacion(String id, String vacaId, LocalDate fecha, String genetica, String tecnico,
                              BigDecimal costo, String resultado) {
        if (inseminacionRepo.existsById(id)) {
            return;
        }
        Animal vaca = animales.get(vacaId);
        if (vaca == null) {
            return;
        }
        Inseminacion i = Inseminacion.builder()
                .vaca(vaca)
                .fecha(fecha)
                .geneticaUsada(genetica)
                .tecnico(tecnico)
                .costo(costo)
                .resultado(resultado)
                .observaciones("Inseminacion de demostracion.")
                .build();
        i.setId(id);
        inseminacionRepo.save(i);
        nuevas++;
    }

    private void controlPrenez(String id, String vacaId, LocalDate fechaDiagnostico, String estado,
                               LocalDate fechaEstimadaParto, String nivelRiesgo, String veterinario) {
        if (controlPrenezRepo.existsById(id)) {
            return;
        }
        Animal vaca = animales.get(vacaId);
        if (vaca == null) {
            return;
        }
        ControlPrenez c = ControlPrenez.builder()
                .vaca(vaca)
                .fechaDiagnostico(fechaDiagnostico)
                .estado(estado)
                .fechaEstimadaParto(fechaEstimadaParto)
                .nivelRiesgoParto(nivelRiesgo)
                .veterinario(veterinario)
                .observaciones("Control de prenez de demostracion.")
                .build();
        c.setId(id);
        controlPrenezRepo.save(c);
        nuevas++;
    }

    private void parto(String id, String madreId, String terneroId, LocalDate fecha, String viabilidad, String complicaciones) {
        if (partoRepo.existsById(id)) {
            return;
        }
        Animal madre = animales.get(madreId);
        Animal ternero = animales.get(terneroId);
        if (madre == null) {
            return;
        }
        Parto p = Parto.builder()
                .madre(madre)
                .ternero(ternero)
                .fecha(fecha)
                .viabilidadTernero(viabilidad)
                .complicaciones(complicaciones)
                .observaciones("Parto de demostracion.")
                .build();
        p.setId(id);
        partoRepo.save(p);
        nuevas++;
    }

    // ---------------------------------------------------------------------
    // Alimentacion: dietas con ingredientes + series cortas de pesajes.
    // ---------------------------------------------------------------------
    private void sembrarAlimentacion() {
        DietaNutricional recria = dieta("demo-dieta-1", "Dieta Recria", "NOVILLO", "Ganancia de peso en recria", bd(9), bd(320));
        if (recria != null) {
            dietaIngrediente("demo-dieta-1-ing-1", recria, "Silo de maiz", bd(60), bd(45), bd(35));
            dietaIngrediente("demo-dieta-1-ing-2", recria, "Grano de maiz", bd(25), bd(190), bd(88));
            dietaIngrediente("demo-dieta-1-ing-3", recria, "Nucleo proteico", bd(15), bd(410), bd(90));
        }

        DietaNutricional preparto = dieta("demo-dieta-2", "Dieta Preparto", "VACA", "Acondicionamiento preparto", bd(11), bd(280));
        if (preparto != null) {
            dietaIngrediente("demo-dieta-2-ing-1", preparto, "Rollo de alfalfa", bd(70), bd(80), bd(85));
            dietaIngrediente("demo-dieta-2-ing-2", preparto, "Balanceado mineral", bd(30), bd(260), bd(90));
        }

        // Series cortas de pesajes para los graficos (novillos y una vaquillona).
        serieDePesajes("demo-animal-18", 300, 330, 365);
        serieDePesajes("demo-animal-19", 295, 322, 352);
        serieDePesajes("demo-animal-20", 288, 318, 348);
        serieDePesajes("demo-animal-9", 320, 342, 360);
    }

    private DietaNutricional dieta(String id, String nombre, String tipoAnimal, String objetivo,
                                   BigDecimal materiaSecaKg, BigDecimal costoDiario) {
        DietaNutricional existente = dietaRepo.findById(id).orElse(null);
        if (existente != null) {
            return existente;
        }
        DietaNutricional d = DietaNutricional.builder()
                .nombre(nombre)
                .tipoAnimal(tipoAnimal)
                .objetivo(objetivo)
                .materiaSecaKg(materiaSecaKg)
                .costoDiario(costoDiario)
                .activa(true)
                .observaciones("Dieta de demostracion.")
                .build();
        d.setId(id);
        DietaNutricional guardada = dietaRepo.save(d);
        nuevas++;
        return guardada;
    }

    private void dietaIngrediente(String id, DietaNutricional dieta, String ingrediente, BigDecimal proporcionPct,
                                  BigDecimal costoKg, BigDecimal materiaSecaPct) {
        if (dietaIngredienteRepo.existsById(id)) {
            return;
        }
        DietaIngrediente ing = DietaIngrediente.builder()
                .dieta(dieta)
                .ingrediente(ingrediente)
                .proporcionPct(proporcionPct)
                .costoKg(costoKg)
                .materiaSecaPct(materiaSecaPct)
                .build();
        ing.setId(id);
        dietaIngredienteRepo.save(ing);
        nuevas++;
    }

    /** Crea 3 pesajes (hace 90, 45 y 5 dias) para armar una serie corta. */
    private void serieDePesajes(String animalId, int peso1, int peso2, int peso3) {
        pesaje(animalId, 1, HOY.minusDays(90), peso1);
        pesaje(animalId, 2, HOY.minusDays(45), peso2);
        pesaje(animalId, 3, HOY.minusDays(5), peso3);
    }

    private void pesaje(String animalId, int indice, LocalDate fecha, int pesoKg) {
        String id = "demo-pesaje-" + animalId.replace("demo-animal-", "") + "-" + indice;
        if (pesajeRepo.existsById(id)) {
            return;
        }
        Animal animal = animales.get(animalId);
        if (animal == null) {
            return;
        }
        PesajeAnimal p = PesajeAnimal.builder()
                .animal(animal)
                .fecha(fecha)
                .pesoKg(kg(pesoKg))
                .condicionCorporal(new BigDecimal("3.5"))
                .metodo("BASCULA")
                .responsable("Operario demo")
                .observaciones("Pesaje de demostracion.")
                .build();
        p.setId(id);
        pesajeRepo.save(p);
        nuevas++;
    }

    // ---------------------------------------------------------------------
    // Potreros: 2 potreros demo + asignacion activa de algunos animales.
    // ---------------------------------------------------------------------
    private void sembrarPotreros() {
        String poligono1 = "{\"type\":\"Polygon\",\"coordinates\":[[[-59.164250,-37.336402],"
                + "[-59.161250,-37.336402],[-59.161250,-37.339402],[-59.164250,-37.339402],[-59.164250,-37.336402]]]}";
        String poligono2 = "{\"type\":\"Polygon\",\"coordinates\":[[[-59.161250,-37.336402],"
                + "[-59.158250,-37.336402],[-59.158250,-37.339402],[-59.161250,-37.339402],[-59.161250,-37.336402]]]}";

        Potrero potrero1 = potrero("demo-potrero-1", "Potrero Demo Norte", "Pastoreo general del rodeo de cria.",
                bd(120), "PASTOREO", "ACTIVO", 150, "CAMPO NATURAL", poligono1,
                new BigDecimal("-37.3379020"), new BigDecimal("-59.1627500"));
        Potrero potrero2 = potrero("demo-potrero-2", "Potrero Demo Sur", "Maternidad de vacas en ultimo tercio.",
                bd(90), "MATERNIDAD", "ACTIVO", 100, "PASTURA", poligono2,
                new BigDecimal("-37.3379020"), new BigDecimal("-59.1597500"));

        // Asignaciones activas de animales a potreros.
        asignacion("demo-anpot-1", "demo-animal-1", potrero1);
        asignacion("demo-anpot-2", "demo-animal-2", potrero1);
        asignacion("demo-anpot-3", "demo-animal-3", potrero1);
        asignacion("demo-anpot-4", "demo-animal-5", potrero2);
        asignacion("demo-anpot-5", "demo-animal-6", potrero2);
    }

    private Potrero potrero(String id, String nombre, String descripcion, BigDecimal superficieHa, String tipoUso,
                            String estado, Integer capacidad, String recursoForrajero, String poligono,
                            BigDecimal lat, BigDecimal lon) {
        Potrero existente = potreroRepo.findById(id).orElse(null);
        if (existente != null) {
            return existente;
        }
        Potrero p = Potrero.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .superficieHa(superficieHa)
                .tipoUso(tipoUso)
                .estado(estado)
                .capacidadAnimales(capacidad)
                .cargaAnimalActual(0)
                .recursoForrajero(recursoForrajero)
                .disponibilidadAgua(true)
                .tieneSombra(true)
                .observaciones("Potrero de demostracion.")
                .poligono(poligono)
                .centroideLatitud(lat)
                .centroideLongitud(lon)
                .build();
        p.setId(id);
        Potrero guardado = potreroRepo.save(p);
        nuevas++;
        return guardado;
    }

    private void asignacion(String id, String animalId, Potrero potrero) {
        if (animalPotreroRepo.existsById(id)) {
            return;
        }
        Animal animal = animales.get(animalId);
        if (animal == null || potrero == null) {
            return;
        }
        AnimalPotrero ap = AnimalPotrero.builder()
                .animal(animal)
                .potrero(potrero)
                .fechaDesde(LocalDateTime.now().minusDays(30))
                .activo(true)
                .motivo("Asignacion de demostracion")
                .responsable("Operario demo")
                .observaciones("Asignacion de demostracion.")
                .build();
        ap.setId(id);
        animalPotreroRepo.save(ap);
        nuevas++;
    }

    // ---------------------------------------------------------------------
    // Helpers de conversion numerica.
    // ---------------------------------------------------------------------
    private static BigDecimal kg(int valor) {
        return new BigDecimal(valor).setScale(2);
    }

    private static BigDecimal bd(int valor) {
        return new BigDecimal(valor).setScale(2);
    }
}
