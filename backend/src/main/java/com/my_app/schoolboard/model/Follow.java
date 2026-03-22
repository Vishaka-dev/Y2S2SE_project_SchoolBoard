package com.my_app.schoolboard.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "follows")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Follow {

    @EmbeddedId
    private FollowId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("followerId")
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("followingId")
    private User following;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (id == null && follower != null && following != null) {
            id = new FollowId(follower.getId(), following.getId());
        }
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowId implements Serializable {
        private Long followerId;
        private Long followingId;

        @Override
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (!(o instanceof FollowId followId)) {
                return false;
            }
            return Objects.equals(followerId, followId.followerId)
                    && Objects.equals(followingId, followId.followingId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(followerId, followingId);
        }
    }
}
