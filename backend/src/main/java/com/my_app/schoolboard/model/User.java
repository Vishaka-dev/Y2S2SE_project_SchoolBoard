package com.my_app.schoolboard.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @JsonIgnore
    @Column
    private String password; // Nullable for OAuth2 users

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider")
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "provider_id")
    private String providerId; // Google/OAuth2 provider ID

    @Column(name = "image_url")
    private String imageUrl; // Profile picture from OAuth2 provider

    @Column(name = "profile_image_url")
    private String profileImageUrl; // Uploaded profile picture (overrides OAuth2 image)

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /**
     * Set default provider value before persisting
     */
    @PrePersist
    public void prePersist() {
        if (this.provider == null) {
            this.provider = AuthProvider.LOCAL;
        }
        if (this.role == null) {
            this.role = Role.STUDENT; // Default role for OAuth2 users
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
    }

    /**
     * Soft delete the user account
     */
    public void softDelete() {
        this.isActive = false;
        this.deletedAt = LocalDateTime.now();
    }

    /**
     * Check if account is deleted
     */
    public boolean isDeleted() {
        return !this.isActive || this.deletedAt != null;
    }
}
