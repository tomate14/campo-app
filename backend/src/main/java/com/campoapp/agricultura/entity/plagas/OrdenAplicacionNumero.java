package com.campoapp.agricultura.entity.plagas;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// Numeracion correlativa de las ordenes de aplicacion (feature 58), en tabla separada.
// El numero es un AUTO_INCREMENT que arranca en 1: al crear una orden se inserta una fila
// y el motor asigna el siguiente correlativo. Se relaciona 1:1 con la orden por su id.
@Entity
@Table(name = "orden_aplicacion_numero")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrdenAplicacionNumero {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long numero;

    @Column(name = "orden_aplicacion_id", nullable = false, length = 36, unique = true)
    private String ordenAplicacionId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
