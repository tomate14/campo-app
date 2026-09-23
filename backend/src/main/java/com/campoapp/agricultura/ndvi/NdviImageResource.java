package com.campoapp.agricultura.ndvi;

import java.nio.file.Path;
import java.time.Instant;

public record NdviImageResource(Path path, Instant generatedAt, long size, String version) {
}
