package com.campoapp.ganaderia.repository;

import com.campoapp.ganaderia.entity.Animal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GenealogiaRepository extends JpaRepository<Animal, String> {
}
