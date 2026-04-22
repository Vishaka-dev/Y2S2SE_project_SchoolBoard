package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.NotificationPageDTO;
import com.my_app.schoolboard.dto.NotificationRequest;
import com.my_app.schoolboard.dto.NotificationResponseDTO;

public interface NotificationService {

    void createNotification(NotificationRequest request);

    NotificationPageDTO getNotifications(int page, int size, String username);

    NotificationResponseDTO markAsRead(Long id, String username);
}
