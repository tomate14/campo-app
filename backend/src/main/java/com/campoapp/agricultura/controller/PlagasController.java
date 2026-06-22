package com.campoapp.agricultura.controller;

import com.campoapp.agricultura.dto.plagas.*;
import com.campoapp.agricultura.entity.plagas.EstadoDeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.SeveridadPlaga;
import com.campoapp.agricultura.entity.plagas.TipoPlaga;
import com.campoapp.agricultura.service.PlagasService;
import com.campoapp.common.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agricola/plagas")
@RequiredArgsConstructor
@Tag(name = "Control de plagas", description = "Detecciones, seguimientos y aplicaciones fitosanitarias")
public class PlagasController {
    private final PlagasService plagasService;
    private final ObjectMapper objectMapper;

    @GetMapping("/catalogo")
    @PreAuthorize("hasAuthority('read:lotes')")
    @Operation(summary = "Listar catalogo de plagas, enfermedades y malezas")
    public ResponseEntity<ApiResponse<List<CatalogoPlagaResponse>>> catalogo(@RequestParam(required = false) TipoPlaga tipo) {
        return ResponseEntity.ok(ApiResponse.ok(plagasService.listarCatalogo(tipo)));
    }

    @PostMapping("/catalogo")
    @PreAuthorize("hasAuthority('create:lotes')")
    @Operation(summary = "Crear item de catalogo de plagas")
    public ResponseEntity<ApiResponse<CatalogoPlagaResponse>> crearCatalogo(@Valid @RequestBody CatalogoPlagaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(plagasService.crearCatalogo(request)));
    }

    @GetMapping("/detecciones")
    @PreAuthorize("hasAuthority('read:lotes')")
    @Operation(summary = "Listar detecciones de plagas")
    public ResponseEntity<ApiResponse<List<DeteccionPlagaResponse>>> detecciones(
            @RequestParam(required = false) String loteId,
            @RequestParam(required = false) EstadoDeteccionPlaga estado,
            @RequestParam(required = false) SeveridadPlaga severidad,
            @RequestParam(required = false) String cultivo) {
        return ResponseEntity.ok(ApiResponse.ok(plagasService.listarDetecciones(loteId, estado, severidad, cultivo)));
    }

    @PostMapping("/detecciones")
    @PreAuthorize("hasAuthority('create:lotes')")
    @Operation(summary = "Registrar deteccion de plaga")
    public ResponseEntity<ApiResponse<DeteccionPlagaResponse>> crearDeteccion(@Valid @RequestBody DeteccionPlagaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(plagasService.crearDeteccion(request)));
    }

    @PostMapping(value = "/detecciones/con-foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('create:lotes')")
    @Operation(summary = "Registrar deteccion con foto opcional")
    public ResponseEntity<ApiResponse<DeteccionPlagaResponse>> crearDeteccionConFoto(
            @RequestPart("payload") String payload,
            @RequestPart(value = "foto", required = false) MultipartFile foto) throws Exception {
        DeteccionPlagaRequest base = objectMapper.readValue(payload, DeteccionPlagaRequest.class);
        DeteccionPlagaRequest request = foto == null ? base : new DeteccionPlagaRequest(
                base.loteId(), base.catalogoPlagaId(), base.fechaDeteccion(), base.cultivo(), base.severidad(),
                base.areaAfectadaHa(), base.porcentajeAfectado(), base.estado(), base.latitud(), base.longitud(),
                base.precisionMetros(), base.origenGeolocalizacion(), "/uploads/plagas/" + foto.getOriginalFilename(),
                foto.getOriginalFilename(), foto.getContentType(), foto.getSize(), base.descripcion(), base.responsableId(), base.responsable());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(plagasService.crearDeteccion(request)));
    }

    @GetMapping("/detecciones/{id}")
    @PreAuthorize("hasAuthority('read:lotes')")
    public ResponseEntity<ApiResponse<DeteccionPlagaResponse>> obtener(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(plagasService.obtenerDeteccion(id)));
    }

    @PatchMapping("/detecciones/{id}/estado")
    @PreAuthorize("hasAuthority('create:lotes')")
    public ResponseEntity<ApiResponse<DeteccionPlagaResponse>> cambiarEstado(@PathVariable String id, @RequestParam EstadoDeteccionPlaga estado) {
        return ResponseEntity.ok(ApiResponse.ok(plagasService.cambiarEstado(id, estado)));
    }

    @PostMapping("/detecciones/{id}/seguimientos")
    @PreAuthorize("hasAuthority('create:lotes')")
    public ResponseEntity<ApiResponse<SeguimientoPlagaResponse>> crearSeguimiento(@PathVariable String id, @Valid @RequestBody SeguimientoPlagaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(plagasService.crearSeguimiento(id, request)));
    }

    @PostMapping("/detecciones/{id}/aplicaciones")
    @PreAuthorize("hasAuthority('create:lotes')")
    public ResponseEntity<ApiResponse<AplicacionFitosanitariaResponse>> crearAplicacion(@PathVariable String id, @Valid @RequestBody AplicacionFitosanitariaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(plagasService.crearAplicacion(id, request)));
    }

    @GetMapping("/aplicaciones")
    @PreAuthorize("hasAuthority('read:lotes')")
    public ResponseEntity<ApiResponse<List<AplicacionFitosanitariaResponse>>> aplicaciones() {
        return ResponseEntity.ok(ApiResponse.ok(plagasService.listarAplicaciones()));
    }

    @GetMapping("/seguimientos")
    @PreAuthorize("hasAuthority('read:lotes')")
    public ResponseEntity<ApiResponse<List<SeguimientoPlagaResponse>>> seguimientos() {
        return ResponseEntity.ok(ApiResponse.ok(plagasService.listarSeguimientos()));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('read:lotes')")
    public ResponseEntity<ApiResponse<PlagasDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(plagasService.dashboard()));
    }

    @GetMapping("/lotes/{loteId}/historial")
    @PreAuthorize("hasAuthority('read:lotes')")
    public ResponseEntity<ApiResponse<List<DeteccionPlagaResponse>>> historial(@PathVariable String loteId) {
        return ResponseEntity.ok(ApiResponse.ok(plagasService.historialLote(loteId)));
    }

    @GetMapping("/lotes/{loteId}/mapa")
    @PreAuthorize("hasAuthority('read:lotes')")
    public ResponseEntity<ApiResponse<List<DeteccionPlagaResponse>>> mapa(@PathVariable String loteId) {
        return ResponseEntity.ok(ApiResponse.ok(plagasService.mapaLote(loteId)));
    }

    @PostMapping("/geolocalizacion/resolver-lote")
    @PreAuthorize("hasAuthority('read:lotes')")
    public ResponseEntity<ApiResponse<ResolverLoteResponse>> resolverLote(@RequestBody ResolverLoteRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(plagasService.resolverLote(request)));
    }
}
