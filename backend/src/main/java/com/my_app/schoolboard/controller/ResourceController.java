package com.my_app.schoolboard.controller;

import com.my_app.schoolboard.dto.ResourceCreateRequestDTO;
import com.my_app.schoolboard.dto.ResourcePageDTO;
import com.my_app.schoolboard.dto.ResourceResponseDTO;
import com.my_app.schoolboard.model.ResourceCategory;
import com.my_app.schoolboard.model.ResourceType;
import com.my_app.schoolboard.model.Role;
import com.my_app.schoolboard.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResourceResponseDTO> createResource(
            @Valid @ModelAttribute ResourceCreateRequestDTO request,
            Authentication authentication) {

        ResourceResponseDTO response = resourceService.createResource(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<ResourcePageDTO> getResources(
            @RequestParam(name="page", defaultValue = "0") int page,
            @RequestParam(name="size", defaultValue = "10") int size,
            @RequestParam(name="category", required = false) ResourceCategory category,
            @RequestParam(name="type", required = false) ResourceType type,
            @RequestParam(name="search", required = false) String search,
            @RequestParam(name="role", required = false) Role role,
            @RequestParam(name="groupId", required = false) Long groupId) {

        ResourcePageDTO response = resourceService.getResources(page, size, category, type, search, role, groupId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteResource(@PathVariable("id") Long id, Authentication authentication) {
        resourceService.deleteResource(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
