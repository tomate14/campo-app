package com.campoapp.demo;

import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.repository.OperarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Seeder de operarios demo (feature 76).
 *
 * Corre temprano (orden 8) porque ordenes de trabajo y finanzas referencian
 * estos operarios por sus ids fijos ({@link DemoIds#OPERARIOS}). No crea usuario
 * de login: la ficha de operario alcanza para poblar las pantallas. El documento
 * puede quedar null (ver migracion V44 / features 44 y 63).
 */
@Component
@RequiredArgsConstructor
public class OperariosDemoSeeder implements DemoSeeder {

    private final OperarioRepository operarioRepository;

    @Override
    public int orden() {
        return 8;
    }

    @Override
    public String nombre() {
        return "operarios";
    }

    @Override
    @Transactional
    public int sembrar() {
        int creados = 0;
        creados += crear(DemoIds.OPERARIOS[0], "OP-001", "Juan", "Perez", "Tractorista", LocalDate.of(2021, 3, 15));
        creados += crear(DemoIds.OPERARIOS[1], "OP-002", "Maria", "Gomez", "Encargada de campo", LocalDate.of(2019, 8, 1));
        creados += crear(DemoIds.OPERARIOS[2], "OP-003", "Carlos", "Diaz", "Fumigador", LocalDate.of(2022, 6, 10));
        creados += crear(DemoIds.OPERARIOS[3], "OP-004", "Lucia", "Fernandez", "Operaria de cosecha", LocalDate.of(2023, 1, 20));
        return creados;
    }

    private int crear(String id, String legajo, String nombre, String apellido, String rol, LocalDate ingreso) {
        if (operarioRepository.existsById(id)) {
            return 0;
        }
        Operario operario = Operario.builder()
                .legajo(legajo)
                .nombre(nombre)
                .apellido(apellido)
                .rolOperativo(rol)
                .estado("ACTIVO")
                .fechaIngreso(ingreso)
                .build();
        operario.setId(id);
        operarioRepository.save(operario);
        return 1;
    }
}
