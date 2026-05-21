package com.campoapp.clima.controller;

import com.campoapp.clima.dto.AlertaClimaResponse;
import com.campoapp.clima.dto.DatoClimaResponse;
import com.campoapp.clima.dto.PronosticoResponse;
import com.campoapp.clima.dto.RecomendacionResponse;
import com.campoapp.clima.service.AlertaClimaService;
import com.campoapp.clima.service.ClimaService;
import com.campoapp.clima.service.RecomendacionService;
import com.campoapp.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clima")
@RequiredArgsConstructor
public class ClimaController {

    private final ClimaService climaService;
    private final AlertaClimaService alertaService;
    private final RecomendacionService recomendacionService;

    @GetMapping("/{loteId}/actual")
    @PreAuthorize("hasAuthority('read:clima')")
    public ResponseEntity<ApiResponse<DatoClimaResponse>> obtenerActual(@PathVariable String loteId) {
        return climaService.obtenerActual(loteId)
                .map(d -> ResponseEntity.ok(ApiResponse.ok(d)))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.ok(null)));
    }

    @GetMapping("/{loteId}/pronostico")
    @PreAuthorize("hasAuthority('read:clima')")
    public ResponseEntity<ApiResponse<List<PronosticoResponse>>> obtenerPronostico(@PathVariable String loteId) {
        return ResponseEntity.ok(ApiResponse.ok(climaService.obtenerPronostico(loteId)));
    }

    @GetMapping("/{loteId}/historico")
    @PreAuthorize("hasAuthority('read:clima')")
    public ResponseEntity<ApiResponse<List<DatoClimaResponse>>> obtenerHistorico(
            @PathVariable String loteId,
            @RequestParam(defaultValue = "7") int dias) {
        return ResponseEntity.ok(ApiResponse.ok(climaService.obtenerHistorico(loteId, dias)));
    }

    @GetMapping("/{loteId}/alertas")
    @PreAuthorize("hasAuthority('read:clima')")
    public ResponseEntity<ApiResponse<List<AlertaClimaResponse>>> obtenerAlertas(
            @PathVariable String loteId,
            @RequestParam(defaultValue = "true") boolean soloActivas) {
        List<AlertaClimaResponse> alertas = soloActivas
                ? alertaService.listarActivas(loteId)
                : alertaService.listarTodas(loteId);
        return ResponseEntity.ok(ApiResponse.ok(alertas));
    }

    @PutMapping("/alertas/{alertaId}/leer")
    @PreAuthorize("hasAuthority('update:clima')")
    public ResponseEntity<ApiResponse<AlertaClimaResponse>> marcarLeida(@PathVariable String alertaId) {
        return ResponseEntity.ok(ApiResponse.ok(alertaService.marcarLeida(alertaId)));
    }

    @GetMapping("/{loteId}/recomendaciones")
    @PreAuthorize("hasAuthority('read:clima')")
    public ResponseEntity<ApiResponse<RecomendacionResponse>> obtenerRecomendaciones(@PathVariable String loteId) {
        return ResponseEntity.ok(ApiResponse.ok(recomendacionService.obtenerRecomendaciones(loteId)));
    }

    @PostMapping("/{loteId}/sincronizar")
    @PreAuthorize("hasAuthority('create:clima')")
    public ResponseEntity<ApiResponse<DatoClimaResponse>> sincronizar(@PathVariable String loteId) {
        return ResponseEntity.ok(ApiResponse.ok(climaService.sincronizarLote(loteId)));
    }
}
