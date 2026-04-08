package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.CommentRequestDTO;
import com.my_app.schoolboard.dto.CommentResponseDTO;
import com.my_app.schoolboard.model.Comment;
import com.my_app.schoolboard.model.Post;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.*;
import com.my_app.schoolboard.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final InstituteProfileRepository instituteProfileRepository;

    @Override
    @Transactional
    public CommentResponseDTO createComment(Long postId, CommentRequestDTO request, String username) {
        log.info("User {} adding comment to post {}", username, postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .post(post)
                .user(user)
                .build();

        Comment savedComment = commentRepository.save(comment);
        return mapToDTO(savedComment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponseDTO> getCommentsByPost(Long postId) {
        log.info("Fetching comments for post {}", postId);
        return commentRepository.findAllByPostIdOrderByCreatedAtDesc(postId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, String username) {
        log.info("User {} deleting comment {}", username, commentId);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Security check: Only author or admin
        if (!comment.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    private CommentResponseDTO mapToDTO(Comment comment) {
        User author = comment.getUser();

        // Load profile to get fullName
        String fullName = author.getUsername();
        Object profileNameResult = switch (author.getRole()) {
            case SCHOOL_STUDENT, UNIVERSITY_STUDENT, STUDENT ->
                studentProfileRepository.findByUser(author).map(p -> p.getFullName()).orElse(null);
            case TEACHER -> teacherProfileRepository.findByUser(author).map(p -> p.getFullName()).orElse(null);
            case INSTITUTE ->
                instituteProfileRepository.findByUser(author).map(p -> p.getInstitutionName()).orElse(null);
            default -> null;
        };
        if (profileNameResult != null) {
            fullName = (String) profileNameResult;
        }

        return CommentResponseDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .authorId(author.getId())
                .authorUsername(author.getUsername())
                .authorName(fullName)
                .authorImageUrl(author.getProfileImageUrl() != null ? author.getProfileImageUrl() : author.getImageUrl())
                .build();
    }
}
