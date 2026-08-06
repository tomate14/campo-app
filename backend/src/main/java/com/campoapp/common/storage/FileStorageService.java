package com.campoapp.common.storage;

import com.campoapp.common.config.StorageProperties;
import com.campoapp.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Guarda y borra imagenes en filesystem (feature 54).
 * Los archivos se ubican bajo {uploadsDir}/plagas-catalogo/ con nombre aleatorio.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class FileStorageService {

    private static final String PLAGAS_SUBDIR = "plagas-catalogo";
    private static final long MAX_SIZE_BYTES = 5_000_000L;
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png", "image/webp");

    private final StorageProperties storageProperties;

    /**
     * Guarda la imagen bajo plagas-catalogo/{uuid}.{ext} y devuelve el path relativo
     * (ej: plagas-catalogo/uuid.jpg). Nunca usa el nombre original del archivo.
     */
    public String storePlagaImage(MultipartFile file) {
        validateImage(file);
        String extension = resolveExtension(file);
        String relativePath = PLAGAS_SUBDIR + "/" + UUID.randomUUID() + extension;
        Path target = resolveAbsolute(relativePath);
        try {
            Files.createDirectories(target.getParent());
            file.transferTo(target);
        } catch (IOException e) {
            throw new BusinessException("No se pudo guardar la imagen");
        }
        return relativePath;
    }

    /**
     * Guarda bytes crudos (no MultipartFile) bajo {subfolder}/{uuid}.{ext} y devuelve el path
     * relativo. La extension se deriva del content-type (image/jpeg->jpg, png->png, webp->webp,
     * default jpg). Valida tamano <= 5MB. Usado por el sync de referencia GBIF (feature 73).
     */
    public String storeBytes(byte[] data, String contentType, String subfolder) {
        if (data == null || data.length == 0) {
            throw new BusinessException("No hay bytes para guardar");
        }
        if (data.length > MAX_SIZE_BYTES) {
            throw new BusinessException("La imagen supera el tamano maximo permitido");
        }
        String relativePath = subfolder + "/" + UUID.randomUUID() + extensionFromContentType(contentType);
        Path target = resolveAbsolute(relativePath);
        try {
            Files.createDirectories(target.getParent());
            Files.write(target, data);
        } catch (IOException e) {
            throw new BusinessException("No se pudo guardar la imagen");
        }
        return relativePath;
    }

    // Extension segun content-type; default .jpg cuando el tipo no es reconocido.
    private String extensionFromContentType(String contentType) {
        if (contentType == null) {
            return ".jpg";
        }
        String normalized = contentType.toLowerCase(Locale.ROOT);
        if (normalized.contains("png")) {
            return ".png";
        }
        if (normalized.contains("webp")) {
            return ".webp";
        }
        return ".jpg";
    }

    /**
     * Borra el archivo fisico por path relativo. Best-effort: no falla si el archivo no existe.
     */
    public void deleteQuietly(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }
        try {
            Files.deleteIfExists(resolveAbsolute(relativePath));
        } catch (IOException | RuntimeException e) {
            log.warn("No se pudo borrar el archivo fisico {}: {}", relativePath, e.getMessage());
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("La imagen es requerida");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BusinessException("Formato de imagen no permitido");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BusinessException("La imagen supera el tamano maximo permitido");
        }
    }

    // Extension segun content-type; si no matchea, se cae al sufijo del nombre original.
    private String resolveExtension(MultipartFile file) {
        String contentType = file.getContentType();
        if ("image/jpeg".equals(contentType)) {
            return ".jpg";
        }
        if ("image/png".equals(contentType)) {
            return ".png";
        }
        if ("image/webp".equals(contentType)) {
            return ".webp";
        }
        String original = file.getOriginalFilename();
        if (original != null) {
            int dot = original.lastIndexOf('.');
            if (dot >= 0 && dot < original.length() - 1) {
                return "." + original.substring(dot + 1).toLowerCase(Locale.ROOT);
            }
        }
        return "";
    }

    private Path resolveAbsolute(String relativePath) {
        return Paths.get(storageProperties.getUploadsDir()).toAbsolutePath().resolve(relativePath).normalize();
    }
}
