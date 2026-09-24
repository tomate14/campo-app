package com.campoapp.finanzas.cotizacion;

// Feature 85: refresco y lectura de la cotizacion del Dolar BNA (oficial).
public interface CotizacionDolarService {

    // Obtiene la cotizacion desde la fuente y la persiste (append). Gated por enabled/configured.
    void refrescar();

    // Ultima cotizacion conocida; null si nunca se poblo.
    CotizacionDolarResponse obtenerActual();
}
