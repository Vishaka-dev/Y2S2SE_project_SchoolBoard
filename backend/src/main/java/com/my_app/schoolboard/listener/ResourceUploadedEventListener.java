package com.my_app.schoolboard.listener;

import com.my_app.schoolboard.dto.NotificationRequest;
import com.my_app.schoolboard.event.ResourceUploadedEvent;
import com.my_app.schoolboard.factory.NotificationStrategyFactory;
import com.my_app.schoolboard.model.NotificationType;
import com.my_app.schoolboard.strategy.NotificationStrategy;
import com.my_app.schoolboard.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResourceUploadedEventListener {

    private final NotificationService notificationService;
    private final NotificationStrategyFactory strategyFactory;

    @EventListener
    public void handleResourceUploaded(ResourceUploadedEvent event) {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.RESOURCE_UPLOADED);

        NotificationRequest request = NotificationRequest.builder()
                .recipientId(event.getRecipientId())
                .type(NotificationType.RESOURCE_UPLOADED)
                .title(strategy.generateTitle(event))
                .message(strategy.generateMessage(event))
                .metadata(event.getMetadata())
                .build();

        notificationService.createNotification(request);
    }
}
