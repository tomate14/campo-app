CREATE TABLE ordenes_trabajo (
    id VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(40) NOT NULL,
    titulo VARCHAR(160) NOT NULL,
    descripcion TEXT,
    lote_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    zona VARCHAR(160),
    operario_id VARCHAR(36) NOT NULL,
    prioridad VARCHAR(30) NOT NULL DEFAULT 'MEDIA',
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    fecha_programada DATETIME(6),
    fecha_inicio DATETIME(6),
    fecha_fin_estimada DATETIME(6),
    fecha_fin_real DATETIME(6),
    duracion_estimada_min INT,
    duracion_real_min INT,
    resultado TEXT,
    motivo_rechazo TEXT,
    observaciones TEXT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT uk_ordenes_trabajo_codigo UNIQUE (codigo),
    CONSTRAINT fk_ordenes_trabajo_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
    CONSTRAINT fk_ordenes_trabajo_operario FOREIGN KEY (operario_id) REFERENCES operarios(id)
);

CREATE TABLE orden_trabajo_actividades (
    id VARCHAR(36) PRIMARY KEY,
    orden_id VARCHAR(36) NOT NULL,
    operario_id VARCHAR(36),
    tipo VARCHAR(60) NOT NULL,
    descripcion TEXT NOT NULL,
    inicio DATETIME(6),
    fin DATETIME(6),
    duracion_min INT,
    estado VARCHAR(30) NOT NULL DEFAULT 'REGISTRADA',
    evidencia_url VARCHAR(500),
    observaciones TEXT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT fk_orden_actividades_orden FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id),
    CONSTRAINT fk_orden_actividades_operario FOREIGN KEY (operario_id) REFERENCES operarios(id)
);

CREATE TABLE orden_trabajo_historial (
    id VARCHAR(36) PRIMARY KEY,
    orden_id VARCHAR(36) NOT NULL,
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    accion VARCHAR(80) NOT NULL,
    responsable VARCHAR(160),
    observaciones TEXT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    CONSTRAINT fk_orden_historial_orden FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id)
);

CREATE INDEX idx_ordenes_trabajo_estado ON ordenes_trabajo(estado);
CREATE INDEX idx_ordenes_trabajo_operario ON ordenes_trabajo(operario_id);
CREATE INDEX idx_ordenes_trabajo_lote ON ordenes_trabajo(lote_id);
CREATE INDEX idx_ordenes_trabajo_programada ON ordenes_trabajo(fecha_programada);
CREATE INDEX idx_orden_actividades_orden ON orden_trabajo_actividades(orden_id);
CREATE INDEX idx_orden_historial_orden ON orden_trabajo_historial(orden_id);
