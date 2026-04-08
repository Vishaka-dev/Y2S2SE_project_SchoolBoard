package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.ReactionRequestDTO;
import com.my_app.schoolboard.dto.ReactionSummaryDTO;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.ReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/reactions")
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionService reactionService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return userRepository.findByUsername(auth.getName())
                    .map(User::getId)
                    .orElseThrow(() -> new RuntimeException("Current user not found"));
        }
        throw new RuntimeException("User is not authenticated");
    }

    private Long getCurrentUserIdOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return userRepository.findByUsername(auth.getName())
                    .map(User::getId)
                    .orElse(null);
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<ReactionSummaryDTO> reactToPost(
            @PathVariable Long postId,
            @RequestBody ReactionRequestDTO request) {
        Long userId = getCurrentUserId();
        ReactionSummaryDTO summary = reactionService.reactToPost(postId, userId, request.getReactionType());
        return ResponseEntity.ok(summary);
    }

    @GetMapping
    public ResponseEntity<ReactionSummaryDTO> getReactionSummary(@PathVariable Long postId) {
        Long userId = getCurrentUserIdOrNull();
        ReactionSummaryDTO summary = reactionService.getReactionSummary(postId, userId);
        return ResponseEntity.ok(summary);
    }
}
