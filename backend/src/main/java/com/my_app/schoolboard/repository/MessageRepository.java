package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Get all messages in a conversation, paginated and ordered by most recent
     * first.
     */
    Page<Message> findByConversationIdOrderByCreatedAtDesc(
            Long conversationId,
            Pageable pageable);

    /**
     * Get all messages in a conversation (unpaginated, ordered oldest first for UI
     * display).
     */
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    /**
     * Get unread messages for a specific user in a conversation.
     * (Messages from the other user that haven't been read yet)
     */
    @Query("SELECT m FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.sender.id != :userId " +
            "AND m.isRead = false " +
            "ORDER BY m.createdAt ASC")
    List<Message> findUnreadMessagesForUser(
            @Param("conversationId") Long conversationId,
            @Param("userId") Long userId);

    /**
     * Count unread messages in a conversation for a specific user.
     */
    @Query("SELECT COUNT(m) FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.sender.id != :userId " +
            "AND m.isRead = false")
    Integer countUnreadMessagesForUser(
            @Param("conversationId") Long conversationId,
            @Param("userId") Long userId);

    /**
     * Get the most recent message in a conversation.
     */
    @Query("SELECT m FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "ORDER BY m.createdAt DESC " +
            "LIMIT 1")
    Optional<Message> findLastMessageInConversation(@Param("conversationId") Long conversationId);

    /**
     * Get the most recent message in a conversation excluding a specific message.
     */
    Optional<Message> findTopByConversationIdAndIdNotOrderByCreatedAtDesc(Long conversationId, Long id);

    /**
     * Get total message count in a conversation.
     */
    long countByConversationId(Long conversationId);

    /**
     * Mark all messages in a conversation as read for a specific user (the
     * recipient).
     * Updates is_read = true and read_at = CURRENT_TIMESTAMP for messages sent by
     * others.
     */
    @Modifying
    @Transactional
    @Query("UPDATE Message m " +
            "SET m.isRead = true, m.readAt = CURRENT_TIMESTAMP " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.sender.id != :userId " +
            "AND m.isRead = false")
    int markConversationMessagesAsRead(
            @Param("conversationId") Long conversationId,
            @Param("userId") Long userId);

    /**
     * Get all messages sent by a specific user.
     */
    List<Message> findBySenderId(Long senderId);

    /**
     * Search messages by content keyword in a conversation.
     */
    @Query("SELECT m FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND LOWER(m.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY m.createdAt DESC")
    Page<Message> searchMessagesInConversation(
            @Param("conversationId") Long conversationId,
            @Param("keyword") String keyword,
            Pageable pageable);

    /**
     * Get total unread message count for a user across all conversations where they
     * are the recipient.
     */
    @Query("SELECT COUNT(m) FROM Message m " +
            "WHERE m.sender.id != :userId " +
            "AND m.isRead = false " +
            "AND EXISTS (SELECT 1 FROM Conversation c " +
            "            WHERE (c.user1.id = :userId OR c.user2.id = :userId) " +
            "            AND c.id = m.conversation.id)")
    Integer countTotalUnreadMessages(@Param("userId") Long userId);
}
