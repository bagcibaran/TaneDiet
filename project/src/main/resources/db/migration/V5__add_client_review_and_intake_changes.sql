-- Diyetisyenin bir danışanın sayfasına en son ne zaman baktığı (bildirimler için)
CREATE TABLE client_review (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    client_id   BIGINT      NOT NULL,
    reviewed_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_client_review_client (client_id),
    CONSTRAINT fk_client_review_client FOREIGN KEY (client_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Danışanın, diyetisyen son baktığından beri değiştirdiği form soruları (virgülle ayrılmış alan adları)
ALTER TABLE intake_form
    ADD COLUMN changed_fields TEXT NULL;
