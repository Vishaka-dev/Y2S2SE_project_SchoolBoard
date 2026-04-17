package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Find a conversation between two specific users.
     * Uses normalized user IDs (min < max) for consistency.
     */
    @Query("SELECT c FROM Conversation c " +
           "WHERE (c.user1.id = :userId1 AND c.user2.id = :userId2) " +
           "OR (c.user1.id = :userId2 AND c.user2.id = :userId1)")
    Optional<Conversation> findConversationBetweenUsers(
        @Param("userId1") Long userId1,
        @Param("userId2") Long userId2
    );

    /**
     * Get all conversations for a user, ordered by most recent first.
     * Works for both user1 and user2 positions.
     */
    @Query("SELECT c FROM Conversation c " +
           "WHERE c.user1.id = :userId OR c.user2.id = :userId " +
           "ORDER BY c.updatedAt DESC")
    Page<Conversation> findUserConversations(
        @Param("userId") Long userId,
        Pageable pageable
    );

    /**
     * Get conversations with eager loading of last message to prevent N+1 issues.
     */
    @Query("SELECT DISTINCT c FROM Conversation c " +
           "LEFT JOIN FETCH c.lastMessage " +
           "WHERE c.user1.id = :userId OR c.user2.id = :userId " +
           "ORDER BY c.updatedAt DESC")
    Page<Conversation> findUserConversationsWithLastMessage(
        @Param("userId") Long userId,
        Pageable pageable
    );

    /**
     * Get conversations matching a search keyword in the other user's details.
     * Searches by username or email of the other participant.
     */
    @Query("SELECT c FROM Conversation c " +
           "WHERE (c.user1.id = :userId AND (LOWER(c.user2.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "                                   OR LOWER(c.user2.email) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
           "OR (c.user2.id = :userId AND (LOWER(c.user1.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "                               OR LOWER(c.user1.email) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
           "ORDER BY c.updatedAt DESC")
    Page<Conversation> searchUserConversations(
        @Param("userId") Long userId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    /**
     * Count total conversations for a user.
     */
    @Query("SELECT COUNT(c) FROM Conversation c " +
           "WHERE c.user1.id = :userId OR c.user2.id = :userId")
    long countUserConversations(@Param("userId") Long userId);
}
