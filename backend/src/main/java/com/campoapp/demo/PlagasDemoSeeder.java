package com.campoapp.demo;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.agricultura.entity.plagas.AplicacionFitosanitaria;
import com.campoapp.agricultura.entity.plagas.CatalogoPlaga;
import com.campoapp.agricultura.entity.plagas.DeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.EstadoDeteccionPlaga;
import com.campoapp.agricultura.entity.plagas.OrigenGeolocalizacion;
import com.campoapp.agricultura.entity.plagas.ResultadoSeguimientoPlaga;
import com.campoapp.agricultura.entity.plagas.SeguimientoPlaga;
import com.campoapp.agricultura.entity.plagas.SeveridadPlaga;
import com.campoapp.agricultura.repository.LoteRepository;
import com.campoapp.agricultura.repository.plagas.AplicacionFitosanitariaRepository;
import com.campoapp.agricultura.repository.plagas.CatalogoPlagaRepository;
import com.campoapp.agricultura.repository.plagas.DeteccionPlagaRepository;
import com.campoapp.agricultura.repository.plagas.SeguimientoPlagaRepository;
import com.campoapp.operarios.entity.Operario;
import com.campoapp.operarios.repository.OperarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Seeder de demo del dominio Plagas (feature 76, orden 20).
 *
 * Corre despues de los lotes (orden 10) y operarios (orden 8). NO crea plagas de
 * catalogo: reutiliza las 3 sembradas por migracion (Oruga cogollera, Roya asiatica,
 * Yuyo colorado), obtenidas por nombre comun. Es idempotente por id fijo demo-*.
 */
@Component
@RequiredArgsConstructor
public class PlagasDemoSeeder implements DemoSeeder {

    private final DeteccionPlagaRepository deteccionRepo;
    private final SeguimientoPlagaRepository seguimientoRepo;
    private final AplicacionFitosanitariaRepository aplicacionRepo;
    private final CatalogoPlagaRepository catalogoRepo;
    private final LoteRepository loteRepo;
    private final OperarioRepository operarioRepo;

    // Coordenadas base plausibles (nucleo pampeano) por si el lote no tiene lat/long.
    private static final BigDecimal BASE_LAT = new BigDecimal("-33.1200000");
    private static final BigDecimal BASE_LON = new BigDecimal("-61.5300000");

    @Override
    public int orden() {
        return 20;
    }

    @Override
    public String nombre() {
        return "plagas";
    }

    @Override
    @Transactional
    public int sembrar() {
        // Catalogo de plagas existente (por nombre comun), sembrado por migracion.
        Map<String, CatalogoPlaga> plagas = new HashMap<>();
        for (CatalogoPlaga c : catalogoRepo.search(null)) {
            plagas.putIfAbsent(c.getNombreComun(), c);
        }
        CatalogoPlaga oruga = plagas.get("Oruga cogollera");
        CatalogoPlaga roya = plagas.get("Roya asiatica");
        CatalogoPlaga yuyo = plagas.get("Yuyo colorado");
        if (oruga == null || roya == null || yuyo == null) {
            // Sin catalogo base no se puede sembrar coherente; se sale sin romper.
            return 0;
        }

        int creados = 0;

        // 6 detecciones coherentes con el cultivo de cada lote, mezclando estados/severidades.
        creados += crearDeteccion("demo-det-1", "demo-lote-1", roya, "cult-soja",
                SeveridadPlaga.ALTA, EstadoDeteccionPlaga.EN_TRATAMIENTO, 6,
                new BigDecimal("12.50"), new BigDecimal("22.00"),
                OrigenGeolocalizacion.WEB_MAPA, "demo-oper-1",
                "Focos de pustulas en tercio inferior; se inicia tratamiento.");

        creados += crearDeteccion("demo-det-2", "demo-lote-1", yuyo, "cult-soja",
                SeveridadPlaga.MEDIA, EstadoDeteccionPlaga.ABIERTA, 3,
                new BigDecimal("4.00"), new BigDecimal("8.50"),
                OrigenGeolocalizacion.MOBILE_GPS, "demo-oper-2",
                "Emergencia de maleza en cabeceras del lote.");

        creados += crearDeteccion("demo-det-3", "demo-lote-2", oruga, "cult-maiz",
                SeveridadPlaga.CRITICA, EstadoDeteccionPlaga.EN_TRATAMIENTO, 8,
                new BigDecimal("20.00"), new BigDecimal("35.00"),
                OrigenGeolocalizacion.MOBILE_GPS, "demo-oper-3",
                "Dano activo en cogollo, supera umbral de accion.");

        creados += crearDeteccion("demo-det-4", "demo-lote-2", yuyo, "cult-maiz",
                SeveridadPlaga.BAJA, EstadoDeteccionPlaga.CONTROLADA, 20,
                new BigDecimal("2.00"), new BigDecimal("3.00"),
                OrigenGeolocalizacion.MANUAL, "demo-oper-2",
                "Maleza controlada tras aplicacion previa.");

        creados += crearDeteccion("demo-det-5", "demo-lote-5", oruga, "cult-sorgo",
                SeveridadPlaga.MEDIA, EstadoDeteccionPlaga.ABIERTA, 2,
                new BigDecimal("6.50"), new BigDecimal("11.00"),
                OrigenGeolocalizacion.MOBILE_GPS, "demo-oper-4",
                "Monitoreo detecta primeras posturas y larvas.");

        creados += crearDeteccion("demo-det-6", "demo-lote-4", yuyo, "cult-girasol",
                SeveridadPlaga.ALTA, EstadoDeteccionPlaga.CONTROLADA, 25,
                new BigDecimal("9.00"), new BigDecimal("15.00"),
                OrigenGeolocalizacion.WEB_MAPA, "demo-oper-1",
                "Foco de maleza controlado, en seguimiento.");

        // Seguimientos: para 3 detecciones (una por estado representativo).
        creados += crearSeguimiento("demo-seg-1", "demo-det-1", 2,
                ResultadoSeguimientoPlaga.MEJORA, SeveridadPlaga.MEDIA, "demo-oper-1",
                "Reduccion de pustulas activas tras el tratamiento.");

        creados += crearSeguimiento("demo-seg-2", "demo-det-3", 3,
                ResultadoSeguimientoPlaga.SIN_CAMBIOS, SeveridadPlaga.CRITICA, "demo-oper-3",
                "Persiste dano en cogollo, se refuerza control.");

        creados += crearSeguimiento("demo-seg-3", "demo-det-6", 5,
                ResultadoSeguimientoPlaga.CONTROLADA, SeveridadPlaga.BAJA, "demo-oper-1",
                "Maleza sin rebrote; se cierra como controlada.");

        // Aplicaciones fitosanitarias: para 2 detecciones en tratamiento.
        creados += crearAplicacion("demo-apl-1", "demo-det-1", "demo-lote-1", 5,
                "Amistar Xtra", "Azoxistrobina + Ciproconazol",
                new BigDecimal("0.50"), "L/ha", new BigDecimal("120.00"),
                new BigDecimal("12.50"), 30, "demo-oper-1",
                "Aplicacion foliar de fungicida ante primeras pustulas.");

        creados += crearAplicacion("demo-apl-2", "demo-det-3", "demo-lote-2", 7,
                "Coragen", "Clorantraniliprole",
                new BigDecimal("0.10"), "L/ha", new BigDecimal("100.00"),
                new BigDecimal("20.00"), 14, "demo-oper-3",
                "Control de oruga cogollera sobre dano activo en cogollo.");

        return creados;
    }

    // Crea una deteccion si no existe. Devuelve 1 si la creo, 0 si ya existia o falta el lote.
    private int crearDeteccion(String id, String loteId, CatalogoPlaga plaga, String cultivo,
                               SeveridadPlaga severidad, EstadoDeteccionPlaga estado, int diasAtras,
                               BigDecimal areaHa, BigDecimal porcentaje, OrigenGeolocalizacion origen,
                               String operarioId, String descripcion) {
        if (deteccionRepo.existsById(id)) {
            return 0;
        }
        Lote lote = loteRepo.findById(loteId).orElse(null);
        if (lote == null) {
            return 0;
        }
        BigDecimal lat = lote.getLatitud() != null ? lote.getLatitud() : BASE_LAT;
        BigDecimal lon = lote.getLongitud() != null ? lote.getLongitud() : BASE_LON;

        DeteccionPlaga d = new DeteccionPlaga();
        d.setId(id);
        d.setLote(lote);
        d.setCatalogoPlaga(plaga);
        d.setFechaDeteccion(LocalDateTime.now().minusDays(diasAtras));
        d.setCultivo(cultivo);
        d.setSeveridad(severidad);
        d.setEstado(estado);
        d.setAreaAfectadaHa(areaHa);
        d.setPorcentajeAfectado(porcentaje);
        // Pequeno offset sobre el centro del lote para separar los pines.
        d.setLatitud(lat.add(new BigDecimal("0.0015")));
        d.setLongitud(lon.add(new BigDecimal("0.0015")));
        d.setPrecisionMetros(new BigDecimal("8.00"));
        d.setOrigenGeolocalizacion(origen);
        d.setDescripcion(descripcion);
        d.setResponsable(nombreOperario(operarioId));
        deteccionRepo.save(d);
        return 1;
    }

    private int crearSeguimiento(String id, String deteccionId, int diasAtras,
                                 ResultadoSeguimientoPlaga resultado, SeveridadPlaga severidad,
                                 String operarioId, String observaciones) {
        if (seguimientoRepo.existsById(id)) {
            return 0;
        }
        DeteccionPlaga det = deteccionRepo.findById(deteccionId).orElse(null);
        if (det == null) {
            return 0;
        }
        SeguimientoPlaga s = new SeguimientoPlaga();
        s.setId(id);
        s.setDeteccion(det);
        s.setFecha(LocalDateTime.now().minusDays(diasAtras));
        s.setResultado(resultado);
        s.setSeveridad(severidad);
        s.setObservaciones(observaciones);
        s.setResponsable(nombreOperario(operarioId));
        seguimientoRepo.save(s);
        return 1;
    }

    private int crearAplicacion(String id, String deteccionId, String loteId, int diasAtras,
                                String producto, String principioActivo, BigDecimal dosis,
                                String unidadDosis, BigDecimal volumenCaldo, BigDecimal superficieHa,
                                int carenciaDias, String operarioId, String observaciones) {
        if (aplicacionRepo.existsById(id)) {
            return 0;
        }
        DeteccionPlaga det = deteccionRepo.findById(deteccionId).orElse(null);
        Lote lote = loteRepo.findById(loteId).orElse(null);
        if (det == null || lote == null) {
            return 0;
        }
        LocalDateTime fecha = LocalDateTime.now().minusDays(diasAtras);
        AplicacionFitosanitaria a = new AplicacionFitosanitaria();
        a.setId(id);
        a.setDeteccion(det);
        a.setLote(lote);
        a.setFechaAplicacion(fecha);
        a.setProducto(producto);
        a.setPrincipioActivo(principioActivo);
        a.setDosis(dosis);
        a.setUnidadDosis(unidadDosis);
        a.setVolumenCaldoLHa(volumenCaldo);
        a.setSuperficieTratadaHa(superficieHa);
        a.setPeriodoCarenciaDias(carenciaDias);
        a.setPeriodoReingresoHoras(24);
        a.setFechaReingresoSeguro(fecha.plusHours(24));
        a.setFechaCosechaSegura(fecha.toLocalDate().plusDays(carenciaDias));
        a.setOperarioResponsable(nombreOperario(operarioId));
        a.setCondicionesClimaticas("Viento 8 km/h, 22 C, sin lluvia previstas 24 h.");
        a.setObservaciones(observaciones);
        aplicacionRepo.save(a);
        return 1;
    }

    // Devuelve "Nombre Apellido" del operario demo, o el id como fallback (campo es texto libre).
    private String nombreOperario(String operarioId) {
        Operario o = operarioRepo.findById(operarioId).orElse(null);
        if (o == null) {
            return operarioId;
        }
        return (o.getNombre() + " " + o.getApellido()).trim();
    }
}
