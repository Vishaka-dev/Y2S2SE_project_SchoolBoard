package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.event.DomainEvent;
import com.my_app.schoolboard.event.GroupCreatedEvent;
import com.my_app.schoolboard.model.NotificationType;
import org.springframework.stereotype.Component;

@Component
public class GroupNotificationStrategy implements NotificationStrategy {

    @Override
    public NotificationType getSupportedType() {
        return NotificationType.GROUP_CREATED;
    }

    @Override
    public String generateTitle(DomainEvent event) {
        GroupCreatedEvent groupEvent = cast(event);
        return groupEvent.getCreatorUsername() + " created a new group";
    }

    @Override
    public String generateMessage(DomainEvent event) {
        GroupCreatedEvent groupEvent = cast(event);
        return "You were invited to join \"" + groupEvent.getGroupName() + "\".";
    }

    private GroupCreatedEvent cast(DomainEvent event) {
        if (!(event instanceof GroupCreatedEvent groupEvent)) {
            throw new IllegalArgumentException(
                    "Unsupported event for GROUP_CREATED strategy: " + event.getClass().getSimpleName());
        }
        return groupEvent;
    }
}
