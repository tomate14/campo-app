package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.DietaIngrediente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DietaIngredienteRepository extends JpaRepository<DietaIngrediente, String> {
    List<DietaIngrediente> findByDietaIdAndDeletedAtIsNullOrderByIngredienteAsc(String dietaId);
}
