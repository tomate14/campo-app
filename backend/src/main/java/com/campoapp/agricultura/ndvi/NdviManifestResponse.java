package com.campoapp.agricultura.ndvi;

import java.time.Instant;

public record NdviManifestResponse(
        String loteId,
        String loteNombre,
        boolean disponible,
        Instant generadoAt,
        String version,
        String imagenUrl
) {
}
