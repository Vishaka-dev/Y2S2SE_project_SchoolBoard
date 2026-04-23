package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.GroupConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupConversationRepository extends JpaRepository<GroupConversation, Long> {

    /**
     * Find group conversation by group ID
     */
    Optional<GroupConversation> findByGroup_Id(Long groupId);

    /**
     * Check if group conversation exists for a group
     */
    boolean existsByGroup_Id(Long groupId);

    /**
     * Find all group conversations for groups where user is a member
     */
    @Query("""
        SELECT gc FROM GroupConversation gc
        WHERE gc.group.id IN (
            SELECT gm.group.id FROM GroupMember gm
            WHERE gm.user.id = :userId
        )
        ORDER BY gc.updatedAt DESC
    """)
    Page<GroupConversation> findGroupConversationsForUser(@Param("userId") Long userId, Pageable pageable);

    /**
     * Find with eager loading of last message
     */
    @Query("""
        SELECT DISTINCT gc FROM GroupConversation gc
        LEFT JOIN FETCH gc.lastMessage
        WHERE gc.id = :id
    """)
    Optional<GroupConversation> findByIdWithLastMessage(@Param("id") Long id);
}
