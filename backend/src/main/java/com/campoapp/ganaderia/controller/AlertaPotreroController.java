package com.campoapp.ganaderia.controller;

import com.campoapp.common.dto.ApiResponse;
import com.campoapp.ganaderia.dto.AlertaPotreroRequest;
import com.campoapp.ganaderia.dto.AlertaPotreroResponse;
import com.campoapp.ganaderia.service.AlertaPotreroService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Alertas georreferenciadas sobre potreros (feature 47).
 *
 * El path literal /potreros/alertas convive con GET /potreros/{id} de
 * PotreroController: Spring MVC prioriza el segmento literal sobre la
 * variable de path, asi que no hay colision.
 */
@RestController
@RequestMapping("/api/v1/ganaderia/potreros/alertas")
@RequiredArgsConstructor
public class AlertaPotreroController {

    private final AlertaPotreroService alertaPotreroService;
    private final ObjectMapper objectMapper;

    @PostMapping
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<AlertaPotreroResponse>> crear(@Valid @RequestBody AlertaPotreroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(alertaPotreroService.crear(request)));
    }

    @PostMapping(value = "/con-foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<AlertaPotreroResponse>> crearConFoto(
            @RequestPart("payload") String payload,
            @RequestPart(value = "foto", required = false) MultipartFile foto) throws Exception {
        AlertaPotreroRequest request = objectMapper.readValue(payload, AlertaPotreroRequest.class);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(alertaPotreroService.crearConFoto(request, foto)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('read:animales')")
    public ResponseEntity<ApiResponse<List<AlertaPotreroResponse>>> listar(
            @RequestParam(required = false) String potreroId,
            @RequestParam(required = false) String estado
    ) {
        return ResponseEntity.ok(ApiResponse.ok(alertaPotreroService.listar(potreroId, estado)));
    }

    @PutMapping("/{id}/resolver")
    @PreAuthorize("hasAuthority('update:animales')")
    public ResponseEntity<ApiResponse<AlertaPotreroResponse>> resolver(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(alertaPotreroService.resolver(id)));
    }
}
