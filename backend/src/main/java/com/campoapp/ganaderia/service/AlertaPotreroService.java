package com.campoapp.ganaderia.service;

import com.campoapp.ganaderia.dto.AlertaPotreroRequest;
import com.campoapp.ganaderia.dto.AlertaPotreroResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AlertaPotreroService {

    /** Crea una alerta; el usuarioId se toma del SecurityContext, no del request. */
    AlertaPotreroResponse crear(AlertaPotreroRequest request);

    /** Feature 79: crea una alerta con foto opcional persistida via FileStorageService. */
    AlertaPotreroResponse crearConFoto(AlertaPotreroRequest request, MultipartFile foto);

    /** Lista alertas con filtros opcionales por potrero y estado (ABIERTA/RESUELTA). */
    List<AlertaPotreroResponse> listar(String potreroId, String estado);

    /** Marca la alerta como RESUELTA para sacar el pin del mapa sin borrar historial. */
    AlertaPotreroResponse resolver(String id);
}
