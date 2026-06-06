CREATE TABLE IF NOT EXISTS audit_logs (
    id          VARCHAR(36) NOT NULL DEFAULT (UUID()),
    user_id     VARCHAR(36) NULL,
    action      VARCHAR(100) NOT NULL,
    resource    VARCHAR(200) NOT NULL,
    resource_id VARCHAR(100) NULL,
    changes     JSON NULL,
    ip_address  VARCHAR(50) NULL,
    created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    INDEX idx_audit_logs_user_id_repair (user_id),
    INDEX idx_audit_logs_action_repair (action),
    INDEX idx_audit_logs_created_at_repair (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
