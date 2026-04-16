package com.my_app.schoolboard.listener;

import com.my_app.schoolboard.dto.NotificationRequest;
import com.my_app.schoolboard.event.ProfileUpdatedEvent;
import com.my_app.schoolboard.factory.NotificationStrategyFactory;
import com.my_app.schoolboard.model.NotificationType;
import com.my_app.schoolboard.strategy.NotificationStrategy;
import com.my_app.schoolboard.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProfileUpdatedEventListener {

    private final NotificationService notificationService;
    private final NotificationStrategyFactory strategyFactory;

    @EventListener
    public void handleProfileUpdated(ProfileUpdatedEvent event) {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.PROFILE_UPDATED);

        NotificationRequest request = NotificationRequest.builder()
                .recipientId(event.getRecipientId())
                .type(NotificationType.PROFILE_UPDATED)
                .title(strategy.generateTitle(event))
                .message(strategy.generateMessage(event))
                .metadata(event.getMetadata())
                .build();

        notificationService.createNotification(request);
    }
}
