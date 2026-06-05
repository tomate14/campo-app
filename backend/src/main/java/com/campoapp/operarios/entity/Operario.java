package com.campoapp.operarios.entity;

import com.campoapp.auth.entity.User;
import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "operarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Operario extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 50)
    private String legajo;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, length = 120)
    private String apellido;

    @Column(name = "documento_tipo", length = 20)
    private String documentoTipo;

    @Column(name = "documento_numero", nullable = false, length = 40)
    private String documentoNumero;

    @Column(length = 60)
    private String telefono;

    @Column(length = 255)
    private String direccion;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "rol_operativo", nullable = false, length = 80)
    private String rolOperativo;

    @Column(name = "permisos_operativos", length = 500)
    private String permisosOperativos;

    @Column(nullable = false, length = 40)
    private String estado;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    @Column(name = "salario_base", precision = 14, scale = 2)
    private BigDecimal salarioBase;

    @Column(name = "contacto_emergencia", length = 160)
    private String contactoEmergencia;

    @Column(name = "telefono_emergencia", length = 60)
    private String telefonoEmergencia;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
