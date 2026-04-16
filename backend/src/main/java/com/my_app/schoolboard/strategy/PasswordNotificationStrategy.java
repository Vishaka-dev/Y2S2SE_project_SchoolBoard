package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.event.DomainEvent;
import com.my_app.schoolboard.event.PasswordChangedEvent;
import com.my_app.schoolboard.model.NotificationType;
import org.springframework.stereotype.Component;

@Component
public class PasswordNotificationStrategy implements NotificationStrategy {

    @Override
    public NotificationType getSupportedType() {
        return NotificationType.PASSWORD_CHANGED;
    }

    @Override
    public String generateTitle(DomainEvent event) {
        return "Password changed";
    }

    @Override
    public String generateMessage(DomainEvent event) {
        PasswordChangedEvent passwordEvent = cast(event);
        return "Your password was changed successfully for account " + passwordEvent.getUsername() + ".";
    }

    private PasswordChangedEvent cast(DomainEvent event) {
        if (!(event instanceof PasswordChangedEvent passwordEvent)) {
            throw new IllegalArgumentException(
                    "Unsupported event for PASSWORD_CHANGED strategy: " + event.getClass().getSimpleName());
        }
        return passwordEvent;
    }
}
