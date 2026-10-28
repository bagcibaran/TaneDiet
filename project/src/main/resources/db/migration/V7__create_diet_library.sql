-- Diyetisyenin kendi hazır öğünleri (tek dokunuşla programa eklenen tam öğünler)
CREATE TABLE meal_template (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    owner_id   BIGINT      NOT NULL,
    name       VARCHAR(60) NOT NULL,
    meal_time  VARCHAR(5)  NULL,
    items      TEXT        NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_meal_template_owner (owner_id),
    CONSTRAINT fk_meal_template_owner FOREIGN KEY (owner_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Hızlı madde kategorileri (Kahvaltılık, Protein, ...)
CREATE TABLE quick_pick_category (
    id       BIGINT      NOT NULL AUTO_INCREMENT,
    owner_id BIGINT      NOT NULL,
    name     VARCHAR(50) NOT NULL,
    position INT         NOT NULL,
    PRIMARY KEY (id),
    KEY idx_quick_pick_category_owner (owner_id, position),
    CONSTRAINT fk_quick_pick_category_owner FOREIGN KEY (owner_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Kategorideki maddeler; kategori silinince maddeleri de silinir
CREATE TABLE quick_pick_item (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    category_id BIGINT       NOT NULL,
    text        VARCHAR(255) NOT NULL,
    position    INT          NOT NULL,
    PRIMARY KEY (id),
    KEY idx_quick_pick_item_category (category_id, position),
    CONSTRAINT fk_quick_pick_item_category FOREIGN KEY (category_id) REFERENCES quick_pick_category (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Örnek öğün ve maddeler bu diyetisyene bir kez yüklendi mi? (silinen örnekler geri gelmesin)
CREATE TABLE diet_library_seed (
    owner_id  BIGINT      NOT NULL,
    seeded_at DATETIME(6) NOT NULL,
    PRIMARY KEY (owner_id),
    CONSTRAINT fk_diet_library_seed_owner FOREIGN KEY (owner_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
