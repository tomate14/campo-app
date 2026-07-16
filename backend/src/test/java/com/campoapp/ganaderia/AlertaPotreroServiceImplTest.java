package com.campoapp.ganaderia;

import com.campoapp.auth.repository.UserRepository;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.common.exception.UnauthorizedException;
import com.campoapp.ganaderia.dto.AlertaPotreroRequest;
import com.campoapp.ganaderia.dto.AlertaPotreroResponse;
import com.campoapp.ganaderia.entity.AlertaPotrero;
import com.campoapp.ganaderia.entity.Potrero;
import com.campoapp.ganaderia.repository.AlertaPotreroRepository;
import com.campoapp.ganaderia.repository.PotreroRepository;
import com.campoapp.ganaderia.service.impl.AlertaPotreroServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlertaPotreroServiceImplTest {

    @Mock private AlertaPotreroRepository alertaPotreroRepository;
    @Mock private PotreroRepository potreroRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private AlertaPotreroServiceImpl alertaPotreroService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(String userId) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userId, null, List.of()));
    }

    private Potrero potrero(String id, String nombre) {
        Potrero potrero = new Potrero();
        potrero.setId(id);
        potrero.setNombre(nombre);
        return potrero;
    }

    private AlertaPotreroRequest request() {
        return new AlertaPotreroRequest("potrero-1", LocalDate.of(2026, 7, 15), "ALTA", "Aguada rota", null, null);
    }

    @Test
    void shouldTakeUsuarioIdFromSecurityContextWhenCreating() {
        authenticateAs("user-123");
        when(potreroRepository.findActiveById("potrero-1")).thenReturn(Optional.of(potrero("potrero-1", "Potrero Norte")));
        when(alertaPotreroRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findActiveById("user-123")).thenReturn(Optional.empty());

        AlertaPotreroResponse response = alertaPotreroService.crear(request());

        ArgumentCaptor<AlertaPotrero> captor = ArgumentCaptor.forClass(AlertaPotrero.class);
        verify(alertaPotreroRepository).save(captor.capture());
        assertThat(captor.getValue().getUsuarioId()).isEqualTo("user-123");
        assertThat(response.usuarioId()).isEqualTo("user-123");
        // Sin usuario en la tabla, el nombre cae al id crudo.
        assertThat(response.usuarioNombre()).isEqualTo("user-123");
        assertThat(response.estado()).isEqualTo("ABIERTA");
        assertThat(response.potreroNombre()).isEqualTo("Potrero Norte");
    }

    @Test
    void shouldRejectCreateWhenNoAuthenticatedUser() {
        assertThatThrownBy(() -> alertaPotreroService.crear(request()))
                .isInstanceOf(UnauthorizedException.class);
        verify(alertaPotreroRepository, never()).save(any());
    }

    @Test
    void shouldRejectCreateWhenGravedadIsInvalid() {
        authenticateAs("user-123");
        when(potreroRepository.findActiveById("potrero-1")).thenReturn(Optional.of(potrero("potrero-1", "Potrero Norte")));

        AlertaPotreroRequest invalid = new AlertaPotreroRequest(
                "potrero-1", LocalDate.of(2026, 7, 15), "URGENTE", "Aguada rota", null, null);

        assertThatThrownBy(() -> alertaPotreroService.crear(invalid))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Gravedad invalida");
        verify(alertaPotreroRepository, never()).save(any());
    }

    @Test
    void shouldMarkAlertaAsResueltaWhenResolving() {
        AlertaPotrero alerta = AlertaPotrero.builder()
                .potrero(potrero("potrero-1", "Potrero Norte"))
                .usuarioId("user-123")
                .fecha(LocalDate.of(2026, 7, 15))
                .gravedad("ALTA")
                .observacion("Aguada rota")
                .build();
        alerta.setId("alerta-1");
        when(alertaPotreroRepository.findActiveById("alerta-1")).thenReturn(Optional.of(alerta));
        when(alertaPotreroRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findActiveById("user-123")).thenReturn(Optional.empty());

        AlertaPotreroResponse response = alertaPotreroService.resolver("alerta-1");

        assertThat(alerta.getEstado()).isEqualTo("RESUELTA");
        assertThat(response.estado()).isEqualTo("RESUELTA");
    }

    @Test
    void shouldThrowNotFoundWhenResolvingUnknownAlerta() {
        when(alertaPotreroRepository.findActiveById("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> alertaPotreroService.resolver("nope"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
