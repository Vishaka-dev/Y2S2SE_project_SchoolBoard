package com.my_app.schoolboard.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.my_app.schoolboard.model.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByGroupIsNullOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);

    List<Post> findAllByGroupIdOrderByCreatedAtDesc(Long groupId, org.springframework.data.domain.Pageable pageable);

    List<Post> findAllByAuthorUsernameOrderByCreatedAtDesc(String username);
    
    @Query("SELECT p FROM Post p WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) AND p.group IS NULL ORDER BY p.createdAt DESC")
    List<Post> searchByContentKeyword(@Param("keyword") String keyword);
}
