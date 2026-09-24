package com.campoapp.finanzas.cotizacion.impl;

import com.campoapp.finanzas.cotizacion.CotizacionDolar;
import com.campoapp.finanzas.cotizacion.CotizacionDolarClient;
import com.campoapp.finanzas.cotizacion.CotizacionDolarProperties;
import com.campoapp.finanzas.cotizacion.CotizacionDolarRepository;
import com.campoapp.finanzas.cotizacion.CotizacionDolarResponse;
import com.campoapp.finanzas.cotizacion.CotizacionDolarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

// Feature 85: implementacion del refresco/lectura de la cotizacion del Dolar BNA (oficial).
@Slf4j
@Service
@RequiredArgsConstructor
public class CotizacionDolarServiceImpl implements CotizacionDolarService {

    // Fuente/casa que se persiste con cada cotizacion.
    private static final String FUENTE = "Oficial BNA";

    private final CotizacionDolarRepository repository;
    private final CotizacionDolarClient client;
    private final CotizacionDolarProperties properties;

    @Override
    @Transactional
    public void refrescar() {
        if (!properties.isEnabled() || !properties.isConfigured()) {
            log.info("Cotizacion Dolar BNA deshabilitada o sin URL: se omite el refresco");
            return;
        }
        Optional<CotizacionDolarClient.Snapshot> snapshot = client.obtener();
        if (snapshot.isEmpty()) {
            log.warn("No se pudo refrescar la cotizacion del Dolar BNA (se mantiene la ultima)");
            return;
        }
        CotizacionDolarClient.Snapshot s = snapshot.get();
        CotizacionDolar cotizacion = CotizacionDolar.builder()
                .compra(s.compra())
                .venta(s.venta())
                .fecha(s.fecha())
                .fuente(FUENTE)
                .build();
        repository.save(cotizacion);
        log.info("Cotizacion Dolar BNA actualizada: compra={} venta={} fecha={}",
                s.compra(), s.venta(), s.fecha());
    }

    @Override
    @Transactional(readOnly = true)
    public CotizacionDolarResponse obtenerActual() {
        return repository.findTopByOrderByFechaDescCreatedAtDesc()
                .map(c -> new CotizacionDolarResponse(c.getCompra(), c.getVenta(), c.getFecha(), c.getFuente()))
                .orElse(null);
    }
}
