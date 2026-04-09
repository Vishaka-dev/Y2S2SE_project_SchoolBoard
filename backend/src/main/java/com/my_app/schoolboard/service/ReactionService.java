package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.ReactionSummaryDTO;
import com.my_app.schoolboard.model.ReactionType;

import java.util.List;
import java.util.Map;

public interface ReactionService {
    
    ReactionSummaryDTO reactToPost(Long postId, Long userId, ReactionType reactionType);
    
    ReactionSummaryDTO getReactionSummary(Long postId, Long userId);
    
    Map<Long, ReactionSummaryDTO> getReactionSummaryMapForPosts(List<Long> postIds, Long userId);
}
