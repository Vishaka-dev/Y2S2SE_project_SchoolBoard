package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.ResourceCreateRequestDTO;
import com.my_app.schoolboard.dto.ResourcePageDTO;
import com.my_app.schoolboard.dto.ResourceResponseDTO;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.exception.UnauthorizedOperationException;
import com.my_app.schoolboard.model.*;
import com.my_app.schoolboard.repository.ResourceRepository;
import com.my_app.schoolboard.repository.TagRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.repository.StudyGroupRepository;
import com.my_app.schoolboard.service.FileStorageService;
import com.my_app.schoolboard.service.ResourceService;
import com.my_app.schoolboard.specification.ResourceSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResourceServiceImpl implements ResourceService {

    private static final long MAX_RESOURCE_FILE_SIZE = 10 * 1024 * 1024;

    private static final Set<String> DOCUMENT_MIME_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain");

    private static final Set<String> IMAGE_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp");

    private static final Set<String> PRESENTATION_MIME_TYPES = Set.of(
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/pdf");

    private final ResourceRepository resourceRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public ResourceResponseDTO createResource(ResourceCreateRequestDTO request, String username) {
        log.info("Creating resource for user: {}", username);

        User uploader = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        validateUploadFields(request);

        String fileUrl = null;
        if (request.getFile() != null && !request.getFile().isEmpty()) {
            fileUrl = fileStorageService.uploadResourceFile(uploader.getId(), request.getFile());
        }

        Set<Tag> tags = resolveTags(request.getTags());

        StudyGroup group = null;
        if (request.getGroupId() != null) {
            group = studyGroupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", request.getGroupId()));
        }

        Resource resource = Resource.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .type(request.getType())
                .category(request.getCategory())
                .fileUrl(fileUrl)
                .externalUrl(cleanNullable(request.getExternalUrl()))
                .uploadedBy(uploader)
                .group(group)
                .tags(tags)
                .build();

        Resource saved = resourceRepository.save(resource);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ResourcePageDTO getResources(int page, int size, ResourceCategory category, ResourceType type, String search,
            Role role, Long groupId) {
        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Resource> specification = Specification.where(ResourceSpecification.notDeleted())
                .and(ResourceSpecification.hasCategory(category))
                .and(ResourceSpecification.hasType(type))
                .and(ResourceSpecification.titleContains(search))
                .and(ResourceSpecification.uploaderHasRole(role));

        if (groupId != null) {
            specification = specification.and(ResourceSpecification.hasGroupId(groupId));
        } else {
            specification = specification.and(ResourceSpecification.groupIsNull());
        }

        Page<Resource> resourcePage = resourceRepository.findAll(specification, pageable);

        return ResourcePageDTO.builder()
                .resources(resourcePage.getContent().stream().map(this::mapToDTO).toList())
                .page(resourcePage.getNumber())
                .size(resourcePage.getSize())
                .totalElements(resourcePage.getTotalElements())
                .totalPages(resourcePage.getTotalPages())
                .hasNext(resourcePage.hasNext())
                .build();
    }

    @Override
    @Transactional
    public void deleteResource(Long id, String username) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));

        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (Boolean.TRUE.equals(resource.getIsDeleted())) {
            return;
        }

        if (!resource.getUploadedBy().getId().equals(requester.getId())) {
            throw new UnauthorizedOperationException("Only the uploader can delete this resource");
        }

        resource.setIsDeleted(true);
        resourceRepository.save(resource);
    }

    private void validateUploadFields(ResourceCreateRequestDTO request) {
        MultipartFile file = request.getFile();
        String externalUrl = cleanNullable(request.getExternalUrl());

        boolean hasFile = file != null && !file.isEmpty();
        boolean hasUrl = externalUrl != null;

        if (hasFile == hasUrl) {
            throw new IllegalArgumentException("Either file or externalUrl must be provided, but not both");
        }

        if (hasUrl && request.getType() != ResourceType.LINK) {
            throw new IllegalArgumentException("externalUrl can only be used when type is LINK");
        }

        if (hasFile && request.getType() == ResourceType.LINK) {
            throw new IllegalArgumentException("Type LINK requires externalUrl and does not support file upload");
        }

        if (!hasFile) {
            return;
        }

        if (file.getSize() > MAX_RESOURCE_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 10 MB");
        }

        String contentType = Optional.ofNullable(file.getContentType()).orElse("").toLowerCase();
        if (contentType.isBlank()) {
            throw new IllegalArgumentException("File content type is required");
        }

        Set<String> allowedMimeTypes = switch (request.getType()) {
            case DOCUMENT -> DOCUMENT_MIME_TYPES;
            case IMAGE -> IMAGE_MIME_TYPES;
            case PRESENTATION -> PRESENTATION_MIME_TYPES;
            case LINK -> Set.of();
        };

        if (!allowedMimeTypes.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type for resource type: " + request.getType());
        }
    }

    private Set<Tag> resolveTags(List<String> rawTags) {
        if (rawTags == null || rawTags.isEmpty()) {
            return new HashSet<>();
        }

        return rawTags.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .map(String::toLowerCase)
                .distinct()
                .map(tagName -> tagRepository.findByName(tagName)
                        .orElseGet(() -> tagRepository.save(Tag.builder().name(tagName).build())))
                .collect(Collectors.toCollection(HashSet::new));
    }

    private String cleanNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private ResourceResponseDTO mapToDTO(Resource resource) {
        User uploader = resource.getUploadedBy();

        return ResourceResponseDTO.builder()
                .id(resource.getId())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .type(resource.getType())
                .category(resource.getCategory())
                .fileUrl(resource.getFileUrl())
                .externalUrl(resource.getExternalUrl())
                .createdAt(resource.getCreatedAt())
                .uploadedBy(ResourceResponseDTO.UploaderDTO.builder()
                        .id(uploader.getId())
                        .username(uploader.getUsername())
                        .role(uploader.getRole().name())
                        .avatar(uploader.getProfileImageUrl() != null ? uploader.getProfileImageUrl()
                                : uploader.getImageUrl())
                        .build())
                .tags(resource.getTags().stream().map(Tag::getName).collect(Collectors.toCollection(TreeSet::new)))
                .build();
    }
}
