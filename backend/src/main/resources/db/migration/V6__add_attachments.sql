-- Add Message Attachments Support (V6__add_attachments.sql)
-- Enables file upload capability for messages

CREATE TABLE attachments (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    file_path VARCHAR(500) NOT NULL,
    download_url VARCHAR(500),
    uploaded_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_attachments_message FOREIGN KEY (message_id) 
        REFERENCES messages(id) ON DELETE CASCADE,
    CONSTRAINT fk_attachments_user FOREIGN KEY (uploaded_by) 
        REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    CONSTRAINT check_file_size CHECK (file_size > 0 AND file_size <= 5242880) -- Max 5MB
);

-- Index for quick message lookups
CREATE INDEX idx_attachments_message_id ON attachments(message_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX idx_attachments_created_at ON attachments(created_at DESC);

-- Comment for documentation
COMMENT ON TABLE attachments IS 'Stores metadata for file attachments in messages';
COMMENT ON COLUMN attachments.file_size IS 'File size in bytes, max 5MB (5242880 bytes)';
COMMENT ON COLUMN attachments.download_url IS 'Public-accessible URL for file download';
COMMENT ON COLUMN attachments.file_path IS 'Server-side path to stored file';
