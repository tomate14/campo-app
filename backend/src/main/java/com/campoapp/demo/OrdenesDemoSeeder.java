package com.campoapp.demo;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.entity.OrdenTrabajo;
import com.campoapp.operarios.entity.OrdenTrabajoActividad;
import com.campoapp.operarios.repository.OperarioRepository;
import com.campoapp.operarios.repository.OrdenTrabajoActividadRepository;
import com.campoapp.operarios.repository.OrdenTrabajoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Seeder de ordenes de trabajo demo (feature 76).
 *
 * Crea 3 ordenes asignadas a operarios demo, cada una con una actividad. Corre
 * en orden 72: despues de operarios (8) y lotes de agricultura (10), asi puede
 * referenciarlos por sus ids fijos. Estados/prioridades siguen los strings que
 * usa OrdenTrabajoServiceImpl: PENDIENTE/EN_PROGRESO/COMPLETADA, prioridad MEDIA,
 * actividad con estado REGISTRADA.
 */
@Component
@RequiredArgsConstructor
public class OrdenesDemoSeeder implements DemoSeeder {

    private final OrdenTrabajoRepository ordenRepository;
    private final OrdenTrabajoActividadRepository actividadRepository;
    private final OperarioRepository operarioRepository;
    private final LoteRepository loteRepository;

    @Override
    public int orden() {
        return 72;
    }

    @Override
    public String nombre() {
        return "ordenes-trabajo";
    }

    @Override
    @Transactional
    public int sembrar() {
        int creados = 0;

        creados += crearOrden("demo-ot-1", "OT-0001", "Siembra de soja lote 1",
                "Preparar y sembrar el lote con la sembradora asignada.",
                DemoIds.OPERARIOS[0], DemoIds.LOTES[0], "ALTA", "EN_PROGRESO",
                LocalDateTime.now().minusDays(1),
                "demo-ota-1", "SIEMBRA", "Regulacion de sembradora y siembra", "REGISTRADA");

        creados += crearOrden("demo-ot-2", "OT-0002", "Pulverizacion lote 2",
                "Aplicacion de herbicida segun receta agronomica.",
                DemoIds.OPERARIOS[2], DemoIds.LOTES[1], "MEDIA", "PENDIENTE",
                LocalDateTime.now().plusDays(2),
                "demo-ota-2", "PULVERIZACION", "Preparacion de caldo y aplicacion", "REGISTRADA");

        creados += crearOrden("demo-ot-3", "OT-0003", "Cosecha lote 3",
                "Cosecha de trigo y traslado a acopio.",
                DemoIds.OPERARIOS[1], DemoIds.LOTES[2], "MEDIA", "COMPLETADA",
                LocalDateTime.now().minusDays(10),
                "demo-ota-3", "COSECHA", "Trilla y descarga en tolva", "REGISTRADA");

        return creados;
    }

    private int crearOrden(String ordenId, String codigo, String titulo, String descripcion,
                           String operarioId, String loteId, String prioridad, String estado,
                           LocalDateTime fechaProgramada,
                           String actividadId, String actividadTipo, String actividadDescripcion,
                           String actividadEstado) {
        if (ordenRepository.existsById(ordenId)) {
            return 0;
        }
        // El operario es @ManyToOne obligatorio: lo cargamos por su id fijo.
        Operario operario = operarioRepository.findById(operarioId).orElse(null);
        if (operario == null) {
            return 0;
        }
        Lote lote = loteRepository.findById(loteId).orElse(null);

        OrdenTrabajo orden = OrdenTrabajo.builder()
                .codigo(codigo)
                .titulo(titulo)
                .descripcion(descripcion)
                .operario(operario)
                .lote(lote)
                .prioridad(prioridad)
                .estado(estado)
                .fechaProgramada(fechaProgramada)
                .build();
        orden.setId(ordenId);
        ordenRepository.save(orden);

        int creados = 1;
        if (!actividadRepository.existsById(actividadId)) {
            OrdenTrabajoActividad actividad = OrdenTrabajoActividad.builder()
                    .orden(orden)
                    .operario(operario)
                    .tipo(actividadTipo)
                    .descripcion(actividadDescripcion)
                    .estado(actividadEstado)
                    .build();
            actividad.setId(actividadId);
            actividadRepository.save(actividad);
            creados++;
        }
        return creados;
    }
}
