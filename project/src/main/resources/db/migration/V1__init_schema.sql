CREATE TABLE app_user (
                          id       BIGINT       NOT NULL AUTO_INCREMENT,
                          username VARCHAR(255) DEFAULT NULL,
                          email    VARCHAR(255) DEFAULT NULL,
                          password VARCHAR(255) DEFAULT NULL,
                          role     ENUM('CLIENT','DIETITIAN') DEFAULT NULL,
                          PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE task (
                      id           BIGINT       NOT NULL AUTO_INCREMENT,
                      is_completed BIT(1)       NOT NULL,
                      title        VARCHAR(255) DEFAULT NULL,
                      created_at   DATETIME(6)  DEFAULT NULL,
                      user_id      BIGINT       DEFAULT NULL,
                      PRIMARY KEY (id),
                      KEY FKsh6s1t7gbjr0ja7923du08fi8 (user_id),
                      CONSTRAINT FKsh6s1t7gbjr0ja7923du08fi8 FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;