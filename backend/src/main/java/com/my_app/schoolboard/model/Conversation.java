package com.my_app.schoolboard.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversations", indexes = {
    @Index(name = "idx_conversation_user1", columnList = "user1_id"),
    @Index(name = "idx_conversation_user2", columnList = "user2_id"),
    @Index(name = "idx_conversation_updated_at", columnList = "updated_at DESC")
}, uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user1_id", "user2_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_message_id")
    private Message lastMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Ensure user1 ID is always less than user2 ID for consistency
     */
    @PrePersist
    public void ensureUserOrder() {
        if (user1 != null && user2 != null && user1.getId() > user2.getId()) {
            User temp = user1;
            user1 = user2;
            user2 = temp;
        }
    }

    /**
     * Get the other user in the conversation
     */
    public User getOtherUser(Long currentUserId) {
        if (user1.getId().equals(currentUserId)) {
            return user2;
        } else if (user2.getId().equals(currentUserId)) {
            return user1;
        }
        return null;
    }

    /**
     * Check if a user is part of this conversation
     */
    public boolean containsUser(Long userId) {
        return user1.getId().equals(userId) || user2.getId().equals(userId);
    }
}
