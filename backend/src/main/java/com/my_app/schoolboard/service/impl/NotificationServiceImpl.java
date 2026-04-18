package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.NotificationPageDTO;
import com.my_app.schoolboard.dto.NotificationRequest;
import com.my_app.schoolboard.dto.NotificationResponseDTO;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.exception.UnauthorizedOperationException;
import com.my_app.schoolboard.model.Notification;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.NotificationRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public void createNotification(NotificationRequest request) {
        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getRecipientId()));

        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .isRead(false)
                .metadata(request.getMetadata() == null ? new HashMap<>() : request.getMetadata())
                .build();

        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationPageDTO getNotifications(int page, int size, String username) {
        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.min(Math.max(size, 1), 100);

        User recipient = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notifications = notificationRepository.findByRecipientId(recipient.getId(), pageable);

        return NotificationPageDTO.builder()
                .notifications(notifications.getContent().stream().map(this::toResponse).toList())
                .page(notifications.getNumber())
                .size(notifications.getSize())
                .totalElements(notifications.getTotalElements())
                .totalPages(notifications.getTotalPages())
                .hasNext(notifications.hasNext())
                .build();
    }

    @Override
    public NotificationResponseDTO markAsRead(Long id, String username) {
        User recipient = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));

        if (!notification.getRecipient().getId().equals(recipient.getId())) {
            throw new UnauthorizedOperationException("You can only mark your own notifications as read");
        }

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    private NotificationResponseDTO toResponse(Notification notification) {
        return NotificationResponseDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .metadata(notification.getMetadata())
                .build();
    }
}
