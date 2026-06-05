CREATE TABLE operarios (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    legajo VARCHAR(50) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    apellido VARCHAR(120) NOT NULL,
    documento_tipo VARCHAR(20) DEFAULT 'DNI',
    documento_numero VARCHAR(40) NOT NULL,
    telefono VARCHAR(60),
    direccion VARCHAR(255),
    fecha_nacimiento DATE,
    rol_operativo VARCHAR(80) NOT NULL,
    permisos_operativos VARCHAR(500),
    estado VARCHAR(40) NOT NULL DEFAULT 'ACTIVO',
    fecha_ingreso DATE,
    salario_base DECIMAL(14,2),
    contacto_emergencia VARCHAR(160),
    telefono_emergencia VARCHAR(60),
    observaciones TEXT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT uk_operarios_legajo UNIQUE (legajo),
    CONSTRAINT uk_operarios_documento UNIQUE (documento_numero),
    CONSTRAINT fk_operarios_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE operario_documentos (
    id VARCHAR(36) PRIMARY KEY,
    operario_id VARCHAR(36) NOT NULL,
    tipo_documento VARCHAR(80) NOT NULL,
    numero VARCHAR(80),
    fecha_emision DATE,
    fecha_vencimiento DATE,
    estado VARCHAR(40) NOT NULL DEFAULT 'VIGENTE',
    url VARCHAR(500),
    observaciones TEXT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT fk_operario_documentos_operario FOREIGN KEY (operario_id) REFERENCES operarios(id)
);

CREATE TABLE operario_historial_roles (
    id VARCHAR(36) PRIMARY KEY,
    operario_id VARCHAR(36) NOT NULL,
    rol_anterior VARCHAR(80),
    rol_nuevo VARCHAR(80) NOT NULL,
    fecha DATE NOT NULL,
    responsable VARCHAR(160),
    motivo TEXT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT fk_operario_historial_roles_operario FOREIGN KEY (operario_id) REFERENCES operarios(id)
);

CREATE INDEX idx_operarios_estado ON operarios(estado);
CREATE INDEX idx_operarios_rol ON operarios(rol_operativo);
CREATE INDEX idx_operario_documentos_vencimiento ON operario_documentos(fecha_vencimiento);
