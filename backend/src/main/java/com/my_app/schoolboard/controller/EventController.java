package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.EventResponseDTO;
import com.my_app.schoolboard.service.EventService;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getAllEvents() {
        log.info("Fetching all events");
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventResponseDTO>> getUpcomingEvents() {
        log.info("Fetching upcoming events");
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventResponseDTO> createEvent(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("eventDate") String eventDateStr,
            @RequestParam("location") String location,
            @RequestParam("category") String category,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image,
            Authentication authentication) {
        
        log.info("Creating event: {} by user: {}", title, authentication.getName());
        
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        // Parse date
        java.time.LocalDateTime eventDate = java.time.LocalDateTime.parse(eventDateStr);
        com.my_app.schoolboard.model.EventCategory eventCategory = com.my_app.schoolboard.model.EventCategory.valueOf(category);

        EventResponseDTO response = eventService.createEvent(title, description, eventDate, location, eventCategory, image, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            Authentication authentication) {
        
        log.info("Deleting event: {} by user: {}", id, authentication.getName());
        
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        eventService.deleteEvent(id, user);
        return ResponseEntity.noContent().build();
    }
}
