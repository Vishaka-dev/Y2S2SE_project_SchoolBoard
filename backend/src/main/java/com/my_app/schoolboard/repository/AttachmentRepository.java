package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * AttachmentRepository
 * Data access layer for attachment operations
 */
@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    
    /**
     * Find all attachments for a specific message
     * @param messageId Message ID
     * @return List of attachments
     */
    List<Attachment> findByMessageId(Long messageId);
    
    /**
     * Find all attachments uploaded by a user
     * @param uploadedById User ID
     * @return List of attachments
     */
    List<Attachment> findByUploadedById(Long uploadedById);
    
    /**
     * Count attachments for a message
     * @param messageId Message ID
     * @return Attachment count
     */
    long countByMessageId(Long messageId);
    
    /**
     * Delete all attachments for a message (cascade handled by entity)
     * @param messageId Message ID
     */
    void deleteByMessageId(Long messageId);
    
    /**
     * Find total file size for a user (for quota checking)
     * @param uploadedById User ID
     * @return Total file size in bytes
     */
    @Query("SELECT COALESCE(SUM(a.fileSize), 0) FROM Attachment a WHERE a.uploadedBy.id = :userId")
    long getTotalFileSizeForUser(@Param("userId") Long uploadedById);
}
