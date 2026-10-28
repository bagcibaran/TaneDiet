-- Danışanın hizmet süresinin son günü (dahil). NULL = süresiz (bu değişiklikten önceki danışanlar)
ALTER TABLE app_user ADD COLUMN access_until DATE NULL;

-- Diyetisyenin ödeme yapan kişiye gönderdiği davet linki: tek kullanımlık, 7 gün geçerli, paket süresi taşır
CREATE TABLE invite (
    id            BIGINT      NOT NULL AUTO_INCREMENT,
    token         VARCHAR(64) NOT NULL,
    note          VARCHAR(60) NULL,
    months        INT         NOT NULL,
    created_by_id BIGINT      NOT NULL,
    created_at    DATETIME(6) NOT NULL,
    expires_at    DATETIME(6) NOT NULL,
    used_at       DATETIME(6) NULL,
    used_by_id    BIGINT      NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_invite_token (token),
    CONSTRAINT fk_invite_created_by FOREIGN KEY (created_by_id) REFERENCES app_user (id),
    CONSTRAINT fk_invite_used_by    FOREIGN KEY (used_by_id)    REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
