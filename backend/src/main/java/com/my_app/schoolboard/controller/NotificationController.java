package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.NotificationPageDTO;
import com.my_app.schoolboard.dto.NotificationResponseDTO;
import com.my_app.schoolboard.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationPageDTO> getMyNotifications(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            Authentication authentication) {

        NotificationPageDTO response = notificationService.getNotifications(page, size, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id:\\d+}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationResponseDTO> markAsRead(@PathVariable("id") Long id,
            Authentication authentication) {
        NotificationResponseDTO response = notificationService.markAsRead(id, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
