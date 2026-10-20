ALTER TABLE app_user
    ADD CONSTRAINT uk_app_user_email UNIQUE (email),
    ADD CONSTRAINT uk_app_user_username UNIQUE (username),
    MODIFY role ENUM('CLIENT','DIETITIAN') NOT NULL DEFAULT 'CLIENT';
