package com.campoapp.reportes;

import com.campoapp.ganaderia.entity.AlertaPotrero;
import com.campoapp.ganaderia.entity.Potrero;
import com.campoapp.ganaderia.repository.AlertaPotreroRepository;
import com.campoapp.ganaderia.repository.AnimalPotreroRepository;
import com.campoapp.ganaderia.repository.AnimalRepository;
import com.campoapp.ganaderia.repository.AplicacionVacunaRepository;
import com.campoapp.ganaderia.repository.ControlPrenezRepository;
import com.campoapp.ganaderia.repository.DiagnosticoSanitarioRepository;
import com.campoapp.ganaderia.repository.DietaNutricionalRepository;
import com.campoapp.ganaderia.repository.PartoRepository;
import com.campoapp.ganaderia.repository.PesajeAnimalRepository;
import com.campoapp.ganaderia.repository.PotreroRepository;
import com.campoapp.ganaderia.repository.RegistroAlimentacionRepository;
import com.campoapp.ganaderia.repository.TratamientoMedicamentoRepository;
import com.campoapp.reportes.dto.ReporteGanaderoDashboardResponse;
import com.campoapp.reportes.service.impl.ReporteGanaderoDashboardServiceImpl;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Cubre el generador de alertas operativas de potrero (feature 49): las alertas
 * abiertas de la feature 47 deben aparecer en el dashboard con la gravedad
 * mapeada a prioridad (CRITICA colapsa en ALTA) y su fecha real de creacion.
 */
class ReporteGanaderoDashboardAlertasTest {

    // Todos los repos devuelven colecciones vacias por defecto: el dashboard
    // completo debe poder calcularse sin datos, igual que con una base recien creada.
    private static <T> T emptyRepo(Class<T> type) {
        return Mockito.mock(type, invocation -> {
            Class<?> returnType = invocation.getMethod().getReturnType();
            if (List.class.isAssignableFrom(returnType)) return List.of();
            if (Map.class.isAssignableFrom(returnType)) return Map.of();
            if (Optional.class.isAssignableFrom(returnType)) return Optional.empty();
            return Mockito.RETURNS_DEFAULTS.answer(invocation);
        });
    }

    private final AlertaPotreroRepository alertaPotreroRepository = emptyRepo(AlertaPotreroRepository.class);

    private final ReporteGanaderoDashboardServiceImpl service = new ReporteGanaderoDashboardServiceImpl(
            emptyRepo(AnimalRepository.class),
            emptyRepo(AnimalPotreroRepository.class),
            emptyRepo(PotreroRepository.class),
            emptyRepo(PesajeAnimalRepository.class),
            emptyRepo(RegistroAlimentacionRepository.class),
            emptyRepo(DietaNutricionalRepository.class),
            emptyRepo(AplicacionVacunaRepository.class),
            emptyRepo(DiagnosticoSanitarioRepository.class),
            emptyRepo(TratamientoMedicamentoRepository.class),
            emptyRepo(ControlPrenezRepository.class),
            emptyRepo(PartoRepository.class),
            alertaPotreroRepository
    );

    @Test
    void shouldIncludePotreroAlerts_whenOpenAlertsExist() {
        LocalDateTime created = LocalDateTime.of(2026, 7, 15, 10, 30);
        when(alertaPotreroRepository.search(isNull(), eq(AlertaPotrero.ESTADO_ABIERTA)))
                .thenReturn(List.of(
                        alerta("Norte", "CRITICA", "Aguada rota", created),
                        alerta("Sur", "BAJA", "Alambrado flojo", created.minusDays(1))
                ));

        ReporteGanaderoDashboardResponse response = service.dashboard();

        verify(alertaPotreroRepository).search(null, AlertaPotrero.ESTADO_ABIERTA);
        List<ReporteGanaderoDashboardResponse.AlertaOperativa> potreroAlerts = response.alertasOperativas().stream()
                .filter(a -> "Potreros".equals(a.tipo()))
                .toList();
        assertThat(potreroAlerts).hasSize(2);

        ReporteGanaderoDashboardResponse.AlertaOperativa critica = potreroAlerts.get(0);
        assertThat(critica.titulo()).isEqualTo("Alerta en Norte");
        assertThat(critica.detalle()).isEqualTo("Aguada rota");
        assertThat(critica.prioridad()).isEqualTo("ALTA");
        assertThat(critica.fechaGeneracion()).isEqualTo(created);

        ReporteGanaderoDashboardResponse.AlertaOperativa baja = potreroAlerts.get(1);
        assertThat(baja.titulo()).isEqualTo("Alerta en Sur");
        assertThat(baja.prioridad()).isEqualTo("BAJA");
    }

    @Test
    void shouldReturnEmptyAlerts_whenNoOpenAlertsExist() {
        ReporteGanaderoDashboardResponse response = service.dashboard();
        assertThat(response.alertasOperativas()).isEmpty();
    }

    private AlertaPotrero alerta(String potreroNombre, String gravedad, String observacion, LocalDateTime createdAt) {
        Potrero potrero = Potrero.builder().nombre(potreroNombre).build();
        AlertaPotrero alerta = AlertaPotrero.builder()
                .potrero(potrero)
                .usuarioId("user-1")
                .fecha(LocalDate.of(2026, 7, 15))
                .gravedad(gravedad)
                .observacion(observacion)
                .build();
        alerta.setCreatedAt(createdAt);
        return alerta;
    }
}
