package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findAllByPostIdOrderByCreatedAtDesc(Long postId);
    long countByPostId(Long postId);
}
