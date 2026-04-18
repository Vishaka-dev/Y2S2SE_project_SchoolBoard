package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.event.DomainEvent;
import com.my_app.schoolboard.event.ProfileUpdatedEvent;
import com.my_app.schoolboard.model.NotificationType;
import org.springframework.stereotype.Component;

@Component
public class ProfileNotificationStrategy implements NotificationStrategy {

    @Override
    public NotificationType getSupportedType() {
        return NotificationType.PROFILE_UPDATED;
    }

    @Override
    public String generateTitle(DomainEvent event) {
        return "Profile updated";
    }

    @Override
    public String generateMessage(DomainEvent event) {
        ProfileUpdatedEvent profileEvent = cast(event);
        return "Your profile information was updated successfully, " + profileEvent.getUsername() + ".";
    }

    private ProfileUpdatedEvent cast(DomainEvent event) {
        if (!(event instanceof ProfileUpdatedEvent profileEvent)) {
            throw new IllegalArgumentException(
                    "Unsupported event for PROFILE_UPDATED strategy: " + event.getClass().getSimpleName());
        }
        return profileEvent;
    }
}
