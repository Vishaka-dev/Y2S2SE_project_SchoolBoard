package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.CommentRequestDTO;
import com.my_app.schoolboard.dto.CommentResponseDTO;

import java.util.List;

public interface CommentService {
    CommentResponseDTO createComment(Long postId, CommentRequestDTO request, String username);
    List<CommentResponseDTO> getCommentsByPost(Long postId);
    void deleteComment(Long commentId, String username);
}
