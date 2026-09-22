package com.campoapp.agricultura.ndvi;

import com.campoapp.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agricola/ndvi")
@RequiredArgsConstructor
@Tag(name = "NDVI", description = "Mapas de vigor vegetal Sentinel-2 por lote")
public class NdviController {

    private final NdviService ndviService;

    @GetMapping
    @PreAuthorize("hasAuthority('read:lotes')")
    @Operation(summary = "Listar disponibilidad y version del NDVI de los lotes activos")
    public ResponseEntity<ApiResponse<List<NdviManifestResponse>>> listarManifest() {
        return ResponseEntity.ok(ApiResponse.ok(ndviService.listarManifest()));
    }

    @GetMapping(value = "/{loteId}/imagen", produces = MediaType.IMAGE_PNG_VALUE)
    @PreAuthorize("hasAuthority('read:lotes')")
    @Operation(summary = "Descargar la ultima imagen NDVI de un lote activo")
    public ResponseEntity<Resource> obtenerImagen(@PathVariable String loteId) {
        NdviImageResource image = ndviService.obtenerImagen(loteId);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .contentLength(image.size())
                .lastModified(image.generatedAt())
                .eTag('"' + image.version() + '"')
                .cacheControl(CacheControl.noCache().cachePrivate().mustRevalidate())
                .body(new FileSystemResource(image.path()));
    }
}

