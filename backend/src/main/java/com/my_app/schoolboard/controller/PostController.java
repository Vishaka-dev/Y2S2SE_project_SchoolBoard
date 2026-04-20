package com.my_app.schoolboard.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.my_app.schoolboard.dto.PostResponseDTO;
import com.my_app.schoolboard.service.PostService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
            @RequestParam(value = "groupId", required = false) Long groupId,
            Authentication authentication) {

        log.info("Received request to create post from user: {} for group: {}", authentication.getName(), groupId);

        PostResponseDTO response = postService.createPost(content, image, authentication.getName(), groupId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PostResponseDTO>> getAllPosts(
            @RequestParam(name="page", defaultValue = "0") int page,
            @RequestParam(name="size", defaultValue = "10") int size,
            @RequestParam(name="groupId", required = false) Long groupId) {

        log.info("Fetching all posts for feed - page: {}, size: {}, groupId: {}", page, size, groupId);

        List<PostResponseDTO> posts;
        if (groupId != null) {
            posts = postService.getPostsByGroupId(groupId, page, size);
        } else {
            posts = postService.getAllPosts(page, size);
        }

        return ResponseEntity.ok(posts);
    }

    /**
     * Get a single post by ID
     * GET /api/posts/{id}
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostResponseDTO> getPostById(@PathVariable Long id) {
        log.info("Fetching post by ID: {}", id);
        PostResponseDTO post = postService.getPostById(id);
        return ResponseEntity.ok(post);
    }

    /**
     * Update an existing post
     * PATCH /api/posts/{id}
     */
    @PatchMapping(value = "/{id:\\d+}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostResponseDTO> updatePost(
            @PathVariable("id") Long id,
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
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletePost(
            @PathVariable("id") Long id,
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
    public ResponseEntity<List<PostResponseDTO>> getUserPosts(@PathVariable("username") String username) {

        log.info("Fetching all posts for user: {}", username);

        List<PostResponseDTO> posts = postService.getPostsByUsername(username);

        return ResponseEntity.ok(posts);
    }

    /**
     * Search posts by keyword
     * GET /api/posts/search?keyword=java
     */
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PostResponseDTO>> searchPosts(
            @RequestParam(value = "keyword", required = false) String keyword) {

        System.out.println("=== SEARCH ENDPOINT HIT === keyword: " + keyword);
        log.info("Searching posts with keyword: {}", keyword);

        List<PostResponseDTO> posts = postService.searchPosts(keyword);

        return ResponseEntity.ok(posts);
    }
}