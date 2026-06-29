package com.campoapp.finanzas.entity;

import com.campoapp.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "finanzas_clientes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClienteFinanciero extends AuditableEntity {
    @Column(nullable = false, length = 180)
    private String razonSocial;

    @Column(nullable = false, unique = true, length = 20)
    private String cuit;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 40)
    private TipoClienteFiscal condicionFiscal;

    @Column(length = 180)
    private String email;

    @Column(length = 60)
    private String telefono;

    @Column(length = 220)
    private String direccion;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
