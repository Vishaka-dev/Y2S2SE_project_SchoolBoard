package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.CreateGroupRequestDTO;
import com.my_app.schoolboard.dto.GroupMemberDTO;
import com.my_app.schoolboard.dto.GroupResponseDTO;
import com.my_app.schoolboard.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class GroupController {

    private final GroupService groupService;

    /**
     * Create a new group
     * POST /api/groups
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GroupResponseDTO> createGroup(
            @Valid @RequestBody CreateGroupRequestDTO request,
            Authentication authentication) {

        log.info("Received request to create group '{}' from user: {}", request.getName(), authentication.getName());

        GroupResponseDTO response = groupService.createGroup(request, authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get group details by ID
     * GET /api/groups/{groupId}
     */
    @GetMapping("/{groupId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GroupResponseDTO> getGroupById(
            @PathVariable Long groupId,
            Authentication authentication) {

        log.info("Fetching group {} for user: {}", groupId, authentication.getName());

        GroupResponseDTO response = groupService.getGroupById(groupId, authentication.getName());

        return ResponseEntity.ok(response);
    }

    /**
     * Get all groups
     * GET /api/groups
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GroupResponseDTO>> getAllGroups(Authentication authentication) {

        log.info("Fetching all groups for user: {}", authentication.getName());

        List<GroupResponseDTO> groups = groupService.getAllGroups(authentication.getName());

        return ResponseEntity.ok(groups);
    }

    /**
     * Get current user's groups (created or joined)
     * GET /api/groups/my-groups
     */
    @GetMapping("/my-groups")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GroupResponseDTO>> getMyGroups(Authentication authentication) {

        log.info("Fetching my groups for user: {}", authentication.getName());

        List<GroupResponseDTO> groups = groupService.getMyGroups(authentication.getName());

        return ResponseEntity.ok(groups);
    }

    /**
     * Join a group
     * POST /api/groups/{groupId}/join
     */
    @PostMapping("/{groupId}/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> joinGroup(
            @PathVariable Long groupId,
            Authentication authentication) {

        log.info("User '{}' requesting to join group {}", authentication.getName(), groupId);

        groupService.joinGroup(groupId, authentication.getName());

        return ResponseEntity.ok(Map.of("message", "Successfully joined the group"));
    }

    /**
     * Leave a group
     * DELETE /api/groups/{groupId}/leave
     */
    @DeleteMapping("/{groupId}/leave")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> leaveGroup(
            @PathVariable Long groupId,
            Authentication authentication) {

        log.info("User '{}' requesting to leave group {}", authentication.getName(), groupId);

        groupService.leaveGroup(groupId, authentication.getName());

        return ResponseEntity.ok(Map.of("message", "Successfully left the group"));
    }

    /**
     * Get members of a group
     * GET /api/groups/{groupId}/members
     */
    @GetMapping("/{groupId}/members")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GroupMemberDTO>> getGroupMembers(@PathVariable Long groupId) {

        log.info("Fetching members for group {}", groupId);

        List<GroupMemberDTO> members = groupService.getGroupMembers(groupId);

        return ResponseEntity.ok(members);
    }
}
