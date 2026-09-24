package com.campoapp.finanzas;

import com.campoapp.finanzas.cotizacion.CotizacionDolar;
import com.campoapp.finanzas.cotizacion.CotizacionDolarClient;
import com.campoapp.finanzas.cotizacion.CotizacionDolarProperties;
import com.campoapp.finanzas.cotizacion.CotizacionDolarRepository;
import com.campoapp.finanzas.cotizacion.CotizacionDolarResponse;
import com.campoapp.finanzas.cotizacion.impl.CotizacionDolarServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class CotizacionDolarServiceImplTest {

    private CotizacionDolarRepository repository;
    private CotizacionDolarClient client;
    private CotizacionDolarProperties properties;
    private CotizacionDolarServiceImpl service;

    @BeforeEach
    void setUp() {
        repository = mock(CotizacionDolarRepository.class);
        client = mock(CotizacionDolarClient.class);
        properties = new CotizacionDolarProperties();
        service = new CotizacionDolarServiceImpl(repository, client, properties);
    }

    @Test
    void refrescarPersisteLaCotizacionObtenida() {
        LocalDateTime fecha = LocalDateTime.of(2026, 9, 24, 11, 0);
        when(client.obtener()).thenReturn(Optional.of(
                new CotizacionDolarClient.Snapshot(new BigDecimal("1350.00"), new BigDecimal("1400.00"), fecha)));

        service.refrescar();

        ArgumentCaptor<CotizacionDolar> captor = ArgumentCaptor.forClass(CotizacionDolar.class);
        verify(repository).save(captor.capture());
        CotizacionDolar guardada = captor.getValue();
        assertThat(guardada.getCompra()).isEqualByComparingTo("1350.00");
        assertThat(guardada.getVenta()).isEqualByComparingTo("1400.00");
        assertThat(guardada.getFecha()).isEqualTo(fecha);
        assertThat(guardada.getFuente()).isEqualTo("Oficial BNA");
    }

    @Test
    void refrescarNoPersisteSiLaFuenteNoResponde() {
        when(client.obtener()).thenReturn(Optional.empty());

        service.refrescar();

        verify(repository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void refrescarNoHaceFetchSiEstaDeshabilitado() {
        properties.setEnabled(false);

        service.refrescar();

        verifyNoInteractions(client);
        verify(repository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void obtenerActualDevuelveLaUltimaCotizacion() {
        CotizacionDolar ultima = CotizacionDolar.builder()
                .compra(new BigDecimal("1350.00"))
                .venta(new BigDecimal("1400.00"))
                .fecha(LocalDateTime.of(2026, 9, 24, 14, 0))
                .fuente("Oficial BNA")
                .build();
        when(repository.findTopByOrderByFechaDescCreatedAtDesc()).thenReturn(Optional.of(ultima));

        CotizacionDolarResponse actual = service.obtenerActual();

        assertThat(actual).isNotNull();
        assertThat(actual.compra()).isEqualByComparingTo("1350.00");
        assertThat(actual.venta()).isEqualByComparingTo("1400.00");
        assertThat(actual.fecha()).isEqualTo(LocalDateTime.of(2026, 9, 24, 14, 0));
        assertThat(actual.fuente()).isEqualTo("Oficial BNA");
    }

    @Test
    void obtenerActualDevuelveNullSiNoHayCotizaciones() {
        when(repository.findTopByOrderByFechaDescCreatedAtDesc()).thenReturn(Optional.empty());

        assertThat(service.obtenerActual()).isNull();
    }
}
