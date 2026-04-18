package com.my_app.schoolboard.event;

import lombok.Builder;
import lombok.Value;

import java.util.Map;

@Value
@Builder
public class PasswordChangedEvent implements DomainEvent {
    Long recipientId;
    Long userId;
    String username;

    @Override
    public Map<String, Object> getMetadata() {
        return Map.of(
                "userId", userId,
                "username", username);
    }
}
