package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.GroupMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {

    /**
     * Fetch messages for a group conversation (paginated, newest first)
     */
    @Query("""
        SELECT gm FROM GroupMessage gm
        WHERE gm.groupConversation.id = :conversationId
        ORDER BY gm.createdAt DESC
    """)
    Page<GroupMessage> findByGroupConversation_Id(@Param("conversationId") Long conversationId, Pageable pageable);

    /**
     * Find message with eager loaded sender and attachments
     */
    @Query("""
        SELECT DISTINCT gm FROM GroupMessage gm
        LEFT JOIN FETCH gm.sender
        LEFT JOIN FETCH gm.attachments
        WHERE gm.id = :id
    """)
    Optional<GroupMessage> findByIdWithDetails(@Param("id") Long id);

    /**
     * Count unread messages in a group conversation for a user
     */
    @Query("""
        SELECT COUNT(gm) FROM GroupMessage gm
        WHERE gm.groupConversation.id = :conversationId
        AND gm.isRead = false
        AND gm.sender.id != :userId
    """)
    long countUnreadMessages(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    /**
     * Find last message in a group conversation
     */
    @Query("""
        SELECT gm FROM GroupMessage gm
        WHERE gm.groupConversation.id = :conversationId
        ORDER BY gm.createdAt DESC
        LIMIT 1
    """)
    Optional<GroupMessage> findLastMessage(@Param("conversationId") Long conversationId);
}
