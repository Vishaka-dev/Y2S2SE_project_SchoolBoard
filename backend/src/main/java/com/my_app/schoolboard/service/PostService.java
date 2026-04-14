package com.my_app.schoolboard.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.my_app.schoolboard.dto.PostResponseDTO;

public interface PostService {
    PostResponseDTO createPost(String content, MultipartFile image, String username);

    List<PostResponseDTO> getAllPosts(int page, int size);

    PostResponseDTO updatePost(Long id, String content, MultipartFile image, String username);

    void deletePost(Long id, String username);

    List<PostResponseDTO> searchPosts(String keyword);
    
    PostResponseDTO getPostById(Long id);

    List<PostResponseDTO> getPostsByUsername(String username);
}
