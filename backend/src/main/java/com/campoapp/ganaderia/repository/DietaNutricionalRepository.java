package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.DietaNutricional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DietaNutricionalRepository extends JpaRepository<DietaNutricional, String> {
    List<DietaNutricional> findByDeletedAtIsNullOrderByUpdatedAtDesc();
    Optional<DietaNutricional> findByIdAndDeletedAtIsNull(String id);
}
