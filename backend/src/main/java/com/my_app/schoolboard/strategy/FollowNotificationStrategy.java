package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.event.DomainEvent;
import com.my_app.schoolboard.event.UserFollowedEvent;
import com.my_app.schoolboard.model.NotificationType;
import org.springframework.stereotype.Component;

@Component
public class FollowNotificationStrategy implements NotificationStrategy {

    @Override
    public NotificationType getSupportedType() {
        return NotificationType.USER_FOLLOWED;
    }

    @Override
    public String generateTitle(DomainEvent event) {
        UserFollowedEvent followedEvent = cast(event);
        return followedEvent.getFollowerUsername() + " started following you";
    }

    @Override
    public String generateMessage(DomainEvent event) {
        UserFollowedEvent followedEvent = cast(event);
        return "Cause: " + followedEvent.getFollowerUsername() + " followed your profile.";
    }

    private UserFollowedEvent cast(DomainEvent event) {
        if (!(event instanceof UserFollowedEvent followedEvent)) {
            throw new IllegalArgumentException(
                    "Unsupported event for USER_FOLLOWED strategy: " + event.getClass().getSimpleName());
        }
        return followedEvent;
    }
}
