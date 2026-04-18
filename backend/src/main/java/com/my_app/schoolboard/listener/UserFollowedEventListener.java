package com.my_app.schoolboard.listener;

import com.my_app.schoolboard.dto.NotificationRequest;
import com.my_app.schoolboard.event.UserFollowedEvent;
import com.my_app.schoolboard.factory.NotificationStrategyFactory;
import com.my_app.schoolboard.model.NotificationType;
import com.my_app.schoolboard.strategy.NotificationStrategy;
import com.my_app.schoolboard.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserFollowedEventListener {

    private final NotificationService notificationService;
    private final NotificationStrategyFactory strategyFactory;

    @EventListener
    public void handleUserFollowed(UserFollowedEvent event) {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.USER_FOLLOWED);

        NotificationRequest request = NotificationRequest.builder()
                .recipientId(event.getRecipientId())
                .type(NotificationType.USER_FOLLOWED)
                .title(strategy.generateTitle(event))
                .message(strategy.generateMessage(event))
                .metadata(event.getMetadata())
                .build();

        notificationService.createNotification(request);
    }
}
