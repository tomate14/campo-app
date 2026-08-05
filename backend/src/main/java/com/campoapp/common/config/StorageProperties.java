package com.campoapp.common.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuracion de almacenamiento de archivos en filesystem (feature 54).
 * uploadsDir es la raiz donde se guardan los archivos subidos (ej: /app/uploads).
 */
@Component
@ConfigurationProperties(prefix = "campo.storage")
@Getter @Setter
public class StorageProperties {

    private String uploadsDir = "/app/uploads";
}
