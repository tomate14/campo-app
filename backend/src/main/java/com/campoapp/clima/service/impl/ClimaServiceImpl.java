package com.campoapp.clima.service.impl;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.clima.config.ClimaProperties;
import com.campoapp.clima.dto.DatoClimaResponse;
import com.campoapp.clima.dto.PronosticoResponse;
import com.campoapp.clima.dto.owm.OWMCurrentResponse;
import com.campoapp.clima.dto.owm.OWMForecastResponse;
import com.campoapp.clima.entity.DatoClima;
import com.campoapp.clima.entity.Pronostico;
import com.campoapp.clima.repository.DatoClimaRepository;
import com.campoapp.clima.repository.PronosticoRepository;
import com.campoapp.clima.service.AlertaClimaService;
import com.campoapp.clima.service.ClimaService;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClimaServiceImpl implements ClimaService {

    private final DatoClimaRepository datoClimaRepository;
    private final PronosticoRepository pronosticoRepository;
    private final LoteRepository loteRepository;
    private final AlertaClimaService alertaClimaService;
    private final ClimaProperties properties;

    @Qualifier("owmRestClient")
    private final RestClient restClient;

    @Override
    @Transactional
    public DatoClimaResponse sincronizarLote(String loteId) {
        if (!properties.isApiKeyConfigured()) {
            throw new BusinessException("API key de OpenWeatherMap no configurada (OWM_API_KEY)");
        }
        Lote lote = loteRepository.findActiveById(loteId)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado: " + loteId));
        if (lote.getLatitud() == null || lote.getLongitud() == null) {
            throw new BusinessException("El lote no tiene coordenadas definidas");
        }
        return doSincronizar(lote);
    }

    @Override
    @Transactional
    public void sincronizarTodosLotes() {
        if (!properties.isApiKeyConfigured()) {
            log.warn("Sincronización de clima omitida: OWM_API_KEY no configurada");
            return;
        }
        List<Lote> lotes = loteRepository.findAllActive().stream()
                .filter(l -> l.getLatitud() != null && l.getLongitud() != null)
                .toList();
        log.info("Sincronizando clima para {} lotes", lotes.size());
        lotes.forEach(lote -> {
            try {
                doSincronizar(lote);
            } catch (RestClientException e) {
                log.error("Error al sincronizar clima para lote {}: {}", lote.getId(), e.getMessage());
            }
        });
    }

    @Override
    public Optional<DatoClimaResponse> obtenerActual(String loteId) {
        return datoClimaRepository.findUltimoByLoteId(loteId).map(this::toResponse);
    }

    @Override
    public List<PronosticoResponse> obtenerPronostico(String loteId) {
        return pronosticoRepository.findByLoteIdDesde(loteId, LocalDate.now())
                .stream().map(this::toPronosticoResponse).toList();
    }

    @Override
    public List<DatoClimaResponse> obtenerHistorico(String loteId, int dias) {
        LocalDateTime desde = LocalDateTime.now().minusDays(Math.min(dias, properties.getRetencionDias()));
        return datoClimaRepository.findHistorico(loteId, desde)
                .stream().map(this::toResponse).toList();
    }

    // ── core sync ────────────────────────────────────────────────────────

    private DatoClimaResponse doSincronizar(Lote lote) {
        String apiKey = properties.getOpenweathermap().getApiKey();
        double lat = lote.getLatitud().doubleValue();
        double lon = lote.getLongitud().doubleValue();

        OWMCurrentResponse current = restClient.get()
                .uri(u -> u.path("/weather")
                        .queryParam("lat", lat)
                        .queryParam("lon", lon)
                        .queryParam("appid", apiKey)
                        .queryParam("units", "metric")
                        .queryParam("lang", "es")
                        .build())
                .retrieve()
                .body(OWMCurrentResponse.class);

        DatoClima dato = mapToDatoClima(current, lote);
        dato = datoClimaRepository.save(dato);

        OWMForecastResponse forecast = restClient.get()
                .uri(u -> u.path("/forecast")
                        .queryParam("lat", lat)
                        .queryParam("lon", lon)
                        .queryParam("cnt", 40)
                        .queryParam("appid", apiKey)
                        .queryParam("units", "metric")
                        .queryParam("lang", "es")
                        .build())
                .retrieve()
                .body(OWMForecastResponse.class);

        pronosticoRepository.deleteByLoteId(lote.getId());
        List<Pronostico> pronosticos = agregarDiario(forecast, lote);
        pronosticoRepository.saveAll(pronosticos);

        alertaClimaService.generarAlertas(lote, dato, pronosticos);

        LocalDateTime corte = LocalDateTime.now().minusDays(properties.getRetencionDias());
        datoClimaRepository.purgarAntiguos(lote.getId(), corte);

        log.debug("Clima sincronizado para lote {} ({})", lote.getNombre(), lote.getId());
        return toResponse(dato);
    }

    private DatoClima mapToDatoClima(OWMCurrentResponse r, Lote lote) {
        OWMCurrentResponse.MainData m = r.main();
        OWMCurrentResponse.WindData w = r.wind();
        OWMCurrentResponse.WeatherItem wi = r.weather().isEmpty() ? null : r.weather().get(0);

        Double rainMm = null;
        if (r.rain() != null) {
            rainMm = r.rain().oneHour() != null ? r.rain().oneHour() : r.rain().threeHour();
        }

        return DatoClima.builder()
                .lote(lote)
                .timestampUtc(LocalDateTime.ofEpochSecond(r.dt(), 0, ZoneOffset.UTC))
                .temperatura(bd(m.temp()))
                .sensacionTermica(bd(m.feelsLike()))
                .tempMin(bd(m.tempMin()))
                .tempMax(bd(m.tempMax()))
                .humedadPct(m.humidity())
                .presionHpa(m.pressure())
                .velocidadViento(bd(w.speed()))
                .direccionViento(w.deg())
                .descripcion(wi != null ? wi.description() : null)
                .iconoCodigo(wi != null ? wi.icon() : null)
                .condicionCodigo(wi != null ? wi.id() : null)
                .precipitacionesMm(rainMm != null ? bd(rainMm) : null)
                .nubosidadPct(r.clouds() != null ? r.clouds().all() : null)
                .nombreLocalidad(r.name())
                .build();
    }

    private List<Pronostico> agregarDiario(OWMForecastResponse r, Lote lote) {
        // Agrupa items 3-horarios por día local (America/Argentina/Buenos_Aires)
        ZoneId zona = ZoneId.of("America/Argentina/Buenos_Aires");

        Map<LocalDate, List<OWMForecastResponse.ForecastItem>> porDia = r.list().stream()
                .collect(Collectors.groupingBy(item ->
                        Instant.ofEpochSecond(item.dt()).atZone(zona).toLocalDate()));

        return porDia.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> buildPronostico(e.getKey(), e.getValue(), lote))
                .toList();
    }

    private Pronostico buildPronostico(LocalDate fecha,
                                       List<OWMForecastResponse.ForecastItem> items,
                                       Lote lote) {
        double tempMax = items.stream().mapToDouble(i -> i.main().tempMax()).max().orElse(0);
        double tempMin = items.stream().mapToDouble(i -> i.main().tempMin()).min().orElse(0);
        double humPromedio = items.stream().mapToDouble(i -> i.main().humidity()).average().orElse(0);
        double popMax = items.stream().mapToDouble(OWMForecastResponse.ForecastItem::pop).max().orElse(0);
        double precipTotal = items.stream()
                .mapToDouble(i -> i.rain() != null && i.rain().threeHour() != null ? i.rain().threeHour() : 0)
                .sum();
        double vientoPromedio = items.stream().mapToDouble(i -> i.wind().speed()).average().orElse(0);

        // Usar el item del mediodía para descripción e icono
        ZoneId zona = ZoneId.of("America/Argentina/Buenos_Aires");
        OWMForecastResponse.ForecastItem itemMediodia = items.stream()
                .min(Comparator.comparingLong(i ->
                        Math.abs(Instant.ofEpochSecond(i.dt()).atZone(zona).getHour() - 12)))
                .orElse(items.get(0));

        OWMForecastResponse.WeatherItem wi = itemMediodia.weather().isEmpty() ? null : itemMediodia.weather().get(0);

        return Pronostico.builder()
                .lote(lote)
                .fecha(fecha)
                .tempMax(bd(tempMax))
                .tempMin(bd(tempMin))
                .humedadPct((int) humPromedio)
                .probabilidadLluvia(bd(popMax * 100))
                .precipitacionMm(bd(precipTotal))
                .descripcion(wi != null ? wi.description() : null)
                .iconoCodigo(wi != null ? wi.icon() : null)
                .condicionCodigo(wi != null ? wi.id() : null)
                .velocidadViento(bd(vientoPromedio))
                .build();
    }

    // ── mappers ──────────────────────────────────────────────────────────

    private DatoClimaResponse toResponse(DatoClima d) {
        return new DatoClimaResponse(
                d.getId(), d.getLote().getId(), d.getLote().getNombre(),
                d.getTimestampUtc(), d.getTemperatura(), d.getSensacionTermica(),
                d.getTempMin(), d.getTempMax(), d.getHumedadPct(), d.getPresionHpa(),
                d.getVelocidadViento(), d.getDireccionViento(), d.getDescripcion(),
                d.getIconoCodigo(), d.getPrecipitacionesMm(), d.getNubosidadPct(),
                d.getCondicionCodigo(), d.getNombreLocalidad(), d.getCreatedAt()
        );
    }

    private PronosticoResponse toPronosticoResponse(Pronostico p) {
        return new PronosticoResponse(
                p.getId(), p.getLote().getId(), p.getFecha(),
                p.getTempMax(), p.getTempMin(), p.getHumedadPct(),
                p.getProbabilidadLluvia(), p.getPrecipitacionMm(),
                p.getDescripcion(), p.getIconoCodigo(),
                p.getVelocidadViento(), p.getCondicionCodigo()
        );
    }

    private static BigDecimal bd(double value) {
        return BigDecimal.valueOf(Math.round(value * 100.0) / 100.0);
    }
}
