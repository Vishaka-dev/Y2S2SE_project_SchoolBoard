package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.NotificationType;
import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {
    private Long recipientId;
    private NotificationType type;
    private String title;
    private String message;

    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();
}
