package com.campoapp.agricultura.service;

import com.campoapp.agricultura.dto.EventoSiembraRequest;
import com.campoapp.agricultura.dto.EventoSiembraResponse;
import com.campoapp.agricultura.entity.EventoSiembra.TipoEvento;

import java.time.LocalDate;
import java.util.List;

public interface SiembraService {
    List<EventoSiembraResponse> listarPorLote(String loteId);
    List<EventoSiembraResponse> listarPorLoteYTipo(String loteId, TipoEvento tipo);
    List<EventoSiembraResponse> listarPorRangoDeFechas(LocalDate desde, LocalDate hasta);
    EventoSiembraResponse buscarPorId(String id);
    EventoSiembraResponse registrar(EventoSiembraRequest request);
    EventoSiembraResponse actualizar(String id, EventoSiembraRequest request);
    void eliminar(String id);
}
