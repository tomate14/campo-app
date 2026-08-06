package com.campoapp.demo;

/**
 * Contrato de un seeder de datos de demo por dominio (feature 76).
 *
 * Cada modulo (agricultura, plagas, ganaderia, etc.) implementa uno como
 * {@code @Component}. El {@link DemoDataRunner} los descubre por inyeccion de
 * {@code List<DemoSeeder>}, los ordena por {@link #orden()} y los ejecuta.
 *
 * Reglas:
 * - Debe ser IDEMPOTENTE: si sus filas (ids fijos {@code demo-*}) ya existen, no
 *   duplica; devuelve 0.
 * - Nunca borra datos que no sean demo.
 * - Usa los ids fijos de {@link DemoIds} para referenciar entidades de otros
 *   seeders (p. ej. lotes) que corren antes segun el {@code orden}.
 */
public interface DemoSeeder {

    /** Orden de ejecucion (menor primero). Respetar dependencias entre dominios. */
    int orden();

    /** Nombre corto del dominio, para el log. */
    String nombre();

    /** Crea los datos demo del dominio si faltan. Devuelve cuantas filas creo. */
    int sembrar();
}
