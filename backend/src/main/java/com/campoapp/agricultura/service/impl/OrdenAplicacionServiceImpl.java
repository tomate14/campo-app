package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.plagas.AplicacionFitosanitariaRequest;
import com.campoapp.agricultura.dto.plagas.AplicacionFitosanitariaResponse;
import com.campoapp.agricultura.dto.plagas.OperarioAsignableResponse;
import com.campoapp.agricultura.dto.plagas.OrdenAplicacionRequest;
import com.campoapp.agricultura.dto.plagas.OrdenAplicacionResponse;
import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.insumos.InsumoAgricola;
import com.campoapp.agricultura.entity.plagas.DeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.EstadoOrdenAplicacion;
import com.campoapp.agricultura.entity.plagas.OrdenAplicacion;
import com.campoapp.agricultura.entity.plagas.OrdenAplicacionNumero;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.insumos.InsumoAgricolaRepository;
import com.campoapp.agricultura.repository.plagas.DeteccionPlagaRepository;
import com.campoapp.agricultura.repository.plagas.OrdenAplicacionNumeroRepository;
import com.campoapp.agricultura.repository.plagas.OrdenAplicacionRepository;
import com.campoapp.agricultura.service.InsumoService;
import com.campoapp.agricultura.service.OrdenAplicacionService;
import com.campoapp.agricultura.service.PlagasService;
import com.campoapp.common.exception.BusinessException;
import com.campoapp.common.exception.ResourceNotFoundException;
import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.repository.OperarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdenAplicacionServiceImpl implements OrdenAplicacionService {
    private final OrdenAplicacionRepository ordenRepository;
    private final OrdenAplicacionNumeroRepository numeroRepository;
    private final DeteccionPlagaRepository deteccionRepository;
    private final LoteRepository loteRepository;
    private final OperarioRepository operarioRepository;
    private final InsumoAgricolaRepository insumoRepository;
    // Reutiliza el alta de aplicacion "normal" del sistema al aceptar la orden.
    private final PlagasService plagasService;
    // Feature 84: genera el movimiento de salida (costo/descuento de stock) al validar.
    private final InsumoService insumoService;

    @Override
    public List<OperarioAsignableResponse> listarOperariosAsignables() {
        return operarioRepository.findAllActive().stream()
                .filter(o -> o.getEstado() == null || "ACTIVO".equalsIgnoreCase(o.getEstado()))
                .map(o -> new OperarioAsignableResponse(
                        o.getId(),
                        o.getNombre(),
                        o.getApellido(),
                        o.getUser() != null ? o.getUser().getId() : null))
                .toList();
    }

    @Override
    public List<OrdenAplicacionResponse> listar(EstadoOrdenAplicacion estado, String operarioId, String responsableId, String loteId) {
        List<OrdenAplicacion> ordenes = ordenRepository.search(estado, blankToNull(operarioId), blankToNull(responsableId), blankToNull(loteId));
        Map<String, Long> numeros = numerosDe(ordenes);
        return ordenes.stream().map(o -> toResponse(o, numeros.get(o.getId()))).toList();
    }

    @Override
    public List<OrdenAplicacionResponse> listarPorLote(String loteId) {
        List<OrdenAplicacion> ordenes = ordenRepository.findActiveByLote(loteId);
        Map<String, Long> numeros = numerosDe(ordenes);
        return ordenes.stream().map(o -> toResponse(o, numeros.get(o.getId()))).toList();
    }

    @Override
    public OrdenAplicacionResponse obtener(String id) {
        OrdenAplicacion orden = findOrden(id);
        return toResponse(orden, numeroDe(id));
    }

    @Override
    @Transactional
    public OrdenAplicacionResponse crear(OrdenAplicacionRequest request) {
        Lote lote = findLote(request.loteId());
        DeteccionPlaga deteccion = findDeteccion(request.deteccionId());
        if (!deteccion.getLote().getId().equals(lote.getId())) {
            throw new BusinessException("La deteccion no pertenece al lote indicado");
        }
        String responsableId = resolveResponsable(request.responsableId());
        String operarioId = validateOperario(request.operarioId());
        InsumoAgricola insumo = resolveInsumoRequerido(request.insumoId());

        OrdenAplicacion orden = OrdenAplicacion.builder()
                .lote(lote)
                .deteccion(deteccion)
                .insumo(insumo)
                .fechaAplicacion(request.fechaAplicacion() != null ? request.fechaAplicacion() : LocalDateTime.now())
                .producto(request.producto())
                .principioActivo(request.principioActivo())
                .dosis(request.dosis())
                .unidadDosis(request.unidadDosis())
                .volumenCaldoLHa(request.volumenCaldoLHa())
                .superficieTratadaHa(request.superficieTratadaHa())
                .maquinariaId(request.maquinariaId())
                .observaciones(request.observaciones())
                .responsableId(responsableId)
                .operarioId(operarioId)
                .estado(EstadoOrdenAplicacion.PENDIENTE)
                .build();
        OrdenAplicacion saved = ordenRepository.save(orden);

        // Numero correlativo en tabla separada (AUTO_INCREMENT arranca en 1).
        Long numero = asignarNumero(saved.getId());
        return toResponse(saved, numero);
    }

    @Override
    @Transactional
    public OrdenAplicacionResponse actualizar(String id, OrdenAplicacionRequest request) {
        OrdenAplicacion orden = findOrden(id);
        if (orden.getEstado() != EstadoOrdenAplicacion.PENDIENTE) {
            throw new BusinessException("Solo se puede editar una orden pendiente");
        }
        Lote lote = findLote(request.loteId());
        DeteccionPlaga deteccion = findDeteccion(request.deteccionId());
        if (!deteccion.getLote().getId().equals(lote.getId())) {
            throw new BusinessException("La deteccion no pertenece al lote indicado");
        }
        orden.setLote(lote);
        orden.setDeteccion(deteccion);
        orden.setInsumo(resolveInsumoRequerido(request.insumoId()));
        orden.setFechaAplicacion(request.fechaAplicacion() != null ? request.fechaAplicacion() : orden.getFechaAplicacion());
        orden.setProducto(request.producto());
        orden.setPrincipioActivo(request.principioActivo());
        orden.setDosis(request.dosis());
        orden.setUnidadDosis(request.unidadDosis());
        orden.setVolumenCaldoLHa(request.volumenCaldoLHa());
        orden.setSuperficieTratadaHa(request.superficieTratadaHa());
        orden.setMaquinariaId(request.maquinariaId());
        orden.setObservaciones(request.observaciones());
        // El responsable no cambia (queda el creador); solo se puede reasignar el operario.
        orden.setOperarioId(validateOperario(request.operarioId()));
        return toResponse(ordenRepository.save(orden), numeroDe(id));
    }

    @Override
    @Transactional
    public OrdenAplicacionResponse aceptar(String id) {
        OrdenAplicacion orden = findOrden(id);
        assertOperarioAsignado(orden);
        // Idempotente: si ya la acepto, no cambia nada.
        if (orden.getEstado() == EstadoOrdenAplicacion.ACEPTADA) {
            return toResponse(orden, numeroDe(id));
        }
        if (orden.getEstado() != EstadoOrdenAplicacion.PENDIENTE) {
            throw new BusinessException("Solo se puede aceptar una orden pendiente");
        }
        // El operario acepta: la orden vuelve al responsable/admins para validar.
        // La aplicacion NO se genera aca, sino al validar.
        orden.setEstado(EstadoOrdenAplicacion.ACEPTADA);
        return toResponse(ordenRepository.save(orden), numeroDe(id));
    }

    @Override
    @Transactional
    public OrdenAplicacionResponse validar(String id) {
        OrdenAplicacion orden = findOrden(id);
        assertPuedeValidar(orden);
        // Idempotente: si ya se valido, no se duplica la aplicacion.
        if (orden.getEstado() == EstadoOrdenAplicacion.VALIDADA) {
            return toResponse(orden, numeroDe(id));
        }
        if (orden.getEstado() != EstadoOrdenAplicacion.ACEPTADA) {
            throw new BusinessException("La orden debe estar aceptada por el operario para poder validarse");
        }
        // Al validar se genera el registro de aplicacion normal del sistema;
        // el operario asignado es el aplicador.
        AplicacionFitosanitariaRequest aplicacionRequest = new AplicacionFitosanitariaRequest(
                orden.getFechaAplicacion(),
                orden.getProducto(),
                orden.getPrincipioActivo(),
                orden.getDosis(),
                orden.getUnidadDosis(),
                orden.getVolumenCaldoLHa(),
                orden.getSuperficieTratadaHa(),
                null,
                null,
                orden.getMaquinariaId(),
                orden.getOperarioId(),
                null,
                null,
                orden.getObservaciones()
        );
        AplicacionFitosanitariaResponse aplicacion = plagasService.crearAplicacion(orden.getDeteccion().getId(), aplicacionRequest);
        orden.setAplicacionId(aplicacion.id());
        orden.setEstado(EstadoOrdenAplicacion.VALIDADA);
        OrdenAplicacion validada = ordenRepository.save(orden);
        // Feature 84: al validar se genera el movimiento de salida que descuenta stock y toma el costo
        // del insumo del catalogo. El generador es idempotente por orden_aplicacion_id.
        if (validada.getInsumo() != null) {
            insumoService.generarSalidaPorOrden(validada, numeroDe(id));
        }
        return toResponse(validada, numeroDe(id));
    }

    @Override
    @Transactional
    public OrdenAplicacionResponse rechazar(String id, String motivo) {
        OrdenAplicacion orden = findOrden(id);
        assertOperarioAsignado(orden);
        if (orden.getEstado() != EstadoOrdenAplicacion.PENDIENTE) {
            throw new BusinessException("Solo se puede rechazar una orden pendiente");
        }
        orden.setEstado(EstadoOrdenAplicacion.RECHAZADA);
        orden.setMotivoRechazo(blankToNull(motivo));
        return toResponse(ordenRepository.save(orden), numeroDe(id));
    }

    // ---- Helpers ----

    private Long asignarNumero(String ordenId) {
        OrdenAplicacionNumero numero = OrdenAplicacionNumero.builder()
                .ordenAplicacionId(ordenId)
                .createdAt(LocalDateTime.now())
                .build();
        return numeroRepository.save(numero).getNumero();
    }

    private Long numeroDe(String ordenId) {
        return numeroRepository.findByOrdenAplicacionId(ordenId)
                .map(OrdenAplicacionNumero::getNumero)
                .orElse(null);
    }

    private Map<String, Long> numerosDe(List<OrdenAplicacion> ordenes) {
        if (ordenes.isEmpty()) {
            return Map.of();
        }
        List<String> ids = ordenes.stream().map(OrdenAplicacion::getId).toList();
        return numeroRepository.findByOrdenAplicacionIdIn(ids).stream()
                .collect(Collectors.toMap(OrdenAplicacionNumero::getOrdenAplicacionId, OrdenAplicacionNumero::getNumero, (a, b) -> a));
    }

    // Responsable = operario del usuario logueado; si no hay, se usa el id enviado (validado).
    private String resolveResponsable(String requestResponsableId) {
        String userId = currentUserId();
        if (userId != null) {
            Operario operario = operarioRepository.findActiveByUserId(userId).orElse(null);
            if (operario != null) {
                return operario.getId();
            }
        }
        String fallback = blankToNull(requestResponsableId);
        if (fallback == null) {
            throw new BusinessException("No se pudo determinar el responsable de la orden");
        }
        return validateOperario(fallback);
    }

    // Feature 84: el insumo del catalogo es requerido en las ordenes nuevas.
    private InsumoAgricola resolveInsumoRequerido(String insumoId) {
        String value = blankToNull(insumoId);
        if (value == null) {
            throw new BusinessException("El insumo aplicado es requerido");
        }
        return insumoRepository.findByIdAndDeletedAtIsNull(value)
                .orElseThrow(() -> new ResourceNotFoundException("Insumo no encontrado con id: " + value));
    }

    private String validateOperario(String operarioId) {
        String value = blankToNull(operarioId);
        if (value == null) {
            throw new BusinessException("El operario asignado es requerido");
        }
        operarioRepository.findActiveById(value)
                .orElseThrow(() -> new ResourceNotFoundException("Operario no encontrado con id: " + value));
        return value;
    }

    private String operarioNombre(String operarioId) {
        if (blankToNull(operarioId) == null) {
            return null;
        }
        return operarioRepository.findActiveById(operarioId)
                .map(o -> (o.getNombre() + " " + o.getApellido()).trim())
                .orElse(operarioId);
    }

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getPrincipal() instanceof String principal ? principal : null;
    }

    // Solo el operario asignado a la orden puede aceptarla o rechazarla.
    private void assertOperarioAsignado(OrdenAplicacion orden) {
        String userId = currentUserId();
        String operarioId = userId == null ? null
                : operarioRepository.findActiveByUserId(userId).map(Operario::getId).orElse(null);
        if (operarioId == null || !operarioId.equals(orden.getOperarioId())) {
            throw new AccessDeniedException("Solo el operario asignado puede aceptar o rechazar la orden");
        }
    }

    // Validar la orden lo puede hacer el responsable (creador) o un admin/super_admin.
    private void assertPuedeValidar(OrdenAplicacion orden) {
        if (isAdmin()) {
            return;
        }
        String userId = currentUserId();
        String operarioId = userId == null ? null
                : operarioRepository.findActiveByUserId(userId).map(Operario::getId).orElse(null);
        if (operarioId == null || !operarioId.equals(orden.getResponsableId())) {
            throw new AccessDeniedException("Solo el responsable o un administrador puede validar la orden");
        }
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ROLE_SUPER_ADMIN"));
    }

    private OrdenAplicacion findOrden(String id) {
        return ordenRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de aplicacion no encontrada con id: " + id));
    }

    private Lote findLote(String id) {
        return loteRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado con id: " + id));
    }

    private DeteccionPlaga findDeteccion(String id) {
        return deteccionRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deteccion de plaga no encontrada con id: " + id));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private OrdenAplicacionResponse toResponse(OrdenAplicacion o, Long numero) {
        DeteccionPlaga deteccion = o.getDeteccion();
        return new OrdenAplicacionResponse(
                o.getId(),
                numero,
                o.getLote().getId(),
                o.getLote().getNombre(),
                deteccion.getId(),
                deteccion.getCatalogoPlaga().getNombreComun(),
                o.getFechaAplicacion(),
                o.getProducto(),
                o.getPrincipioActivo(),
                o.getDosis(),
                o.getUnidadDosis(),
                o.getVolumenCaldoLHa(),
                o.getSuperficieTratadaHa(),
                o.getMaquinariaId(),
                o.getObservaciones(),
                o.getResponsableId(),
                operarioNombre(o.getResponsableId()),
                o.getOperarioId(),
                operarioNombre(o.getOperarioId()),
                o.getEstado(),
                o.getMotivoRechazo(),
                o.getAplicacionId(),
                o.getInsumo() != null ? o.getInsumo().getId() : null,
                o.getInsumo() != null ? o.getInsumo().getNombre() : null,
                o.getCreatedAt(),
                o.getUpdatedAt()
        );
    }
}
