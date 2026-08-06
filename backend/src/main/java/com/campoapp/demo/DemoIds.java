package com.campoapp.demo;

/**
 * Ids fijos del dataset de demo (feature 76).
 *
 * Todos con prefijo {@code demo-} para poder ser idempotente (existsById) y para
 * que los seeders de un dominio referencien entidades sembradas por otro. Los ids
 * que se referencian entre dominios (lotes, operarios) viven aca; cada seeder puede
 * definir ademas los ids propios de su dominio con el mismo prefijo.
 */
public final class DemoIds {

    private DemoIds() {}

    /** Prefijo de todo id de demo. Sirve para detectar/filtrar datos de prueba. */
    public static final String PREFIX = "demo-";

    /** Lotes demo (agricultura). Referenciados por plagas, insumos y clima. */
    public static final String[] LOTES = {
            "demo-lote-1", "demo-lote-2", "demo-lote-3",
            "demo-lote-4", "demo-lote-5", "demo-lote-6"
    };

    /** Operarios demo. Referenciados por ordenes de trabajo y otros. */
    public static final String[] OPERARIOS = {
            "demo-oper-1", "demo-oper-2", "demo-oper-3", "demo-oper-4"
    };

    /** Cultivos (ids de utilidad_cultivo, feature 72) asignados a los lotes demo, en orden. */
    public static final String[] CULTIVOS_LOTE = {
            "cult-soja", "cult-maiz", "cult-trigo",
            "cult-girasol", "cult-sorgo", "cult-soja"
    };
}
