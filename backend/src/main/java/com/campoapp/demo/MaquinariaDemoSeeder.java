package com.campoapp.demo;

import com.campoapp.maquinaria.entity.Maquinaria;
import com.campoapp.maquinaria.entity.MantenimientoProgramado;
import com.campoapp.maquinaria.repository.MantenimientoProgramadoRepository;
import com.campoapp.maquinaria.repository.MaquinariaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Seeder de maquinaria y mantenimientos programados demo (feature 76).
 *
 * Crea 4 maquinas (tractor, cosechadora, pulverizadora, sembradora) con ids fijos
 * demo-maq-* y 3 mantenimientos programados PENDIENTE para las primeras maquinas.
 * Los estados son strings libres: el modulo usa "DISPONIBLE" como default y trata
 * "MANTENIMIENTO"/"EN_USO" en sus dashboards.
 */
@Component
@RequiredArgsConstructor
public class MaquinariaDemoSeeder implements DemoSeeder {

    private final MaquinariaRepository maquinariaRepository;
    private final MantenimientoProgramadoRepository mantenimientoRepository;

    @Override
    public int orden() {
        return 60;
    }

    @Override
    public String nombre() {
        return "maquinaria";
    }

    @Override
    @Transactional
    public int sembrar() {
        int creados = 0;

        creados += crearMaquina("demo-maq-1", "MAQ-001", "TRACTOR", "John Deere", "6110J",
                "DISPONIBLE", 110, new BigDecimal("110.00"), new BigDecimal("3200.00"), LocalDate.of(2020, 5, 10));
        creados += crearMaquina("demo-maq-2", "MAQ-002", "COSECHADORA", "New Holland", "TC5.90",
                "EN_USO", 175, new BigDecimal("175.00"), new BigDecimal("1450.00"), LocalDate.of(2019, 11, 3));
        creados += crearMaquina("demo-maq-3", "MAQ-003", "PULVERIZADORA", "Metalfor", "Multiple 3200",
                "MANTENIMIENTO", null, null, new BigDecimal("980.00"), LocalDate.of(2021, 2, 18));
        creados += crearMaquina("demo-maq-4", "MAQ-004", "SEMBRADORA", "Agrometal", "TX Mega",
                "DISPONIBLE", null, null, null, LocalDate.of(2022, 7, 25));

        // Mantenimientos programados PENDIENTE para 3 maquinas.
        creados += crearMantenimiento("demo-mant-1", "demo-maq-1", LocalDate.now().plusDays(15),
                new BigDecimal("3400.00"), "Juan Perez", "Cambio de aceite y filtros (500 hs)");
        creados += crearMantenimiento("demo-mant-2", "demo-maq-2", LocalDate.now().minusDays(3),
                new BigDecimal("1500.00"), "Carlos Diaz", "Revision de sinfin y limpieza de rotor");
        creados += crearMantenimiento("demo-mant-3", "demo-maq-3", LocalDate.now().plusDays(30),
                null, "Carlos Diaz", "Calibracion de picos pulverizadores");

        return creados;
    }

    private int crearMaquina(String id, String codigo, String tipo, String marca, String modelo,
                             String estado, Integer anio, BigDecimal potenciaHp,
                             BigDecimal horometro, LocalDate fechaAlta) {
        if (maquinariaRepository.existsById(id)) {
            return 0;
        }
        Maquinaria maquina = Maquinaria.builder()
                .codigo(codigo)
                .tipo(tipo)
                .marca(marca)
                .modelo(modelo)
                .estado(estado)
                .anio(anio)
                .potenciaHp(potenciaHp)
                .horometro(horometro)
                .fechaAlta(fechaAlta)
                .build();
        maquina.setId(id);
        maquinariaRepository.save(maquina);
        return 1;
    }

    private int crearMantenimiento(String id, String maquinariaId, LocalDate fecha,
                                   BigDecimal horometroObjetivo, String responsable, String observaciones) {
        if (mantenimientoRepository.existsById(id)) {
            return 0;
        }
        // La maquina es @ManyToOne obligatorio: la cargamos por su id fijo.
        Maquinaria maquina = maquinariaRepository.findById(maquinariaId).orElse(null);
        if (maquina == null) {
            return 0;
        }
        MantenimientoProgramado mantenimiento = MantenimientoProgramado.builder()
                .maquinaria(maquina)
                .fechaProgramada(fecha)
                .horometroObjetivo(horometroObjetivo)
                .estado("PENDIENTE")
                .responsable(responsable)
                .observaciones(observaciones)
                .build();
        mantenimiento.setId(id);
        mantenimientoRepository.save(mantenimiento);
        return 1;
    }
}
