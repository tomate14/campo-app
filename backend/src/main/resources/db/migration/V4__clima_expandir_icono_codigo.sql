ALTER TABLE dato_clima
    MODIFY COLUMN icono_codigo VARCHAR(40) NULL;

ALTER TABLE pronosticos
    MODIFY COLUMN icono_codigo VARCHAR(40) NULL;
