package com.campoapp.operarios.service.impl;

import com.campoapp.auth.entity.Role;
import com.campoapp.auth.entity.User;
import com.campoapp.auth.repository.RoleRepository;
import com.campoapp.auth.repository.UserRepository;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.operarios.dto.OperarioDashboardResponse;
import com.campoapp.operarios.dto.OperarioDocumentoRequest;
import com.campoapp.operarios.dto.OperarioDocumentoResponse;
import com.campoapp.operarios.dto.OperarioHistorialRolRequest;
import com.campoapp.operarios.dto.OperarioHistorialRolResponse;
import com.campoapp.operarios.dto.OperarioRequest;
import com.campoapp.operarios.dto.OperarioResponse;
import com.campoapp.operarios.dto.OperarioResumenResponse;
import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.entity.OperarioDocumento;
import com.campoapp.operarios.entity.OperarioHistorialRol;
import com.campoapp.operarios.repository.OperarioDocumentoRepository;
import com.campoapp.operarios.repository.OperarioHistorialRolRepository;
import com.campoapp.operarios.repository.OperarioRepository;
import com.campoapp.operarios.service.OperarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OperarioServiceImpl implements OperarioService {

    private static final String DEFAULT_ESTADO = "ACTIVO";
    private static final String DEFAULT_DOCUMENTO_TIPO = "DNI";
    private static final String DEFAULT_DOCUMENTO_ESTADO = "VIGENTE";
    private final OperarioRepository operarioRepository;
    private final OperarioDocumentoRepository documentoRepository;
    private final OperarioHistorialRolRepository historialRolRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public OperarioResumenResponse resumen(String search, String estado, String rol) {
        List<OperarioResponse> operarios = listar(search, estado, rol);
        return new OperarioResumenResponse(
                dashboard(),
                operarios,
                documentoRepository.findAllActive().stream().limit(8).map(this::toDocumentoResponse).toList(),
                historialRolRepository.findAllActive().stream().limit(8).map(this::toHistorialRolResponse).toList()
        );
    }

    @Override
    public List<OperarioResponse> listar(String search, String estado, String rol) {
        return operarioRepository.search(blankToNull(search), blankToNull(estado), blankToNull(rol))
                .stream()
                .map(this::toOperarioResponse)
                .toList();
    }

    @Override
    public OperarioResponse buscarPorId(String id) {
        return toOperarioResponse(findOperario(id));
    }

    @Override
    @Transactional
    public OperarioResponse crear(OperarioRequest request) {
        String username = generateAvailableUsername(request.nombre(), request.apellido());
        validateUnique(username, request.documentoNumero(), null);
        Operario operario = Operario.builder()
                .user(createUserForOperario(request, username))
                .legajo(username)
                .nombre(required(request.nombre(), "nombre"))
                .apellido(required(request.apellido(), "apellido"))
                .documentoTipo(defaultText(request.documentoTipo(), DEFAULT_DOCUMENTO_TIPO))
                .documentoNumero(required(request.documentoNumero(), "documentoNumero"))
                .telefono(blankToNull(request.telefono()))
                .direccion(blankToNull(request.direccion()))
                .fechaNacimiento(request.fechaNacimiento())
                .rolOperativo(required(request.rolOperativo(), "rolOperativo"))
                .permisosOperativos(blankToNull(request.permisosOperativos()))
                .estado(defaultText(request.estado(), DEFAULT_ESTADO))
                .fechaIngreso(request.fechaIngreso())
                .salarioBase(normalizeMoney(request.salarioBase()))
                .contactoEmergencia(blankToNull(request.contactoEmergencia()))
                .telefonoEmergencia(blankToNull(request.telefonoEmergencia()))
                .observaciones(blankToNull(request.observaciones()))
                .build();
        return toOperarioResponse(operarioRepository.save(operario));
    }

    @Override
    @Transactional
    public OperarioResponse actualizar(String id, OperarioRequest request) {
        Operario operario = findOperario(id);
        String username = operario.getLegajo();
        if (username == null || username.isBlank()) {
            username = generateAvailableUsername(request.nombre(), request.apellido());
            operario.setLegajo(username);
        }
        validateUnique(username, request.documentoNumero(), id);
        if (operario.getUser() == null) {
            operario.setUser(createUserForOperario(request, username));
        }
        operario.setNombre(required(request.nombre(), "nombre"));
        operario.setApellido(required(request.apellido(), "apellido"));
        operario.setDocumentoTipo(defaultText(request.documentoTipo(), DEFAULT_DOCUMENTO_TIPO));
        operario.setDocumentoNumero(required(request.documentoNumero(), "documentoNumero"));
        operario.setTelefono(blankToNull(request.telefono()));
        operario.setDireccion(blankToNull(request.direccion()));
        operario.setFechaNacimiento(request.fechaNacimiento());
        operario.setRolOperativo(required(request.rolOperativo(), "rolOperativo"));
        operario.setPermisosOperativos(blankToNull(request.permisosOperativos()));
        operario.setEstado(defaultText(request.estado(), DEFAULT_ESTADO));
        operario.setFechaIngreso(request.fechaIngreso());
        operario.setSalarioBase(normalizeMoney(request.salarioBase()));
        operario.setContactoEmergencia(blankToNull(request.contactoEmergencia()));
        operario.setTelefonoEmergencia(blankToNull(request.telefonoEmergencia()));
        operario.setObservaciones(blankToNull(request.observaciones()));
        return toOperarioResponse(operarioRepository.save(operario));
    }

    @Override
    @Transactional
    public void eliminar(String id) {
        Operario operario = findOperario(id);
        operario.softDelete();
        operarioRepository.save(operario);
    }

    @Override
    @Transactional
    public OperarioDocumentoResponse agregarDocumento(OperarioDocumentoRequest request) {
        OperarioDocumento documento = OperarioDocumento.builder()
                .operario(findOperario(request.operarioId()))
                .tipoDocumento(required(request.tipoDocumento(), "tipoDocumento"))
                .numero(blankToNull(request.numero()))
                .fechaEmision(request.fechaEmision())
                .fechaVencimiento(request.fechaVencimiento())
                .estado(defaultText(request.estado(), DEFAULT_DOCUMENTO_ESTADO))
                .url(blankToNull(request.url()))
                .observaciones(blankToNull(request.observaciones()))
                .build();
        return toDocumentoResponse(documentoRepository.save(documento));
    }

    @Override
    @Transactional
    public OperarioHistorialRolResponse cambiarRol(OperarioHistorialRolRequest request) {
        Operario operario = findOperario(request.operarioId());
        String rolAnterior = operario.getRolOperativo();
        String rolNuevo = required(request.rolNuevo(), "rolNuevo");
        operario.setRolOperativo(rolNuevo);
        OperarioHistorialRol historial = OperarioHistorialRol.builder()
                .operario(operario)
                .rolAnterior(rolAnterior)
                .rolNuevo(rolNuevo)
                .fecha(request.fecha() == null ? LocalDate.now() : request.fecha())
                .responsable(blankToNull(request.responsable()))
                .motivo(blankToNull(request.motivo()))
                .build();
        operarioRepository.save(operario);
        return toHistorialRolResponse(historialRolRepository.save(historial));
    }

    private OperarioDashboardResponse dashboard() {
        List<Operario> operarios = operarioRepository.findAllActive();
        LocalDate now = LocalDate.now();
        return new OperarioDashboardResponse(
                operarios.size(),
                operarios.stream().filter((operario) -> "ACTIVO".equalsIgnoreCase(operario.getEstado())).count(),
                operarios.stream().filter((operario) -> "DISPONIBLE".equalsIgnoreCase(operario.getEstado()) || "ACTIVO".equalsIgnoreCase(operario.getEstado())).count(),
                documentoRepository.countByDeletedAtIsNullAndFechaVencimientoBefore(now)
        );
    }

    private Operario findOperario(String id) {
        return operarioRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Operario no encontrado con id: " + id));
    }

    private void validateUnique(String legajo, String documentoNumero, String currentId) {
        String normalizedLegajo = required(legajo, "legajo");
        String normalizedDocumento = required(documentoNumero, "documentoNumero");
        if (currentId == null) {
            if (operarioRepository.existsByLegajoAndDeletedAtIsNull(normalizedLegajo)) {
                throw new BusinessException("Ya existe un operario con ese legajo");
            }
            if (operarioRepository.existsByDocumentoNumeroAndDeletedAtIsNull(normalizedDocumento)) {
                throw new BusinessException("Ya existe un operario con ese documento");
            }
            return;
        }
        operarioRepository.findAllActive().stream()
                .filter((operario) -> !operario.getId().equals(currentId))
                .filter((operario) -> normalizedLegajo.equalsIgnoreCase(operario.getLegajo()) || normalizedDocumento.equalsIgnoreCase(operario.getDocumentoNumero()))
                .findFirst()
                .ifPresent((ignored) -> {
                    throw new BusinessException("Legajo o documento ya utilizado por otro operario");
                });
    }

    private OperarioResponse toOperarioResponse(Operario operario) {
        String userId = operario.getUser() == null ? null : operario.getUser().getId();
        String username = operario.getUser() == null ? operario.getLegajo() : operario.getUser().getEmail();
        return new OperarioResponse(
                operario.getId(),
                userId,
                username,
                operario.getLegajo(),
                operario.getNombre(),
                operario.getApellido(),
                fullName(operario),
                operario.getDocumentoTipo(),
                operario.getDocumentoNumero(),
                operario.getTelefono(),
                operario.getDireccion(),
                operario.getFechaNacimiento(),
                operario.getRolOperativo(),
                operario.getPermisosOperativos(),
                operario.getEstado(),
                operario.getFechaIngreso(),
                operario.getSalarioBase(),
                operario.getContactoEmergencia(),
                operario.getTelefonoEmergencia(),
                operario.getObservaciones(),
                operario.getCreatedAt(),
                operario.getUpdatedAt()
        );
    }

    private User createUserForOperario(OperarioRequest request, String username) {
        Role operarioRole = roleRepository.findByName("operario")
                .orElseThrow(() -> new IllegalStateException("Rol 'operario' no encontrado. Verificar migracion V1."));
        User user = User.builder()
                .email(username)
                .passwordHash(passwordEncoder.encode(username))
                .name(fullName(request.nombre(), request.apellido()))
                .phone(blankToNull(request.telefono()))
                .active(true)
                .emailVerified(true)
                // El usuario generado desde operarios debe cambiar la contraseña inicial en el primer login
                .mustChangePassword(true)
                .roles(Set.of(operarioRole))
                .build();
        return userRepository.save(user);
    }

    private String generateAvailableUsername(String nombre, String apellido) {
        String firstName = required(nombre, "nombre");
        String firstLastName = required(apellido, "apellido").split("\\s+")[0];
        String base = normalizeUsername(firstName.substring(0, 1) + firstLastName);
        if (base.isBlank()) {
            throw new BusinessException("No se pudo generar el nombre de usuario");
        }
        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByEmail(candidate) || operarioRepository.existsByLegajoAndDeletedAtIsNull(candidate)) {
            candidate = base + suffix;
            suffix++;
        }
        return candidate;
    }

    private String normalizeUsername(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "");
        return normalized.trim();
    }

    private OperarioDocumentoResponse toDocumentoResponse(OperarioDocumento documento) {
        return new OperarioDocumentoResponse(
                documento.getId(),
                documento.getOperario().getId(),
                fullName(documento.getOperario()),
                documento.getTipoDocumento(),
                documento.getNumero(),
                documento.getFechaEmision(),
                documento.getFechaVencimiento(),
                documento.getEstado(),
                documento.getUrl(),
                documento.getObservaciones(),
                documento.getFechaVencimiento() != null && documento.getFechaVencimiento().isBefore(LocalDate.now()),
                documento.getCreatedAt()
        );
    }

    private OperarioHistorialRolResponse toHistorialRolResponse(OperarioHistorialRol historial) {
        return new OperarioHistorialRolResponse(
                historial.getId(),
                historial.getOperario().getId(),
                fullName(historial.getOperario()),
                historial.getRolAnterior(),
                historial.getRolNuevo(),
                historial.getFecha(),
                historial.getResponsable(),
                historial.getMotivo(),
                historial.getCreatedAt()
        );
    }

    private String fullName(Operario operario) {
        return (operario.getNombre() + " " + operario.getApellido()).trim();
    }

    private String fullName(String nombre, String apellido) {
        return (required(nombre, "nombre") + " " + required(apellido, "apellido")).trim();
    }

    private String required(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new BusinessException("El campo " + field + " es requerido");
        }
        return value.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private BigDecimal normalizeMoney(BigDecimal value) {
        if (value == null) {
            return null;
        }
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("El salario no puede ser negativo");
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

}
