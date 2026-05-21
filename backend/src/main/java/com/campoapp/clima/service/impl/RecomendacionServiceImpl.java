package com.campoapp.clima.service.impl;

import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.clima.dto.RecomendacionResponse;
import com.campoapp.clima.dto.RecomendacionResponse.Recomendacion;
import com.campoapp.clima.entity.DatoClima;
import com.campoapp.clima.entity.Pronostico;
import com.campoapp.clima.repository.DatoClimaRepository;
import com.campoapp.clima.repository.PronosticoRepository;
import com.campoapp.clima.service.RecomendacionService;
import com.campoapp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecomendacionServiceImpl implements RecomendacionService {

    private final DatoClimaRepository datoClimaRepository;
    private final PronosticoRepository pronosticoRepository;
    private final LoteRepository loteRepository;

    @Override
    public RecomendacionResponse obtenerRecomendaciones(String loteId) {
        var lote = loteRepository.findActiveById(loteId)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado: " + loteId));

        var datoOpt = datoClimaRepository.findUltimoByLoteId(loteId);
        List<Pronostico> pronosticos = pronosticoRepository.findByLoteIdDesde(loteId, LocalDate.now());

        List<Recomendacion> lista = new ArrayList<>();
        String condicionGeneral = "Sin datos climáticos disponibles";

        if (datoOpt.isPresent()) {
            DatoClima d = datoOpt.get();
            condicionGeneral = d.getDescripcion() != null ? d.getDescripcion() : "Condiciones normales";

            // Pulverización
            if (d.getVelocidadViento() != null && d.getVelocidadViento().doubleValue() > 5.5) {
                lista.add(new Recomendacion("Pulverización",
                        String.format("Viento de %.1f m/s — puede haber deriva. Evaluar condiciones antes de aplicar.", d.getVelocidadViento()),
                        d.getVelocidadViento().doubleValue() > 13.9 ? "ALTA" : "MEDIA"));
            } else {
                lista.add(new Recomendacion("Pulverización",
                        "Condiciones de viento aceptables para pulverización.", "BAJA"));
            }

            // Temperatura
            if (d.getTemperatura() != null) {
                double t = d.getTemperatura().doubleValue();
                if (t > 35) {
                    lista.add(new Recomendacion("Agroquímicos",
                            "Temperatura superior a 35°C. Evitar aplicaciones — riesgo de fitotoxicidad.", "ALTA"));
                } else if (t <= 2) {
                    lista.add(new Recomendacion("Helada",
                            "Temperatura crítica. Proteger cultivos sensibles y diferir labores.", "ALTA"));
                }
            }

            // Humedad y hongos
            if (d.getHumedadPct() != null && d.getHumedadPct() > 80) {
                lista.add(new Recomendacion("Sanidad",
                        String.format("Humedad del %d%% — condiciones favorables para enfermedades fúngicas. Evaluar fungicidas.", d.getHumedadPct()),
                        "MEDIA"));
            }
        }

        // Lluvia en próximos días
        pronosticos.stream()
                .filter(p -> p.getProbabilidadLluvia() != null && p.getProbabilidadLluvia().doubleValue() >= 60)
                .findFirst()
                .ifPresent(p -> lista.add(new Recomendacion("Cosecha",
                        String.format("Probabilidad de lluvia del %.0f%% el %s. Considerar adelantar cosecha.", p.getProbabilidadLluvia(), p.getFecha()),
                        "MEDIA")));

        // Sin lluvia prolongada → riego
        long diasSinLluvia = pronosticos.stream()
                .filter(p -> p.getProbabilidadLluvia() == null || p.getProbabilidadLluvia().doubleValue() < 20)
                .count();
        if (diasSinLluvia >= 4) {
            lista.add(new Recomendacion("Riego",
                    String.format("Sin precipitaciones previstas por %d días. Evaluar necesidad de riego.", diasSinLluvia),
                    "MEDIA"));
        }

        if (lista.isEmpty()) {
            lista.add(new Recomendacion("General",
                    "Condiciones climáticas favorables para todas las labores de campo.", "BAJA"));
        }

        return new RecomendacionResponse(loteId, lote.getNombre(), lista, condicionGeneral);
    }
}
