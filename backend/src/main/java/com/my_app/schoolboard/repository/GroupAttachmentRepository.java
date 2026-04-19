package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.GroupAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupAttachmentRepository extends JpaRepository<GroupAttachment, Long> {

    /**
     * Find all attachments for a message
     */
    List<GroupAttachment> findByGroupMessage_Id(Long messageId);

    /**
     * Delete all attachments for a message
     */
    void deleteByGroupMessage_Id(Long messageId);
}
