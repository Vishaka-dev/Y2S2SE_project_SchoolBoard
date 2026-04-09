package com.my_app.schoolboard.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.my_app.schoolboard.dto.CreateGroupRequestDTO;
import com.my_app.schoolboard.dto.GroupMemberDTO;
import com.my_app.schoolboard.dto.GroupResponseDTO;
import com.my_app.schoolboard.service.GroupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
@RequiredArgsConstructor
@Validated
@Slf4j
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GroupResponseDTO> createGroup(
            @Valid @RequestBody CreateGroupRequestDTO request,
            Authentication authentication) {
        log.info("Creating group for user {}", authentication.getName());
        GroupResponseDTO response = groupService.createGroup(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GroupResponseDTO> getGroup(@PathVariable("id") Long id, Authentication authentication) {
        return ResponseEntity.ok(groupService.getGroupById(id, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GroupResponseDTO>> getGroups(Authentication authentication) {
        return ResponseEntity.ok(groupService.getGroups(authentication.getName()));
    }

    @GetMapping("/my-groups")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GroupResponseDTO>> getMyGroups(Authentication authentication) {
        return ResponseEntity.ok(groupService.getMyGroups(authentication.getName()));
    }

    @PostMapping("/{id}/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> joinGroup(@PathVariable("id") Long id, Authentication authentication) {
        groupService.joinGroup(id, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Joined group successfully"));
    }

    @DeleteMapping("/{id}/leave")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> leaveGroup(@PathVariable("id") Long id, Authentication authentication) {
        groupService.leaveGroup(id, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Left group successfully"));
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GroupMemberDTO>> getGroupMembers(
            @PathVariable("id") Long id,
            Authentication authentication) {
        return ResponseEntity.ok(groupService.getGroupMembers(id, authentication.getName()));
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GroupResponseDTO>> searchGroups(
            @jakarta.validation.constraints.NotBlank @org.springframework.web.bind.annotation.RequestParam("keyword") String keyword,
            Authentication authentication) {
        return ResponseEntity.ok(groupService.searchGroups(keyword, authentication.getName()));
    }
}
