package com.campoapp.clima.service.impl;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.clima.config.ClimaProperties;
import com.campoapp.clima.dto.DatoClimaResponse;
import com.campoapp.clima.dto.PronosticoResponse;
import com.campoapp.clima.dto.openmeteo.OpenMeteoForecastResponse;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClimaServiceImpl implements ClimaService {

    private static final String CURRENT_VARS = String.join(",",
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "pressure_msl",
            "wind_speed_10m",
            "wind_direction_10m",
            "precipitation",
            "cloud_cover",
            "weather_code",
            "is_day"
    );

    private static final String DAILY_VARS = String.join(",",
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "apparent_temperature_max",
            "apparent_temperature_min",
            "uv_index_max",
            "precipitation_probability_max",
            "precipitation_sum",
            "wind_speed_10m_max",
            "wind_direction_10m_dominant"
    );

    private final DatoClimaRepository datoClimaRepository;
    private final PronosticoRepository pronosticoRepository;
    private final LoteRepository loteRepository;
    private final AlertaClimaService alertaClimaService;
    private final ClimaProperties properties;

    @Qualifier("openMeteoRestClient")
    private final RestClient restClient;

    @Override
    @Transactional
    public DatoClimaResponse sincronizarLote(String loteId) {
        if (!properties.isConfigured()) {
            throw new BusinessException("Proveedor Open-Meteo no configurado");
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
        if (!properties.isConfigured()) {
            log.warn("Sincronizacion de clima omitida: Open-Meteo no configurado");
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

    private DatoClimaResponse doSincronizar(Lote lote) {
        OpenMeteoForecastResponse response = restClient.get()
                .uri(uriBuilder -> uriBuilder.path("/forecast")
                        .queryParam("latitude", lote.getLatitud())
                        .queryParam("longitude", lote.getLongitud())
                        .queryParam("current", CURRENT_VARS)
                        .queryParam("daily", DAILY_VARS)
                        .queryParam("forecast_days", properties.getForecastDays())
                        .queryParam("timezone", "auto")
                        .queryParam("wind_speed_unit", "ms")
                        .build())
                .retrieve()
                .body(OpenMeteoForecastResponse.class);

        if (response == null || response.current() == null || response.daily() == null) {
            throw new BusinessException("Open-Meteo no devolvio datos validos para el lote");
        }

        DatoClima dato = datoClimaRepository.save(mapToDatoClima(response, lote));

        pronosticoRepository.deleteByLoteId(lote.getId());
        List<Pronostico> pronosticos = mapToPronosticos(response.daily(), lote);
        pronosticoRepository.saveAll(pronosticos);

        alertaClimaService.generarAlertas(lote, dato, pronosticos);

        LocalDateTime corte = LocalDateTime.now().minusDays(properties.getRetencionDias());
        datoClimaRepository.purgarAntiguos(lote.getId(), corte);

        log.debug("Clima sincronizado para lote {} ({}) con Open-Meteo", lote.getNombre(), lote.getId());
        return toResponse(dato);
    }

    private DatoClima mapToDatoClima(OpenMeteoForecastResponse response, Lote lote) {
        OpenMeteoForecastResponse.Current current = response.current();
        int utcOffset = response.utc_offset_seconds() != null ? response.utc_offset_seconds() : 0;
        int weatherCode = current.weather_code() != null ? current.weather_code() : -1;
        WeatherDescriptor descriptor = weatherDescriptor(weatherCode, current.is_day() == null || current.is_day() == 1);

        return DatoClima.builder()
                .lote(lote)
                .timestampUtc(LocalDateTime.parse(current.time()).minusSeconds(utcOffset))
                .temperatura(current.temperature_2m())
                .sensacionTermica(current.apparent_temperature())
                .humedadPct(current.relative_humidity_2m())
                .presionHpa(current.pressure_msl())
                .velocidadViento(current.wind_speed_10m())
                .direccionViento(current.wind_direction_10m())
                .descripcion(descriptor.description())
                .iconoCodigo(descriptor.iconCode())
                .precipitacionesMm(current.precipitation())
                .nubosidadPct(current.cloud_cover())
                .condicionCodigo(current.weather_code())
                .nombreLocalidad(lote.getNombre())
                .build();
    }

    private List<Pronostico> mapToPronosticos(OpenMeteoForecastResponse.Daily daily, Lote lote) {
        int size = daily.time() != null ? daily.time().size() : 0;
        return IntStream.range(0, size)
                .mapToObj(index -> buildPronostico(index, daily, lote))
                .toList();
    }

    private Pronostico buildPronostico(int index, OpenMeteoForecastResponse.Daily daily, Lote lote) {
        int weatherCode = value(daily.weather_code(), index, -1);
        WeatherDescriptor descriptor = weatherDescriptor(weatherCode, true);

        return Pronostico.builder()
                .lote(lote)
                .fecha(LocalDate.parse(daily.time().get(index)))
                .tempMax(value(daily.temperature_2m_max(), index))
                .tempMin(value(daily.temperature_2m_min(), index))
                .apparentTempMax(value(daily.apparent_temperature_max(), index))
                .apparentTempMin(value(daily.apparent_temperature_min(), index))
                .uvIndexMax(value(daily.uv_index_max(), index))
                .probabilidadLluvia(value(daily.precipitation_probability_max(), index))
                .precipitacionMm(value(daily.precipitation_sum(), index))
                .descripcion(descriptor.description())
                .iconoCodigo(descriptor.iconCode())
                .velocidadViento(value(daily.wind_speed_10m_max(), index))
                .direccionVientoDominante(value(daily.wind_direction_10m_dominant(), index, null))
                .condicionCodigo(weatherCode >= 0 ? weatherCode : null)
                .build();
    }

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
                p.getTempMax(), p.getTempMin(), p.getApparentTempMax(), p.getApparentTempMin(),
                p.getHumedadPct(), p.getUvIndexMax(), p.getProbabilidadLluvia(), p.getPrecipitacionMm(),
                p.getDescripcion(), p.getIconoCodigo(), p.getVelocidadViento(),
                p.getDireccionVientoDominante(), p.getCondicionCodigo()
        );
    }

    private static BigDecimal value(List<BigDecimal> values, int index) {
        return values != null && index < values.size() ? values.get(index) : null;
    }

    private static Integer value(List<Integer> values, int index, Integer fallback) {
        return values != null && index < values.size() ? values.get(index) : fallback;
    }

    private static WeatherDescriptor weatherDescriptor(int code, boolean dayTime) {
        return switch (code) {
            case 0 -> new WeatherDescriptor(dayTime ? "Soleado" : "Despejado", dayTime ? "clear-day" : "clear-night");
            case 1, 2 -> new WeatherDescriptor("Intervalos de nubes y sol", dayTime ? "partly-cloudy-day" : "partly-cloudy-night");
            case 3 -> new WeatherDescriptor("Mayormente nublado", "cloudy");
            case 45, 48 -> new WeatherDescriptor("Niebla", "fog");
            case 51, 53, 55, 56, 57 -> new WeatherDescriptor("Lloviznas", "drizzle");
            case 61, 63, 65, 66, 67, 80, 81, 82 -> new WeatherDescriptor("Lluvias", "rain");
            case 71, 73, 75, 77, 85, 86 -> new WeatherDescriptor("Nevadas", "snow");
            case 95, 96, 99 -> new WeatherDescriptor("Tormentas", "storm");
            default -> new WeatherDescriptor("Condiciones variables", "cloudy");
        };
    }

    private record WeatherDescriptor(String description, String iconCode) {}
}
