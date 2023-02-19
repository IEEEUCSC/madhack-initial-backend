IF (NOT EXISTS(SELECT *
               FROM INFORMATION_SCHEMA.TABLES
               WHERE TABLE_NAME = 'team'))
    BEGIN
        CREATE TABLE team
        (
            team_id   UNIQUEIDENTIFIER PRIMARY KEY,
            team_name VARCHAR(255) NOT NULL UNIQUE,
        );
    END;

IF (NOT EXISTS(SELECT *
               FROM INFORMATION_SCHEMA.TABLES
               WHERE TABLE_NAME = 'category'))
    BEGIN
        CREATE TABLE category
        (
            category_id   UNIQUEIDENTIFIER PRIMARY KEY,
            category_name VARCHAR(255) NOT NULL,
        );

        INSERT INTO category (category_id, category_name)
        VALUES (NEWID(), 'Important'),
               (NEWID(), 'Personal'),
               (NEWID(), 'Work'),
               (NEWID(), 'Other');
    END;

IF (NOT EXISTS(SELECT *
               FROM INFORMATION_SCHEMA.TABLES
               WHERE TABLE_NAME = 'app_user'))
    BEGIN
        CREATE TABLE app_user
        (
            user_id    UNIQUEIDENTIFIER PRIMARY KEY,
            first_name VARCHAR(255)     NOT NULL,
            last_name  VARCHAR(255)     NOT NULL,
            email      VARCHAR(255)     NOT NULL,
            password   VARCHAR(255)     NOT NULL,
            contact_no VARCHAR(255)     NOT NULL,
            team_id    UNIQUEIDENTIFIER NOT NULL,
            FOREIGN KEY (team_id) REFERENCES team (team_id)
        );
    END;

IF (NOT EXISTS(SELECT *
               FROM INFORMATION_SCHEMA.TABLES
               WHERE TABLE_NAME = 'todo'))
    BEGIN
        CREATE TABLE todo
        (
            todo_id          UNIQUEIDENTIFIER PRIMARY KEY,
            title            VARCHAR(255)     NOT NULL,
            notes            TEXT             NOT NULL,
            created_dt       DATETIME         NOT NULL,
            due_dt           DATETIME         NOT NULL,
            is_complete      BIT              NOT NULL,
            last_modified_dt DATETIME         NOT NULL,
            user_id          UNIQUEIDENTIFIER NOT NULL,
            category_id      UNIQUEIDENTIFIER NOT NULL,
            team_id          UNIQUEIDENTIFIER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES app_user (user_id),
            FOREIGN KEY (category_id) REFERENCES category (category_id),
            FOREIGN KEY (team_id) REFERENCES team (team_id)
        );
    END;