package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.UserSearchResultDTO;
import com.my_app.schoolboard.service.UserSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
@RequiredArgsConstructor
public class UserSearchController {

    private final UserSearchService userSearchService;

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @RequestParam("q") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (query == null || query.trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Search query cannot be empty"));
        }

        Page<UserSearchResultDTO> results = userSearchService.searchUsers(query, page, size);
        return ResponseEntity.ok(results);
    }
}
