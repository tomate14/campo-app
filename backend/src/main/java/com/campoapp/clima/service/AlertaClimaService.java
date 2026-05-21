package com.campoapp.clima.service;

import com.campoapp.agricultura.entity.Lote;
import com.campoapp.clima.dto.AlertaClimaResponse;
import com.campoapp.clima.entity.DatoClima;
import com.campoapp.clima.entity.Pronostico;

import java.util.List;

public interface AlertaClimaService {
    void generarAlertas(Lote lote, DatoClima dato, List<Pronostico> pronosticos);
    List<AlertaClimaResponse> listarActivas(String loteId);
    List<AlertaClimaResponse> listarTodas(String loteId);
    AlertaClimaResponse marcarLeida(String alertaId);
}
