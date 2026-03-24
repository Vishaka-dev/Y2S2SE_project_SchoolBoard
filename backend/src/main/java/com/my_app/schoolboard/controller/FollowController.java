package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.FollowPageDTO;
import com.my_app.schoolboard.dto.FollowRelationshipDTO;
import com.my_app.schoolboard.dto.FollowStatsDTO;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.FollowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users/{id}")
@CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class FollowController {

    private final FollowService followService;
    private final UserRepository userRepository;

    @PostMapping("/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> followUser(@PathVariable Long id) {
        Long currentUserId = getCurrentAuthenticatedUserId();
        followService.followUser(currentUserId, id);
        return ResponseEntity.ok(Map.of("message", "Successfully followed user"));
    }

    @DeleteMapping("/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> unfollowUser(@PathVariable Long id) {
        Long currentUserId = getCurrentAuthenticatedUserId();
        followService.unfollowUser(currentUserId, id);
        return ResponseEntity.ok(Map.of("message", "Successfully unfollowed user"));
    }

    @GetMapping("/followers")
    public ResponseEntity<FollowPageDTO> getFollowers(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(followService.getFollowers(id, page, size));
    }

    @GetMapping("/following")
    public ResponseEntity<FollowPageDTO> getFollowing(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(followService.getFollowing(id, page, size));
    }

    @GetMapping("/relationship")
    public ResponseEntity<FollowRelationshipDTO> getRelationship(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.ok(new FollowRelationshipDTO(false, false, false));
        }

        Long currentUserId = getCurrentAuthenticatedUserId();
        return ResponseEntity.ok(followService.getRelationship(currentUserId, id));
    }

    @GetMapping("/follow-stats")
    public ResponseEntity<FollowStatsDTO> getStats(@PathVariable Long id) {
        return ResponseEntity.ok(followService.getStats(id));
    }

    private Long getCurrentAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new IllegalArgumentException("User is not authenticated");
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return user.getId();
    }
}
