package com.campoapp.demo;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuracion del dataset de demo (feature 76).
 *
 * {@code campo.demo.seed-enabled} (env {@code SEED_DEMO_DATA}) prende la carga de
 * datos de prueba al arrancar. Por defecto esta apagado: en un entorno normal la
 * app no siembra nada.
 */
@Component
@ConfigurationProperties(prefix = "campo.demo")
@Getter
@Setter
public class DemoDataProperties {

    /** Si es true, se carga el dataset de demo al arrancar (idempotente). */
    private boolean seedEnabled = false;
}
