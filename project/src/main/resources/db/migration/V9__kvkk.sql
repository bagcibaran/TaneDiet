-- KVKK: danışanın hangi rıza metni sürümünü ne zaman onayladığı (her onay yeni satır, geçmiş korunur)
CREATE TABLE consent_record (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    user_id     BIGINT      NOT NULL,
    version     VARCHAR(20) NOT NULL,
    text_hash   CHAR(64)    NOT NULL,
    accepted_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_consent_record_user (user_id, accepted_at),
    CONSTRAINT fk_consent_record_user FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- KVKK: diyetisyen bir danışanın sağlık bilgilerini ne zaman görüntüledi / dışa aktardı (içerik tutulmaz)
CREATE TABLE access_log (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    viewer_id  BIGINT      NOT NULL,
    client_id  BIGINT      NOT NULL,
    action     VARCHAR(20) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_access_log_client (client_id, created_at),
    KEY idx_access_log_created (created_at),
    CONSTRAINT fk_access_log_viewer FOREIGN KEY (viewer_id) REFERENCES app_user (id),
    CONSTRAINT fk_access_log_client FOREIGN KEY (client_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- KVKK: silinen danışanın kanıtı. Kişisel veri yok: yalnızca numarası, kim sildi, neden, ne zaman.
-- client_id'nin yabancı anahtarı yok: kullanıcı silindikten sonra da kalır.
CREATE TABLE deletion_record (
    id            BIGINT      NOT NULL AUTO_INCREMENT,
    client_id     BIGINT      NOT NULL,
    deleted_by_id BIGINT      NULL,
    reason        VARCHAR(10) NOT NULL,
    deleted_at    DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_deletion_record_deleted_by FOREIGN KEY (deleted_by_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
