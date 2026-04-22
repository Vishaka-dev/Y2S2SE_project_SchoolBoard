package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.EventRequestDTO;
import com.my_app.schoolboard.dto.EventResponseDTO;
import com.my_app.schoolboard.model.Event;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.EventRepository;
import com.my_app.schoolboard.repository.InstituteProfileRepository;
import com.my_app.schoolboard.repository.StudentProfileRepository;
import com.my_app.schoolboard.repository.TeacherProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final InstituteProfileRepository instituteProfileRepository;
    private final com.my_app.schoolboard.service.StorageService storageService;

    @Transactional(readOnly = true)
    public List<EventResponseDTO> getAllEvents() {
        return eventRepository.findAllByOrderByEventDateAsc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventResponseDTO> getUpcomingEvents() {
        return eventRepository.findByEventDateAfterOrderByEventDateAsc(LocalDateTime.now()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EventResponseDTO createEvent(String title, String description, LocalDateTime eventDate, String location, com.my_app.schoolboard.model.EventCategory category, MultipartFile image, User author) {
        String bannerImageUrl = null;
        if (image != null && !image.isEmpty()) {
            String filename = storageService.store(image);
            bannerImageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/posts/")
                    .path(filename)
                    .toUriString();
        }

        Event event = Event.builder()
                .title(title)
                .description(description)
                .eventDate(eventDate)
                .location(location)
                .category(category)
                .bannerImageUrl(bannerImageUrl)
                .author(author)
                .build();

        Event savedEvent = eventRepository.save(event);
        return mapToDTO(savedEvent);
    }

    @Transactional
    public void deleteEvent(Long eventId, User currentUser) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Only author or admin can delete
        if (!event.getAuthor().getId().equals(currentUser.getId()) && !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Unauthorized to delete this event");
        }

        eventRepository.delete(event);
    }

    private EventResponseDTO mapToDTO(Event event) {
        User author = event.getAuthor();
        
        // Load profile to get fullName
        String fullName = author.getUsername();
        Object profileName = switch (author.getRole()) {
            case SCHOOL_STUDENT, UNIVERSITY_STUDENT, STUDENT ->
                studentProfileRepository.findByUser(author).map(p -> p.getFullName()).orElse(null);
            case TEACHER -> teacherProfileRepository.findByUser(author).map(p -> p.getFullName()).orElse(null);
            case INSTITUTE ->
                instituteProfileRepository.findByUser(author).map(p -> p.getInstitutionName()).orElse(null);
            default -> null;
        };
        
        if (profileName != null) {
            fullName = (String) profileName;
        }

        return EventResponseDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .location(event.getLocation())
                .category(event.getCategory())
                .bannerImageUrl(event.getBannerImageUrl())
                .createdAt(event.getCreatedAt())
                .author(EventResponseDTO.AuthorDTO.builder()
                        .id(author.getId())
                        .name(fullName)
                        .role(author.getRole().name())
                        .avatar(author.getProfileImageUrl() != null ? author.getProfileImageUrl() : author.getImageUrl())
                        .username(author.getUsername())
                        .build())
                .build();
    }
}
