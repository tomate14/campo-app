package com.campoapp.agricultura;

import com.campoapp.agricultura.dto.RegistroCosechaRequest;
import com.campoapp.agricultura.dto.RegistroCosechaResponse;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.RegistroCosecha;
import com.campoapp.agricultura.entity.RegistroCosecha.CalidadGrano;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.RegistroCosechaRepository;
import com.campoapp.agricultura.service.impl.CosechaServiceImpl;
import com.campoapp.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CosechaServiceTest {

    @Mock private RegistroCosechaRepository cosechaRepository;
    @Mock private LoteRepository loteRepository;

    @InjectMocks
    private CosechaServiceImpl cosechaService;

    private Lote lote;
    private RegistroCosecha cosecha;

    @BeforeEach
    void setUp() {
        lote = new Lote();
        lote.setNombre("Lote B");
        lote.setArea(new BigDecimal("200.0"));
        lote.setCultivo("MAIZ");
        lote.setTemporada("2024/2025");

        cosecha = new RegistroCosecha();
        cosecha.setLote(lote);
        cosecha.setFecha(LocalDate.of(2025, 3, 15));
        cosecha.setRendimientoKgHa(new BigDecimal("8500.00"));
        cosecha.setToneladasTotal(new BigDecimal("1700.00"));
        cosecha.setCalidadGrano(CalidadGrano.PREMIUM);
        cosecha.setHumedad(new BigDecimal("14.5"));
    }

    @Test
    void shouldReturnCosechas_whenListarPorLoteIsCalled() {
        when(cosechaRepository.findByLoteId("lote-2")).thenReturn(List.of(cosecha));

        List<RegistroCosechaResponse> result = cosechaService.listarPorLote("lote-2");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).rendimientoKgHa()).isEqualByComparingTo(new BigDecimal("8500.00"));
    }

    @Test
    void shouldRegisterCosecha_whenValidRequestProvided() {
        RegistroCosechaRequest request = new RegistroCosechaRequest(
                "lote-2", LocalDate.now(),
                new BigDecimal("7800.00"), new BigDecimal("1560.00"),
                CalidadGrano.ESTANDAR, new BigDecimal("15.2"), "Sin novedades");

        when(loteRepository.findActiveById("lote-2")).thenReturn(Optional.of(lote));
        when(cosechaRepository.save(any(RegistroCosecha.class))).thenReturn(cosecha);

        RegistroCosechaResponse result = cosechaService.registrar(request);

        assertThat(result).isNotNull();
        verify(cosechaRepository).save(any(RegistroCosecha.class));
    }

    @Test
    void shouldThrowResourceNotFoundException_whenCosechaNotFound() {
        when(cosechaRepository.findActiveById("c-999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cosechaService.buscarPorId("c-999"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("c-999");
    }

    @Test
    void shouldReturnRendimientoPromedio_whenLoteHasCosechas() {
        when(cosechaRepository.calcularRendimientoPromedio("lote-2")).thenReturn(8250.0);

        Double promedio = cosechaService.calcularRendimientoPromedio("lote-2");

        assertThat(promedio).isEqualTo(8250.0);
    }

    @Test
    void shouldSoftDeleteCosecha_whenEliminarIsCalled() {
        when(cosechaRepository.findActiveById("c-1")).thenReturn(Optional.of(cosecha));
        when(cosechaRepository.save(any())).thenReturn(cosecha);

        cosechaService.eliminar("c-1");

        assertThat(cosecha.getDeletedAt()).isNotNull();
        verify(cosechaRepository).save(cosecha);
    }
}
