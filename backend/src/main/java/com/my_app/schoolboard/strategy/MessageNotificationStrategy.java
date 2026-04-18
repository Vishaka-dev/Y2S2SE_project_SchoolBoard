package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.event.DomainEvent;
import com.my_app.schoolboard.event.MessageReceivedEvent;
import com.my_app.schoolboard.model.NotificationType;
import org.springframework.stereotype.Component;

@Component
public class MessageNotificationStrategy implements NotificationStrategy {

    @Override
    public NotificationType getSupportedType() {
        return NotificationType.MESSAGE_RECEIVED;
    }

    @Override
    public String generateTitle(DomainEvent event) {
        MessageReceivedEvent messageEvent = cast(event);
        return "New message from " + messageEvent.getSenderUsername();
    }

    @Override
    public String generateMessage(DomainEvent event) {
        MessageReceivedEvent messageEvent = cast(event);
        if (messageEvent.getPreview() == null || messageEvent.getPreview().isBlank()) {
            return "You have received a new peer message.";
        }
        return "\"" + messageEvent.getPreview() + "\"";
    }

    private MessageReceivedEvent cast(DomainEvent event) {
        if (!(event instanceof MessageReceivedEvent messageEvent)) {
            throw new IllegalArgumentException(
                    "Unsupported event for MESSAGE_RECEIVED strategy: " + event.getClass().getSimpleName());
        }
        return messageEvent;
    }
}
