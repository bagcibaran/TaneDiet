-- Diyetisyenin bir danışana yazdığı diyet programı (en son yazılan aktif programdır)
CREATE TABLE diet_plan (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    client_id     BIGINT       NOT NULL,
    created_by_id BIGINT       NOT NULL,
    plan_type     ENUM('DAILY','WEEKLY') NOT NULL,
    title         VARCHAR(100) NOT NULL,
    start_date    DATE         NOT NULL,
    notes         TEXT         NULL,
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_diet_plan_client_created (client_id, created_at),
    CONSTRAINT fk_diet_plan_client     FOREIGN KEY (client_id)     REFERENCES app_user (id),
    CONSTRAINT fk_diet_plan_created_by FOREIGN KEY (created_by_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Programın öğünleri. day_index: 0 = her gün (günlük program), 1-7 = Pazartesi-Pazar (haftalık program)
CREATE TABLE diet_plan_meal (
    id        BIGINT      NOT NULL AUTO_INCREMENT,
    plan_id   BIGINT      NOT NULL,
    day_index INT         NOT NULL,
    position  INT         NOT NULL,
    name      VARCHAR(60) NOT NULL,
    meal_time VARCHAR(5)  NULL,
    items     TEXT        NOT NULL,
    PRIMARY KEY (id),
    KEY idx_diet_plan_meal_plan (plan_id, day_index, position),
    CONSTRAINT fk_diet_plan_meal_plan FOREIGN KEY (plan_id) REFERENCES diet_plan (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
