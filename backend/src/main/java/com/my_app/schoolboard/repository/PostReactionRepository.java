package com.my_app.schoolboard.repository;

import com.my_app.schoolboard.model.PostReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostReactionRepository extends JpaRepository<PostReaction, Long> {

    Optional<PostReaction> findByPostIdAndUserId(Long postId, Long userId);

    List<PostReaction> findByPostId(Long postId);

    void deleteByPostIdAndUserId(Long postId, Long userId);

    List<PostReaction> findByPost_IdIn(List<Long> postIds);
}
