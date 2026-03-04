package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.PostResponseDTO;
import com.my_app.schoolboard.model.Post;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.PostRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.repository.StudentProfileRepository;
import com.my_app.schoolboard.repository.TeacherProfileRepository;
import com.my_app.schoolboard.repository.InstituteProfileRepository;
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
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final InstituteProfileRepository instituteProfileRepository;
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
    public List<PostResponseDTO> getAllPosts(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return postRepository.findAllByOrderByCreatedAtDesc(pageable).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PostResponseDTO updatePost(Long id, String content, MultipartFile image, String username) {
        log.info("Updating post {} by user {}", id, username);

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Security check: Only author or admin can update
        if (!post.getAuthor().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Unauthorized to update this post");
        }

        if (content != null) {
            post.setContent(content);
        }

        if (image != null && !image.isEmpty()) {
            // Delete old image if exists
            if (post.getImageUrl() != null) {
                storageService.delete(extractFilename(post.getImageUrl()));
            }

            // Store new image
            String filename = storageService.store(image);
            String imageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/posts/")
                    .path(filename)
                    .toUriString();
            post.setImageUrl(imageUrl);
        }

        Post updatedPost = postRepository.save(post);
        return mapToDTO(updatedPost);
    }

    @Override
    @Transactional
    public void deletePost(Long id, String username) {
        log.info("Deleting post {} by user {}", id, username);

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Security check: Only author or admin can delete
        if (!post.getAuthor().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Unauthorized to delete this post");
        }

        // Delete image from storage
        if (post.getImageUrl() != null) {
            storageService.delete(extractFilename(post.getImageUrl()));
        }

        postRepository.delete(post);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponseDTO> getPostsByUsername(String username) {
        log.info("Fetching all posts for user: {}", username);
        return postRepository.findAllByAuthorUsernameOrderByCreatedAtDesc(username).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private String extractFilename(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("/uploads/posts/")) {
            return null;
        }
        return imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
    }

    private PostResponseDTO mapToDTO(Post post) {
        User author = post.getAuthor();

        // Load profile to get fullName
        String fullName = author.getUsername();
        Object profileDTO = switch (author.getRole()) {
            case STUDENT -> studentProfileRepository.findByUser(author).map(p -> p.getFullName()).orElse(null);
            case TEACHER -> teacherProfileRepository.findByUser(author).map(p -> p.getFullName()).orElse(null);
            case INSTITUTE ->
                instituteProfileRepository.findByUser(author).map(p -> p.getInstitutionName()).orElse(null);
            default -> null;
        };
        if (profileDTO != null) {
            fullName = (String) profileDTO;
        }

        // Extract initials
        String initials = "";
        if (fullName != null && !fullName.isEmpty()) {
            String[] parts = fullName.split(" ");
            if (parts.length > 1) {
                initials = parts[0].substring(0, 1) + parts[1].substring(0, 1);
            } else {
                initials = fullName.substring(0, Math.min(fullName.length(), 2));
            }
        }

        PostResponseDTO.AuthorDTO authorDTO = PostResponseDTO.AuthorDTO.builder()
                .name(fullName)
                .role(author.getRole().name())
                .avatar(author.getProfileImageUrl() != null ? author.getProfileImageUrl() : author.getImageUrl())
                .initials(initials.toUpperCase())
                .username(author.getUsername())
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
