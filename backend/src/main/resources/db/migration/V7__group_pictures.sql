-- Separate group image metadata from `groups` table; profile vs cover URLs.

CREATE TABLE IF NOT EXISTS group_pictures (
    id                    BIGSERIAL       PRIMARY KEY,
    group_id              BIGINT          NOT NULL,
    profile_picture_url   VARCHAR(500),
    cover_picture_url     VARCHAR(500),
    created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_group_pictures_group
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT uq_group_pictures_group_id
        UNIQUE (group_id)
);

CREATE INDEX IF NOT EXISTS idx_group_pictures_group_id ON group_pictures (group_id);

-- One row per existing group; migrate legacy `groups.image_url` into profile_picture_url.
INSERT INTO group_pictures (group_id, profile_picture_url, cover_picture_url, created_at, updated_at)
SELECT id, image_url, NULL, created_at, updated_at
FROM groups;

ALTER TABLE groups DROP COLUMN IF EXISTS image_url;
