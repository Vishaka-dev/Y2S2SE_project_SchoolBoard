package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    /**
     * Find active user by username
     * Filters out soft-deleted accounts
     */
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.isActive = true")
    Optional<User> findActiveByUsername(@Param("username") String username);

    /**
     * Find active user by email
     * Filters out soft-deleted accounts
     */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isActive = true")
    Optional<User> findActiveByEmail(@Param("email") String email);

    /**
     * Find active user by ID
     * Filters out soft-deleted accounts
     */
    @Query("SELECT u FROM User u WHERE u.id = :id AND u.isActive = true")
    Optional<User> findActiveById(@Param("id") Long id);

    /**
     * Check if active user exists with username
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.username = :username AND u.isActive = true")
    boolean existsActiveByUsername(@Param("username") String username);

    /**
     * Check if active user exists with email
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email AND u.isActive = true")
    boolean existsActiveByEmail(@Param("email") String email);

    @Query(value = """
            SELECT u FROM User u
            WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))
            AND u.isActive = true
            ORDER BY u.username ASC
            """, countQuery = """
            SELECT COUNT(u) FROM User u
            WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))
            AND u.isActive = true
            """)
    Page<User> searchByUsername(@Param("query") String query, Pageable pageable);

    @Query(value = """
            SELECT u FROM User u
            WHERE u.isActive = true
            AND u.id <> :currentUserId
            AND NOT EXISTS (
                SELECT 1 FROM Follow f
                WHERE f.follower.id = :currentUserId
                AND f.following.id = u.id
            )
            ORDER BY u.createdAt DESC
            """, countQuery = """
            SELECT COUNT(u) FROM User u
            WHERE u.isActive = true
            AND u.id <> :currentUserId
            AND NOT EXISTS (
                SELECT 1 FROM Follow f
                WHERE f.follower.id = :currentUserId
                AND f.following.id = u.id
            )
            """)
    Page<User> findSuggestionCandidates(@Param("currentUserId") Long currentUserId, Pageable pageable);
}
