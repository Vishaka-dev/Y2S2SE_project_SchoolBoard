-- V5: Create groups and group_members tables for Group Creation feature

CREATE TABLE IF NOT EXISTS groups (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    description     TEXT,
    group_type      VARCHAR(30)     NOT NULL,
    subject         VARCHAR(100),
    academic_level  VARCHAR(50),
    image_url       VARCHAR(500),
    visibility      VARCHAR(20)     NOT NULL DEFAULT 'PUBLIC',
    created_by      BIGINT          NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_groups_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups (created_by);
CREATE INDEX IF NOT EXISTS idx_groups_group_type ON groups (group_type);

CREATE TABLE IF NOT EXISTS group_members (
    id         BIGSERIAL    PRIMARY KEY,
    group_id   BIGINT       NOT NULL,
    user_id    BIGINT       NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'MEMBER',
    joined_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_group_members_group
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_members_user
        FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT uq_group_members
        UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members (user_id);
