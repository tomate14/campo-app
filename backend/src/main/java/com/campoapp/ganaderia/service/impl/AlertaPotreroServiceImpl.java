package com.campoapp.ganaderia.service.impl;

import com.campoapp.agricultura.entity.plagas.SeveridadPlaga;
import com.campoapp.auth.entity.User;
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
import com.campoapp.ganaderia.service.AlertaPotreroService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AlertaPotreroServiceImpl implements AlertaPotreroService {

    private final AlertaPotreroRepository alertaPotreroRepository;
    private final PotreroRepository potreroRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AlertaPotreroResponse crear(AlertaPotreroRequest request) {
        // El usuario sale siempre del token: el cliente no puede elegir otro usuario.
        String usuarioId = currentUserId();
        if (usuarioId == null) {
            throw new UnauthorizedException("No se pudo determinar el usuario autenticado para la alerta");
        }

        Potrero potrero = potreroRepository.findActiveById(request.potreroId())
                .orElseThrow(() -> new ResourceNotFoundException("Potrero no encontrado con id: " + request.potreroId()));

        AlertaPotrero alerta = AlertaPotrero.builder()
                .potrero(potrero)
                .usuarioId(usuarioId)
                .fecha(request.fecha())
                .gravedad(normalizeGravedad(request.gravedad()))
                .observacion(request.observacion().trim())
                .latitud(request.latitud())
                .longitud(request.longitud())
                .estado(AlertaPotrero.ESTADO_ABIERTA)
                .build();

        AlertaPotrero saved = alertaPotreroRepository.save(alerta);
        return toResponse(saved, Map.of(usuarioId, resolverNombreUsuario(usuarioId)));
    }

    @Override
    public List<AlertaPotreroResponse> listar(String potreroId, String estado) {
        List<AlertaPotrero> alertas = alertaPotreroRepository.search(blankToNull(potreroId), normalizeEstado(estado));
        Map<String, String> nombresUsuario = resolverNombresUsuarios(alertas);
        return alertas.stream().map(alerta -> toResponse(alerta, nombresUsuario)).toList();
    }

    @Override
    @Transactional
    public AlertaPotreroResponse resolver(String id) {
        AlertaPotrero alerta = alertaPotreroRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta de potrero no encontrada con id: " + id));
        alerta.setEstado(AlertaPotrero.ESTADO_RESUELTA);
        AlertaPotrero saved = alertaPotreroRepository.save(alerta);
        return toResponse(saved, Map.of(saved.getUsuarioId(), resolverNombreUsuario(saved.getUsuarioId())));
    }

    /** Mismo patron que IdempotencyFilter.currentUserId(): el principal del JWT es el userId. */
    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getPrincipal() instanceof String principal ? principal : null;
    }

    /** Valida la gravedad contra los mismos 4 niveles que usan las plagas de lotes. */
    private String normalizeGravedad(String gravedad) {
        try {
            return SeveridadPlaga.valueOf(gravedad.trim().toUpperCase(Locale.ROOT)).name();
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Gravedad invalida: " + gravedad + ". Valores permitidos: BAJA, MEDIA, ALTA, CRITICA");
        }
    }

    private String normalizeEstado(String estado) {
        String value = blankToNull(estado);
        return value == null ? null : value.toUpperCase(Locale.ROOT);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    /** Resuelve los nombres de usuario en batch; si un usuario no existe, se muestra el id crudo. */
    private Map<String, String> resolverNombresUsuarios(List<AlertaPotrero> alertas) {
        List<String> usuarioIds = alertas.stream()
                .map(AlertaPotrero::getUsuarioId)
                .distinct()
                .toList();
        if (usuarioIds.isEmpty()) {
            return Map.of();
        }
        return userRepository.findAllById(usuarioIds).stream()
                .collect(Collectors.toMap(User::getId, User::getName, (first, second) -> first));
    }

    private String resolverNombreUsuario(String usuarioId) {
        return userRepository.findActiveById(usuarioId)
                .map(User::getName)
                .orElse(usuarioId);
    }

    private AlertaPotreroResponse toResponse(AlertaPotrero alerta, Map<String, String> nombresUsuario) {
        return new AlertaPotreroResponse(
                alerta.getId(),
                alerta.getPotrero().getId(),
                alerta.getPotrero().getNombre(),
                alerta.getUsuarioId(),
                nombresUsuario.getOrDefault(alerta.getUsuarioId(), alerta.getUsuarioId()),
                alerta.getFecha(),
                alerta.getGravedad(),
                alerta.getObservacion(),
                alerta.getLatitud(),
                alerta.getLongitud(),
                alerta.getEstado(),
                alerta.getCreatedAt()
        );
    }
}
