package com.campoapp.operarios.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.operarios.dto.OperarioDocumentoRequest;
import com.campoapp.operarios.dto.OperarioDocumentoResponse;
import com.campoapp.operarios.dto.OperarioHistorialRolRequest;
import com.campoapp.operarios.dto.OperarioHistorialRolResponse;
import com.campoapp.operarios.dto.OperarioRequest;
import com.campoapp.operarios.dto.OperarioResponse;
import com.campoapp.operarios.dto.OperarioResumenResponse;
import com.campoapp.operarios.service.OperarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/operarios/gestion")
@RequiredArgsConstructor
public class OperarioGestionController {

    private final OperarioService operarioService;

    @GetMapping
    @PreAuthorize("hasAuthority('read:usuarios')")
    public ResponseEntity<ApiResponse<OperarioResumenResponse>> resumen(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String rol
    ) {
        return ResponseEntity.ok(ApiResponse.ok(operarioService.resumen(search, estado, rol)));
    }

    @GetMapping("/operarios")
    @PreAuthorize("hasAuthority('read:usuarios')")
    public ResponseEntity<ApiResponse<List<OperarioResponse>>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String rol
    ) {
        return ResponseEntity.ok(ApiResponse.ok(operarioService.listar(search, estado, rol)));
    }

    @GetMapping("/operarios/{id}")
    @PreAuthorize("hasAuthority('read:usuarios')")
    public ResponseEntity<ApiResponse<OperarioResponse>> obtener(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(operarioService.buscarPorId(id)));
    }

    @PostMapping("/operarios")
    @PreAuthorize("hasAuthority('create:usuarios')")
    public ResponseEntity<ApiResponse<OperarioResponse>> crear(@Valid @RequestBody OperarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(operarioService.crear(request)));
    }

    @PutMapping("/operarios/{id}")
    @PreAuthorize("hasAuthority('update:usuarios')")
    public ResponseEntity<ApiResponse<OperarioResponse>> actualizar(@PathVariable String id, @Valid @RequestBody OperarioRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(operarioService.actualizar(id, request)));
    }

    @DeleteMapping("/operarios/{id}")
    @PreAuthorize("hasAuthority('delete:usuarios')")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        operarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/documentos")
    @PreAuthorize("hasAuthority('update:usuarios')")
    public ResponseEntity<ApiResponse<OperarioDocumentoResponse>> documento(@Valid @RequestBody OperarioDocumentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(operarioService.agregarDocumento(request)));
    }

    @PostMapping("/roles")
    @PreAuthorize("hasAuthority('update:usuarios')")
    public ResponseEntity<ApiResponse<OperarioHistorialRolResponse>> rol(@Valid @RequestBody OperarioHistorialRolRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(operarioService.cambiarRol(request)));
    }
}
