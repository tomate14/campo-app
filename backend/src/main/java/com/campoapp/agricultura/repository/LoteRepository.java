package com.campoapp.agricultura.repository;

import com.campoapp.agricultura.entity.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LoteRepository extends JpaRepository<Lote, String> {

    @Query("SELECT l FROM Lote l WHERE l.deletedAt IS NULL ORDER BY l.createdAt DESC")
    List<Lote> findAllActive();

    @Query("SELECT l FROM Lote l WHERE l.id = :id AND l.deletedAt IS NULL")
    Optional<Lote> findActiveById(@Param("id") String id);

    @Query("SELECT l FROM Lote l WHERE l.temporada = :temporada AND l.deletedAt IS NULL")
    List<Lote> findByTemporada(@Param("temporada") String temporada);

    @Query("SELECT l FROM Lote l WHERE l.cultivo = :cultivo AND l.deletedAt IS NULL")
    List<Lote> findByCultivo(@Param("cultivo") String cultivo);
}
