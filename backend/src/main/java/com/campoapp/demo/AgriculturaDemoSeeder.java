package com.campoapp.demo;

import com.campoapp.agricultura.entity.EventoSiembra;
import com.campoapp.agricultura.entity.HistoricoCultivo;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.PropiedadSuelo;
import com.campoapp.agricultura.entity.RegistroCosecha;
import com.campoapp.agricultura.repository.EventoSiembraRepository;
import com.campoapp.agricultura.repository.HistoricoCultivoRepository;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.PropiedadSueloRepository;
import com.campoapp.agricultura.repository.RegistroCosechaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Seeder de datos de demo del dominio Agricultura (feature 76).
 *
 * Crea un dataset chico pero coherente: 6 lotes con poligono GeoJSON, y para los
 * primeros 4 lotes eventos de siembra/monitoreo, registros de cosecha, historico de
 * cultivo y propiedad de suelo. Todo con ids fijos {@code demo-} para ser idempotente.
 *
 * Campos de catalogo (feature 72): {@code cultivo} = id de utilidad_cultivo,
 * {@code destino} = ids {@code dest-*}, {@code tipoPerdida} = ids {@code tperd-*}.
 */
@Component
@RequiredArgsConstructor
public class AgriculturaDemoSeeder implements DemoSeeder {

    private final LoteRepository loteRepository;
    private final EventoSiembraRepository eventoSiembraRepository;
    private final RegistroCosechaRepository registroCosechaRepository;
    private final HistoricoCultivoRepository historicoCultivoRepository;
    private final PropiedadSueloRepository propiedadSueloRepository;

    private static final String TEMPORADA = "2025/2026";
    private static final String TEMPORADA_ANTERIOR = "2024/2025";

    // Nombres y ubicaciones (dentro de Argentina, zona nucleo) de los 6 lotes demo.
    private static final String[] NOMBRES = {
            "Lote Demo Norte", "Lote Demo Sur", "Lote Demo Este",
            "Lote Demo Oeste", "Lote Demo Centro", "Lote Demo Ribera"
    };
    private static final double[] LATITUDES = {-33.5, -34.0, -34.5, -33.8, -34.2, -35.0};
    private static final double[] LONGITUDES = {-60.5, -61.0, -60.8, -61.5, -60.3, -61.8};
    private static final double[] AREAS = {45.5, 80.0, 120.25, 65.0, 95.5, 50.0};

    @Override
    public int orden() {
        return 10;
    }

    @Override
    public String nombre() {
        return "agricultura";
    }

    @Override
    @Transactional
    public int sembrar() {
        int creados = 0;

        // --- 6 lotes ---
        for (int i = 0; i < DemoIds.LOTES.length; i++) {
            creados += sembrarLote(i);
        }

        // --- Datos de campana solo para los primeros 4 lotes ---
        for (int i = 0; i < 4; i++) {
            String loteId = DemoIds.LOTES[i];
            Lote lote = loteRepository.findById(loteId).orElse(null);
            if (lote == null) {
                continue;
            }
            creados += sembrarEventos(lote, i);
            creados += sembrarCosechas(lote, i);
            creados += sembrarHistorico(lote, i);
            creados += sembrarSuelo(lote, i);
        }

        return creados;
    }

    /** Crea un lote demo si no existe. Devuelve 1 si lo creo, 0 si ya existia. */
    private int sembrarLote(int i) {
        String id = DemoIds.LOTES[i];
        if (loteRepository.existsById(id)) {
            return 0;
        }

        double lat = LATITUDES[i];
        double lon = LONGITUDES[i];

        Lote lote = Lote.builder()
                .nombre(NOMBRES[i])
                .area(BigDecimal.valueOf(AREAS[i]))
                .cultivo(DemoIds.CULTIVOS_LOTE[i])
                .latitud(BigDecimal.valueOf(lat))
                .longitud(BigDecimal.valueOf(lon))
                .temporada(TEMPORADA)
                .poligono(cuadrado(lat, lon))
                .phMinimo(BigDecimal.valueOf(5.8))
                .phMaximo(BigDecimal.valueOf(7.2))
                .fechaSiembra(LocalDate.of(2025, 11, 5).plusDays(i))
                .fechaCosechaEstimada(LocalDate.of(2026, 4, 15).plusDays(i))
                .build();
        lote.setId(id);
        loteRepository.save(lote);
        return 1;
    }

    /** Eventos de siembra + monitoreo fenologico para un lote. */
    private int sembrarEventos(Lote lote, int i) {
        int creados = 0;

        String siembraId = "demo-evt-siembra-" + (i + 1);
        if (!eventoSiembraRepository.existsById(siembraId)) {
            EventoSiembra siembra = EventoSiembra.builder()
                    .lote(lote)
                    .tipoEvento(EventoSiembra.TipoEvento.SIEMBRA)
                    .estadoFenologico("VE")
                    .descripcion("Siembra de campana " + TEMPORADA)
                    .fecha(LocalDate.of(2025, 11, 5).plusDays(i))
                    .build();
            siembra.setId(siembraId);
            eventoSiembraRepository.save(siembra);
            creados++;
        }

        String monitoreoId = "demo-evt-monitoreo-" + (i + 1);
        if (!eventoSiembraRepository.existsById(monitoreoId)) {
            EventoSiembra monitoreo = EventoSiembra.builder()
                    .lote(lote)
                    .tipoEvento(EventoSiembra.TipoEvento.MONITOREO_FENOLOGICO)
                    .estadoFenologico(i % 2 == 0 ? "V4" : "R1")
                    .descripcion("Monitoreo fenologico de rutina")
                    .fecha(LocalDate.of(2026, 1, 20).plusDays(i))
                    .build();
            monitoreo.setId(monitoreoId);
            eventoSiembraRepository.save(monitoreo);
            creados++;
        }

        return creados;
    }

    /** 1-2 registros de cosecha con rendimiento, destino y perdidas. */
    private int sembrarCosechas(Lote lote, int i) {
        int creados = 0;

        // Destinos y tipos de perdida de catalogo (feature 72), rotando por lote.
        String[] destinos = {"dest-camion", "dest-silo", "dest-puerto"};
        String[] tiposPerdida = {"tperd-cabezal", "tperd-cola", "tperd-otro"};

        String cosechaId = "demo-cosecha-" + (i + 1);
        if (!registroCosechaRepository.existsById(cosechaId)) {
            BigDecimal rendimiento = BigDecimal.valueOf(3200 + i * 350L); // kg/ha
            BigDecimal hectareas = BigDecimal.valueOf(AREAS[i]);
            BigDecimal toneladas = rendimiento
                    .multiply(hectareas)
                    .divide(BigDecimal.valueOf(1000));

            RegistroCosecha cosecha = RegistroCosecha.builder()
                    .lote(lote)
                    .fecha(LocalDate.of(2026, 4, 18).plusDays(i))
                    .rendimientoKgHa(rendimiento)
                    .toneladasTotal(toneladas)
                    .calidadGrano(RegistroCosecha.CalidadGrano.ESTANDAR)
                    .humedad(BigDecimal.valueOf(13.5))
                    .observaciones("Cosecha de campana " + TEMPORADA)
                    .areaRealCosechadaPct(BigDecimal.valueOf(98.0))
                    .hectareasCosechadas(hectareas)
                    .perdidaKgHa(BigDecimal.valueOf(120 + i * 10L))
                    .granosPerdidosKg(BigDecimal.valueOf((120 + i * 10L) * AREAS[i]))
                    .tipoPerdida(tiposPerdida[i % tiposPerdida.length])
                    .destino(destinos[i % destinos.length])
                    .destinoCantidadTn(toneladas)
                    .build();
            cosecha.setId(cosechaId);
            registroCosechaRepository.save(cosecha);
            creados++;
        }

        // Segundo dia de cosecha solo para los 2 primeros lotes.
        if (i < 2) {
            String cosechaId2 = "demo-cosecha-" + (i + 1) + "-b";
            if (!registroCosechaRepository.existsById(cosechaId2)) {
                BigDecimal rendimiento = BigDecimal.valueOf(2900 + i * 300L);
                BigDecimal hectareas = BigDecimal.valueOf(AREAS[i] / 2);
                BigDecimal toneladas = rendimiento
                        .multiply(hectareas)
                        .divide(BigDecimal.valueOf(1000));

                RegistroCosecha cosecha2 = RegistroCosecha.builder()
                        .lote(lote)
                        .fecha(LocalDate.of(2026, 4, 19).plusDays(i))
                        .rendimientoKgHa(rendimiento)
                        .toneladasTotal(toneladas)
                        .calidadGrano(RegistroCosecha.CalidadGrano.PREMIUM)
                        .humedad(BigDecimal.valueOf(12.8))
                        .observaciones("Segundo dia de cosecha")
                        .areaRealCosechadaPct(BigDecimal.valueOf(96.0))
                        .hectareasCosechadas(hectareas)
                        .perdidaKgHa(BigDecimal.valueOf(90 + i * 10L))
                        .granosPerdidosKg(BigDecimal.valueOf((90 + i * 10L) * (AREAS[i] / 2)))
                        .tipoPerdida(tiposPerdida[(i + 1) % tiposPerdida.length])
                        .destino(destinos[(i + 1) % destinos.length])
                        .destinoCantidadTn(toneladas)
                        .build();
                cosecha2.setId(cosechaId2);
                registroCosechaRepository.save(cosecha2);
                creados++;
            }
        }

        return creados;
    }

    /** Historico de cultivo de la temporada anterior. */
    private int sembrarHistorico(Lote lote, int i) {
        String id = "demo-historico-" + (i + 1);
        if (historicoCultivoRepository.existsById(id)) {
            return 0;
        }

        HistoricoCultivo historico = HistoricoCultivo.builder()
                .lote(lote)
                .cultivo(DemoIds.CULTIVOS_LOTE[(i + 1) % DemoIds.CULTIVOS_LOTE.length])
                .temporada(TEMPORADA_ANTERIOR)
                .fechaSiembra(LocalDate.of(2024, 11, 3).plusDays(i))
                .fechaCosecha(LocalDate.of(2025, 4, 10).plusDays(i))
                .rendimientoKgHa(BigDecimal.valueOf(3000 + i * 300L))
                .observaciones("Rotacion previa a la campana " + TEMPORADA)
                .build();
        historico.setId(id);
        historicoCultivoRepository.save(historico);
        return 1;
    }

    /** Propiedad de suelo (analisis) del lote. */
    private int sembrarSuelo(Lote lote, int i) {
        String id = "demo-suelo-" + (i + 1);
        if (propiedadSueloRepository.existsById(id)) {
            return 0;
        }

        PropiedadSuelo suelo = PropiedadSuelo.builder()
                .lote(lote)
                .fecha(LocalDate.of(2025, 10, 15).plusDays(i))
                .ph(BigDecimal.valueOf(6.2 + i * 0.1))
                .nitrogenoKgHa(BigDecimal.valueOf(45 + i * 5L))
                .fosforoKgHa(BigDecimal.valueOf(18 + i * 2L))
                .potasioKgHa(BigDecimal.valueOf(220 + i * 10L))
                .materiaOrganicaPct(BigDecimal.valueOf(3.2 + i * 0.2))
                .conductividadElectrica(BigDecimal.valueOf(0.85))
                .observaciones("Analisis previo a la siembra")
                .build();
        suelo.setId(id);
        propiedadSueloRepository.save(suelo);
        return 1;
    }

    /**
     * Construye un poligono GeoJSON (type=Polygon) cuadrado pequeno (~0.01 grados de
     * lado) alrededor del punto central. Coordenadas en orden [longitud, latitud] y
     * anillo cerrado (primer punto repetido al final), como valida LoteServiceImpl.
     */
    private String cuadrado(double lat, double lon) {
        double d = 0.01;
        double lonMin = lon - d;
        double lonMax = lon + d;
        double latMin = lat - d;
        double latMax = lat + d;
        return "{\"type\":\"Polygon\",\"coordinates\":[["
                + "[" + lonMin + "," + latMin + "],"
                + "[" + lonMax + "," + latMin + "],"
                + "[" + lonMax + "," + latMax + "],"
                + "[" + lonMin + "," + latMax + "],"
                + "[" + lonMin + "," + latMin + "]"
                + "]]}";
    }
}
