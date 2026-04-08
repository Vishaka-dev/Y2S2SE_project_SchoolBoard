package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.CommentRequestDTO;
import com.my_app.schoolboard.dto.CommentResponseDTO;
import com.my_app.schoolboard.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class CommentController {

    private final CommentService commentService;

    /**
     * Create a new comment on a post
     * POST /api/posts/{postId}/comments
     */
    @PostMapping("/posts/{postId}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentResponseDTO> createComment(
            @PathVariable Long postId,
            @RequestBody CommentRequestDTO request,
            Authentication authentication) {

        log.info("Received request to add comment to post {} from user: {}", postId, authentication.getName());

        CommentResponseDTO response = commentService.createComment(postId, request, authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all comments for a specific post
     * GET /api/posts/{postId}/comments
     */
    @GetMapping("/posts/{postId}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CommentResponseDTO>> getPostComments(@PathVariable Long postId) {

        log.info("Fetching comments for post: {}", postId);

        List<CommentResponseDTO> comments = commentService.getCommentsByPost(postId);

        return ResponseEntity.ok(comments);
    }

    /**
     * Delete a comment
     * DELETE /api/comments/{commentId}
     */
    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            Authentication authentication) {

        log.info("Received request to delete comment {} from user: {}", commentId, authentication.getName());

        commentService.deleteComment(commentId, authentication.getName());

        return ResponseEntity.noContent().build();
    }
}
