package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.PostResponseDTO;
import com.my_app.schoolboard.model.Post;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.PostRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.PostService;
import com.my_app.schoolboard.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    @Transactional
    public PostResponseDTO createPost(String content, MultipartFile image, String username) {
        log.info("Creating new post by user: {}", username);

        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ((content == null || content.trim().isEmpty()) && (image == null || image.isEmpty())) {
            throw new IllegalArgumentException("Post must contain either text content or an image");
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            String filename = storageService.store(image);
            // Build the full URL to the image
            imageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/posts/")
                    .path(filename)
                    .toUriString();
        }

        Post post = Post.builder()
                .content(content)
                .imageUrl(imageUrl)
                .author(author)
                .build();

        Post savedPost = postRepository.save(post);
        return mapToDTO(savedPost);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponseDTO> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private PostResponseDTO mapToDTO(Post post) {
        User author = post.getAuthor();

        // Use the username since User model doesn't have fullName natively
        String authorName = author.getUsername();

        // Extract initials
        String initials = "";
        if (authorName != null && !authorName.isEmpty()) {
            String[] parts = authorName.split(" ");
            if (parts.length > 1) {
                initials = parts[0].substring(0, 1) + parts[1].substring(0, 1);
            } else {
                initials = parts[0].substring(0, 2);
            }
        }

        PostResponseDTO.AuthorDTO authorDTO = PostResponseDTO.AuthorDTO.builder()
                .name(authorName)
                .role(author.getRole().name())
                .avatar(author.getImageUrl())
                .initials(initials.toUpperCase())
                .build();

        return PostResponseDTO.builder()
                .id(post.getId())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .author(authorDTO)
                .createdAt(post.getCreatedAt())
                .build();
    }
}
