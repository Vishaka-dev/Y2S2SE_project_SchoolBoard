package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.PostResponseDTO;
import com.my_app.schoolboard.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class PostController {

    private final PostService postService;

    /**
     * Create a new post
     * POST /api/posts
     * Consumes multipart/form-data
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostResponseDTO> createPost(
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication) {

        log.info("Received request to create post from user: {}", authentication.getName());

        PostResponseDTO response = postService.createPost(content, image, authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all posts for the feed
     * GET /api/posts
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PostResponseDTO>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Fetching all posts for feed - page: {}, size: {}", page, size);

        List<PostResponseDTO> posts = postService.getAllPosts(page, size);

        return ResponseEntity.ok(posts);
    }

    /**
     * Update an existing post
     * PATCH /api/posts/{id}
     */
    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostResponseDTO> updatePost(
            @PathVariable Long id,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication) {

        log.info("Received request to update post {} from user: {}", id, authentication.getName());

        PostResponseDTO response = postService.updatePost(id, content, image, authentication.getName());

        return ResponseEntity.ok(response);
    }

    /**
     * Delete a post
     * DELETE /api/posts/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            Authentication authentication) {

        log.info("Received request to delete post {} from user: {}", id, authentication.getName());

        postService.deletePost(id, authentication.getName());

        return ResponseEntity.noContent().build();
    }

    /**
     * Get all posts by a specific user
     * GET /api/posts/user/{username}
     */
    @GetMapping("/user/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PostResponseDTO>> getUserPosts(@PathVariable String username) {
        log.info("Fetching all posts for user: {}", username);

        List<PostResponseDTO> posts = postService.getPostsByUsername(username);

        return ResponseEntity.ok(posts);
    }
}
