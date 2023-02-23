CREATE TABLE IF NOT EXISTS team
(
    team_id   UUID PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS category
(
    category_id   UUID PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL
);

INSERT INTO category (category_id, category_name)
VALUES (gen_random_uuid(), 'Important'),
       (gen_random_uuid(), 'Personal'),
       (gen_random_uuid(), 'Work'),
       (gen_random_uuid(), 'Other');

CREATE TABLE IF NOT EXISTS app_user
(
    user_id    UUID PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name  VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    contact_no VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    team_id    UUID         NOT NULL,
    FOREIGN KEY (team_id) REFERENCES team (team_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS todo
(
    todo_id             UUID PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    notes               TEXT,
    created_dt          TIMESTAMP    NOT NULL,
    due_dt              TIMESTAMP,
    is_reminder_enabled BOOLEAN      NOT NULL,
    is_completed        BOOLEAN      NOT NULL,
    last_modified_dt    TIMESTAMP    NOT NULL,
    user_id             UUID         NOT NULL,
    category_id         UUID         NOT NULL,
    team_id             UUID         NOT NULL,
    FOREIGN KEY (user_id) REFERENCES app_user (user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category (category_id),
    FOREIGN KEY (team_id) REFERENCES team (team_id) ON DELETE CASCADE
);
