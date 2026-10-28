CREATE TABLE intake_form (
                             id                      BIGINT       NOT NULL AUTO_INCREMENT,
                             user_id                 BIGINT       NOT NULL,

    -- 1. Kişisel bilgiler
                             full_name               VARCHAR(100) NOT NULL,
                             birth_date              DATE         NOT NULL,
                             gender                  ENUM('FEMALE','MALE') NOT NULL,
                             height_cm               INT          NOT NULL,
                             weight_kg               DECIMAL(5,2) NOT NULL,
                             occupation              VARCHAR(100) NOT NULL,

    -- 2. Sağlık geçmişi
                             chronic_diseases        TEXT         NULL,
                             surgeries               TEXT         NULL,
                             medications             TEXT         NULL,
                             allergies               TEXT         NULL,

    -- 3. Beslenme alışkanlıkları
                             main_meals              ENUM('TWO','THREE','FOUR_PLUS') NOT NULL,
                             eats_breakfast          BIT(1)       NOT NULL,
                             water_intake            ENUM('HALF_LITER','ONE_LITER','ONE_AND_HALF_LITER','TWO_LITERS_PLUS') NOT NULL,
                             tea_coffee              ENUM('NONE','TWO_CUPS','THREE_CUPS_PLUS') NOT NULL,
                             drinks_soda             BIT(1)       NOT NULL,
                             disliked_foods          TEXT         NULL,
                             snacks                  TEXT         NULL,
                             eating_out              TEXT         NULL,

    -- 4. Hedef ve beklentiler
                             goal                    ENUM('LOSE_WEIGHT','GAIN_WEIGHT','MAINTAIN_WEIGHT','HEALTHY_HABITS','OTHER') NOT NULL,
                             goal_other              VARCHAR(255) NULL,
                             previous_diets          TEXT         NULL,
                             special_diet            TEXT         NULL,
                             program_style           ENUM('STRICT','FLEXIBLE','CONSCIOUS_CHOICES') NOT NULL,

    -- 5. Yaşam tarzı
                             sleep_hours             ENUM('UNDER_4','FROM_4_TO_6','FROM_6_TO_8','OVER_8') NOT NULL,
                             energy_level            ENUM('ENERGETIC','MODERATELY_TIRED','ALWAYS_TIRED') NOT NULL,
                             smokes                  BIT(1)       NOT NULL,
                             drinks_alcohol          BIT(1)       NOT NULL,
                             alcohol_frequency       VARCHAR(255) NULL,

    -- 6. Spor ve hareketlilik
                             exercise_days           ENUM('NONE','ONE_TO_TWO','THREE_TO_FOUR','FIVE_PLUS') NOT NULL,
                             sport_cardio            BIT(1)       NOT NULL,
                             sport_weights           BIT(1)       NOT NULL,
                             sport_pilates_yoga      BIT(1)       NOT NULL,
                             sport_other             VARCHAR(255) NULL,
                             tracks_steps            BIT(1)       NOT NULL,
                             average_steps           INT          NULL,

    -- 7. Mide ve bağırsak sağlığı
                             digestive_problems      TEXT         NULL,
                             lactose_gluten_symptoms TEXT         NULL,

    -- Sunucunun doldurduğu alanlar
                             consent_given_at        DATETIME(6)  NOT NULL,
                             created_at              DATETIME(6)  NOT NULL,
                             updated_at              DATETIME(6)  NOT NULL,

                             PRIMARY KEY (id),
                             UNIQUE KEY uk_intake_form_user (user_id),
                             CONSTRAINT fk_intake_form_user FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;