CREATE TABLE weight_entry (
                              id            BIGINT       NOT NULL AUTO_INCREMENT,
                              user_id       BIGINT       NOT NULL,
                              weight_kg     DECIMAL(5,2) NOT NULL,
                              measured_on   DATE         NOT NULL,
                              entered_by_id BIGINT       NOT NULL,
                              created_at    DATETIME(6)  NOT NULL,
                              PRIMARY KEY (id),
                              KEY idx_weight_entry_user_measured (user_id, measured_on),
                              CONSTRAINT fk_weight_entry_user       FOREIGN KEY (user_id)       REFERENCES app_user (id),
                              CONSTRAINT fk_weight_entry_entered_by FOREIGN KEY (entered_by_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;