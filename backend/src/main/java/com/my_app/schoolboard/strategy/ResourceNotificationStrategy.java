package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.event.DomainEvent;
import com.my_app.schoolboard.event.ResourceUploadedEvent;
import com.my_app.schoolboard.model.NotificationType;
import org.springframework.stereotype.Component;

@Component
public class ResourceNotificationStrategy implements NotificationStrategy {

    @Override
    public NotificationType getSupportedType() {
        return NotificationType.RESOURCE_UPLOADED;
    }

    @Override
    public String generateTitle(DomainEvent event) {
        ResourceUploadedEvent resourceEvent = cast(event);
        return resourceEvent.getUploaderUsername() + " uploaded a new resource";
    }

    @Override
    public String generateMessage(DomainEvent event) {
        ResourceUploadedEvent resourceEvent = cast(event);
        return "\"" + resourceEvent.getResourceTitle() + "\" is now available in Resource Hub.";
    }

    private ResourceUploadedEvent cast(DomainEvent event) {
        if (!(event instanceof ResourceUploadedEvent resourceEvent)) {
            throw new IllegalArgumentException(
                    "Unsupported event for RESOURCE_UPLOADED strategy: " + event.getClass().getSimpleName());
        }
        return resourceEvent;
    }
}
