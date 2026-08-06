package com.campoapp.demo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * Orquestador del dataset de demo (feature 76).
 *
 * Corre al arrancar, DESPUES del {@code DataInitializer} (que crea el admin), solo
 * si {@code campo.demo.seed-enabled} esta en true. Descubre todos los
 * {@link DemoSeeder} por inyeccion, los ordena por {@code orden()} y ejecuta cada
 * uno de forma aislada (un fallo de un dominio no corta el resto). Cada seeder es
 * idempotente, asi que re-arrancar no duplica.
 */
@Slf4j
@Component
@Order(100)
@RequiredArgsConstructor
public class DemoDataRunner implements ApplicationRunner {

    private final DemoDataProperties properties;
    private final List<DemoSeeder> seeders;

    @Override
    public void run(ApplicationArguments args) {
        if (!properties.isSeedEnabled()) {
            log.info("Demo seed desactivado (campo.demo.seed-enabled=false). No se cargan datos de prueba.");
            return;
        }

        log.info("Demo seed ACTIVO: cargando datos de prueba ({} dominios)...", seeders.size());
        int total = 0;
        List<DemoSeeder> ordenados = seeders.stream()
                .sorted(Comparator.comparingInt(DemoSeeder::orden))
                .toList();

        for (DemoSeeder seeder : ordenados) {
            try {
                int creados = seeder.sembrar();
                total += creados;
                log.info("  demo [{}]: {} filas creadas.", seeder.nombre(), creados);
            } catch (Exception e) {
                // Un dominio que falle no debe cortar el arranque ni el resto del seed.
                log.warn("  demo [{}] fallo: {}", seeder.nombre(), e.getMessage(), e);
            }
        }
        log.info("Demo seed finalizado: {} filas creadas en total.", total);
    }
}
