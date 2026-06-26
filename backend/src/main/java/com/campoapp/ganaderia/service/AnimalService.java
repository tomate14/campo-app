package com.campoapp.ganaderia.service;

import com.campoapp.ganaderia.dto.*;

import java.util.List;

public interface AnimalService {
    List<AnimalResponse> listAnimales(String caravana, String raza, String ubicacion, String estado);
    List<CatalogoRazaBovinaResponse> listRazasBovinas(String search);
    AnimalDetalleResponse getAnimal(String id);
    AnimalResponse createAnimal(AnimalRequest request);
    AnimalResponse updateAnimal(String id, AnimalRequest request);
    void deleteAnimal(String id);
    MovimientoAnimalResponse registrarMovimiento(MovimientoAnimalRequest request);
    HistorialMedicoAnimalResponse registrarHistorialMedico(HistorialMedicoAnimalRequest request);
    List<MovimientoAnimalResponse> getMovimientos(String animalId);
    List<HistorialMedicoAnimalResponse> getHistorialMedico(String animalId);
    String exportarSenasaCsv(String estado);
}
