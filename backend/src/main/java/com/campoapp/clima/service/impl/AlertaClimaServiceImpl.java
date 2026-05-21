package com.campoapp.clima.service.impl;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.clima.dto.AlertaClimaResponse;
import com.campoapp.clima.entity.AlertaClima;
import com.campoapp.clima.entity.AlertaClima.Severidad;
import com.campoapp.clima.entity.AlertaClima.TipoAlerta;
import com.campoapp.clima.entity.DatoClima;
import com.campoapp.clima.entity.Pronostico;
import com.campoapp.clima.repository.AlertaClimaRepository;
import com.campoapp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AlertaClimaServiceImpl implements com.campoapp.clima.service.AlertaClimaService {

    private final AlertaClimaRepository alertaRepository;

    // Umbrales
    private static final double UMBRAL_HELADA_MEDIA   =  2.0;
    private static final double UMBRAL_HELADA_ALTA    =  0.0;
    private static final double UMBRAL_HELADA_CRITICA = -2.0;
    private static final double UMBRAL_VIENTO_FUERTE  = 13.9;  // m/s ≈ 50 km/h
    private static final double UMBRAL_VIENTO_CRITICO = 20.0;  // m/s ≈ 72 km/h
    private static final double UMBRAL_LLUVIA_ALTA    = 30.0;  // mm
    private static final double UMBRAL_LLUVIA_CRITICA = 60.0;  // mm
    private static final double UMBRAL_SEQUIA         = 30.0;  // humedad %
    private static final int    VENTANA_DEDUPLICACION = 6;     // horas

    @Override
    @Transactional
    public void generarAlertas(Lote lote, DatoClima dato, List<Pronostico> pronosticos) {
        List<AlertaClima> nuevas = new ArrayList<>();

        // Helada — temperatura actual
        if (dato.getTemperatura() != null) {
            double temp = dato.getTemperatura().doubleValue();
            if (temp <= UMBRAL_HELADA_MEDIA && !existeAlertaReciente(lote.getId(), TipoAlerta.HELADA)) {
                Severidad sev = temp <= UMBRAL_HELADA_CRITICA ? Severidad.CRITICA
                        : temp <= UMBRAL_HELADA_ALTA ? Severidad.ALTA : Severidad.MEDIA;
                nuevas.add(buildAlerta(lote, TipoAlerta.HELADA, sev,
                        String.format("Temperatura de %.1f°C — riesgo de helada. Proteger cultivos sensibles.", temp),
                        dato.getTemperatura()));
            }
        }

        // Viento fuerte — velocidad actual
        if (dato.getVelocidadViento() != null) {
            double viento = dato.getVelocidadViento().doubleValue();
            if (viento >= UMBRAL_VIENTO_FUERTE && !existeAlertaReciente(lote.getId(), TipoAlerta.VIENTO_FUERTE)) {
                Severidad sev = viento >= UMBRAL_VIENTO_CRITICO ? Severidad.ALTA : Severidad.MEDIA;
                nuevas.add(buildAlerta(lote, TipoAlerta.VIENTO_FUERTE, sev,
                        String.format("Viento de %.1f m/s (%.0f km/h). No realizar pulverizaciones.", viento, viento * 3.6),
                        dato.getVelocidadViento()));
            }
        }

        // Granizo / tormenta — código de condición
        if (dato.getCondicionCodigo() != null) {
            int cod = dato.getCondicionCodigo();
            if ((cod == 906 || cod == 621) && !existeAlertaReciente(lote.getId(), TipoAlerta.GRANIZO)) {
                nuevas.add(buildAlerta(lote, TipoAlerta.GRANIZO, Severidad.CRITICA,
                        "Alerta de granizo activa. Tomar medidas de protección inmediata.", null));
            }
            if (cod >= 200 && cod <= 232 && !existeAlertaReciente(lote.getId(), TipoAlerta.TORMENTA)) {
                nuevas.add(buildAlerta(lote, TipoAlerta.TORMENTA, Severidad.ALTA,
                        "Tormenta eléctrica activa. Suspender labores de campo.", null));
            }
        }

        // Sequía — humedad baja sin lluvia en pronóstico
        if (dato.getHumedadPct() != null && dato.getHumedadPct() < UMBRAL_SEQUIA) {
            boolean sinLluviaProxima = pronosticos.stream()
                    .filter(p -> p.getProbabilidadLluvia() != null)
                    .limit(3)
                    .allMatch(p -> p.getProbabilidadLluvia().doubleValue() < 20);
            if (sinLluviaProxima && !existeAlertaReciente(lote.getId(), TipoAlerta.SEQUIA)) {
                nuevas.add(buildAlerta(lote, TipoAlerta.SEQUIA, Severidad.MEDIA,
                        String.format("Humedad del %d%% con baja probabilidad de lluvia en los próximos días. Evaluar riego.", dato.getHumedadPct()),
                        BigDecimal.valueOf(dato.getHumedadPct())));
            }
        }

        // Lluvia excesiva en pronóstico
        pronosticos.stream()
                .filter(p -> p.getPrecipitacionMm() != null && p.getPrecipitacionMm().doubleValue() >= UMBRAL_LLUVIA_ALTA)
                .findFirst()
                .ifPresent(p -> {
                    if (!existeAlertaReciente(lote.getId(), TipoAlerta.LLUVIA_EXCESIVA)) {
                        double mm = p.getPrecipitacionMm().doubleValue();
                        Severidad sev = mm >= UMBRAL_LLUVIA_CRITICA ? Severidad.ALTA : Severidad.MEDIA;
                        nuevas.add(buildAlerta(lote, TipoAlerta.LLUVIA_EXCESIVA, sev,
                                String.format("Se esperan %.1f mm de lluvia el %s. Diferir cosecha y labores.", mm, p.getFecha()),
                                p.getPrecipitacionMm()));
                    }
                });

        alertaRepository.saveAll(nuevas);
    }

    @Override
    public List<AlertaClimaResponse> listarActivas(String loteId) {
        return alertaRepository.findActivasByLoteId(loteId).stream().map(this::toResponse).toList();
    }

    @Override
    public List<AlertaClimaResponse> listarTodas(String loteId) {
        return alertaRepository.findAllByLoteId(loteId).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public AlertaClimaResponse marcarLeida(String alertaId) {
        AlertaClima alerta = alertaRepository.findActiveById(alertaId)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta no encontrada: " + alertaId));
        alerta.setLeida(true);
        alerta.setActiva(false);
        return toResponse(alertaRepository.save(alerta));
    }

    // ── helpers ──────────────────────────────────────────────────────────

    private boolean existeAlertaReciente(String loteId, TipoAlerta tipo) {
        LocalDateTime desde = LocalDateTime.now().minusHours(VENTANA_DEDUPLICACION);
        return !alertaRepository.findActivaByTipoDesde(loteId, tipo, desde).isEmpty();
    }

    private AlertaClima buildAlerta(Lote lote, TipoAlerta tipo, Severidad severidad,
                                    String mensaje, BigDecimal valor) {
        return AlertaClima.builder()
                .lote(lote)
                .tipoAlerta(tipo)
                .severidad(severidad)
                .mensaje(mensaje)
                .valorMedido(valor)
                .fecha(LocalDateTime.now())
                .build();
    }

    private AlertaClimaResponse toResponse(AlertaClima a) {
        return new AlertaClimaResponse(
                a.getId(), a.getLote().getId(), a.getLote().getNombre(),
                a.getTipoAlerta(), a.getSeveridad(), a.getMensaje(),
                a.getValorMedido(), a.isActiva(), a.isLeida(),
                a.getFecha(), a.getCreatedAt()
        );
    }
}
