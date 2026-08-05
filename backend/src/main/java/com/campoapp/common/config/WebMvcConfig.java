package com.campoapp.common.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Sirve de forma estatica los archivos subidos (feature 54).
 * Mapea /uploads/** al directorio fisico configurado en campo.storage.uploads-dir.
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final StorageProperties storageProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Se normaliza el path a URI absoluta con "/" final para que Spring lo trate como directorio.
        String location = Paths.get(storageProperties.getUploadsDir()).toAbsolutePath().toUri().toString();
        if (!location.endsWith("/")) {
            location = location + "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}
