package com.my_app.schoolboard.event;

import lombok.Builder;
import lombok.Value;

import java.util.Map;

@Value
@Builder
public class MessageReceivedEvent implements DomainEvent {
    Long recipientId;
    Long senderId;
    String senderUsername;
    String preview;

    @Override
    public Map<String, Object> getMetadata() {
        return Map.of(
                "senderId", senderId,
                "senderUsername", senderUsername,
                "preview", preview == null ? "" : preview);
    }
}
