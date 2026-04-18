package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.ReactionSummaryDTO;
import com.my_app.schoolboard.event.PostReactedEvent;
import com.my_app.schoolboard.model.Post;
import com.my_app.schoolboard.model.PostReaction;
import com.my_app.schoolboard.model.ReactionType;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.PostReactionRepository;
import com.my_app.schoolboard.repository.PostRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.ReactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReactionServiceImpl implements ReactionService {

    private final PostReactionRepository postReactionRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public ReactionSummaryDTO reactToPost(Long postId, Long userId, ReactionType reactionType) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean shouldNotify = false;
        ReactionType effectiveReactionType = null;

        Optional<PostReaction> existingReactionOpt = postReactionRepository.findByPostIdAndUserId(postId, userId);

        if (existingReactionOpt.isPresent()) {
            PostReaction existingReaction = existingReactionOpt.get();
            if (existingReaction.getReactionType() == reactionType) {
                // Toggle off
                postReactionRepository.delete(existingReaction);
            } else {
                // Update to new type
                existingReaction.setReactionType(reactionType);
                postReactionRepository.save(existingReaction);
                shouldNotify = true;
                effectiveReactionType = reactionType;
            }
        } else {
            // Create new
            PostReaction newReaction = PostReaction.builder()
                    .post(post)
                    .user(user)
                    .reactionType(reactionType)
                    .build();
            postReactionRepository.save(newReaction);
            shouldNotify = true;
            effectiveReactionType = reactionType;
        }

        if (shouldNotify && !post.getAuthor().getId().equals(user.getId())) {
            eventPublisher.publishEvent(PostReactedEvent.builder()
                    .recipientId(post.getAuthor().getId())
                    .postId(post.getId())
                    .postAuthorId(post.getAuthor().getId())
                    .postAuthorUsername(post.getAuthor().getUsername())
                    .reactorId(user.getId())
                    .reactorUsername(user.getUsername())
                    .reactionType(effectiveReactionType)
                    .build());
        }

        return getReactionSummary(postId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public ReactionSummaryDTO getReactionSummary(Long postId, Long userId) {
        List<PostReaction> reactions = postReactionRepository.findByPostId(postId);
        return buildSummaryDTO(reactions, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, ReactionSummaryDTO> getReactionSummaryMapForPosts(List<Long> postIds, Long userId) {
        if (postIds == null || postIds.isEmpty()) {
            return Collections.emptyMap();
        }

        List<PostReaction> allReactions = postReactionRepository.findByPost_IdIn(postIds);

        // Group by post ID
        Map<Long, List<PostReaction>> reactionsByPostId = allReactions.stream()
                .collect(Collectors.groupingBy(r -> r.getPost().getId()));

        Map<Long, ReactionSummaryDTO> summaryMap = new HashMap<>();
        for (Long postId : postIds) {
            List<PostReaction> reactionsForPost = reactionsByPostId.getOrDefault(postId, Collections.emptyList());
            summaryMap.put(postId, buildSummaryDTO(reactionsForPost, userId));
        }

        return summaryMap;
    }

    private ReactionSummaryDTO buildSummaryDTO(List<PostReaction> reactions, Long userId) {
        Map<ReactionType, Long> counts = new EnumMap<>(ReactionType.class);
        for (ReactionType type : ReactionType.values()) {
            counts.put(type, 0L);
        }

        ReactionType currentUserReaction = null;
        long total = 0;

        for (PostReaction r : reactions) {
            counts.put(r.getReactionType(), counts.get(r.getReactionType()) + 1);
            total++;

            if (userId != null && r.getUser().getId().equals(userId)) {
                currentUserReaction = r.getReactionType();
            }
        }

        // Clean up counts with 0 if necessary, but returning all is fine for the
        // frontend
        return ReactionSummaryDTO.builder()
                .reactionCounts(counts)
                .totalReactions(total)
                .currentUserReaction(currentUserReaction)
                .build();
    }
}
