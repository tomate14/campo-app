-- Feature 75: especies similares desde GBIF (taxonomia + cache global + sugeridas por familia/genero).
-- Se agrega a catalogo_plagas la clasificacion taxonomica resuelta por GBIF (species/match) y se crea
-- gbif_especie como cache global de especies candidatas (hermanas por genero/familia) con su imagen CC
-- descargada al volumen de uploads. Las similares de una plaga se calculan matcheando por genus_key /
-- family_key contra este cache. Reutiliza la infra GBIF de la feature 73.

-- 1) Clasificacion taxonomica de cada plaga del catalogo (resuelta desde GBIF species/match).
ALTER TABLE catalogo_plagas
    ADD COLUMN gbif_usage_key BIGINT NULL,                      -- usageKey de la especie aceptada en GBIF
    ADD COLUMN gbif_genus_key BIGINT NULL,                      -- genusKey (para similares por genero)
    ADD COLUMN gbif_family_key BIGINT NULL,                     -- familyKey (para similares por familia)
    ADD COLUMN gbif_genero VARCHAR(120) NULL,                   -- nombre del genero (ej: Spodoptera)
    ADD COLUMN gbif_familia VARCHAR(120) NULL,                  -- nombre de la familia (ej: Noctuidae)
    ADD COLUMN nombre_cientifico_aceptado VARCHAR(200) NULL;    -- scientificName aceptado devuelto por GBIF

-- 2) Cache global de especies GBIF candidatas a similares (hermanas por genero/familia).
CREATE TABLE gbif_especie (
    id VARCHAR(36) NOT NULL,
    usage_key BIGINT NOT NULL,                        -- key de la especie en GBIF (dedupe global)
    nombre_cientifico VARCHAR(200) NOT NULL,          -- scientificName de la especie
    nombre_vulgar VARCHAR(200) NULL,                  -- vernacularName (preferido en espanol)
    genus_key BIGINT NULL,                            -- genusKey (nivel GENERO)
    family_key BIGINT NULL,                           -- familyKey (nivel FAMILIA)
    genero VARCHAR(120) NULL,                         -- nombre del genero
    familia VARCHAR(120) NULL,                        -- nombre de la familia
    taxon_rank VARCHAR(40) NULL,                      -- rango taxonomico (SPECIES, etc.); 'rank' es palabra reservada en MySQL 8
    path VARCHAR(400) NULL,                           -- path relativo de la imagen en uploads (plagas-similares/uuid.ext)
    url_original VARCHAR(600) NULL,                   -- URL original de la imagen (identifier de GBIF)
    licencia VARCHAR(200) NULL,                       -- URL de la licencia Creative Commons
    atribucion VARCHAR(300) NULL,                     -- rightsHolder informado por GBIF
    activo BIT NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_gbif_especie_usage_key UNIQUE (usage_key),
    INDEX idx_gbif_especie_genus_key (genus_key),
    INDEX idx_gbif_especie_family_key (family_key),
    INDEX idx_gbif_especie_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
