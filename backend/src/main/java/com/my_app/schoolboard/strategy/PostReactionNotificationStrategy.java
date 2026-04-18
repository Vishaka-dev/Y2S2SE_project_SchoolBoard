package com.my_app.schoolboard.strategy;

import com.my_app.schoolboard.event.DomainEvent;
import com.my_app.schoolboard.event.PostReactedEvent;
import com.my_app.schoolboard.model.NotificationType;
import org.springframework.stereotype.Component;

@Component
public class PostReactionNotificationStrategy implements NotificationStrategy {

    @Override
    public NotificationType getSupportedType() {
        return NotificationType.POST_REACTED;
    }

    @Override
    public String generateTitle(DomainEvent event) {
        PostReactedEvent reactedEvent = cast(event);
        return reactedEvent.getReactorUsername() + " reacted to your post";
    }

    @Override
    public String generateMessage(DomainEvent event) {
        PostReactedEvent reactedEvent = cast(event);
        String reactionLabel = toReactionLabel(reactedEvent);

        return "Cause: " + reactedEvent.getReactorUsername() + " added " + reactionLabel + " on your post.";
    }

    private String toReactionLabel(PostReactedEvent reactedEvent) {
        if (reactedEvent.getReactionType() == null) {
            return "a reaction";
        }

        return reactedEvent.getReactionType().name().toLowerCase().replace('_', ' ');
    }

    private PostReactedEvent cast(DomainEvent event) {
        if (!(event instanceof PostReactedEvent reactedEvent)) {
            throw new IllegalArgumentException(
                    "Unsupported event for POST_REACTED strategy: " + event.getClass().getSimpleName());
        }
        return reactedEvent;
    }
}
