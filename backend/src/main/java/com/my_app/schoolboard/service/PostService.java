package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.PostResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PostService {
    PostResponseDTO createPost(String content, MultipartFile image, String username);

    List<PostResponseDTO> getAllPosts(int page, int size);

    PostResponseDTO updatePost(Long id, String content, MultipartFile image, String username);

    void deletePost(Long id, String username);

    List<PostResponseDTO> getPostsByUsername(String username);
}
