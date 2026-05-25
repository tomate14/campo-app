package com.campoapp.ganaderia.dto;

import java.util.List;

public record GenealogiaAnimalResponse(
        NodoGenealogia animal,
        List<NodoGenealogia> ancestros,
        List<NodoGenealogia> descendencia
) {
    public record NodoGenealogia(
            String id,
            String caravana,
            String raza,
            String sexo,
            String relacion,
            Integer generacion,
            List<NodoGenealogia> hijos
    ) {}
}
