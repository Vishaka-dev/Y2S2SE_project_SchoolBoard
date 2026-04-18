package com.my_app.schoolboard.event;

import lombok.Builder;
import lombok.Value;

import java.util.Map;

@Value
@Builder
public class ResourceUploadedEvent implements DomainEvent {
    Long recipientId;
    Long resourceId;
    Long uploaderId;
    String uploaderUsername;
    String resourceTitle;

    @Override
    public Map<String, Object> getMetadata() {
        return Map.of(
                "resourceId", resourceId,
                "uploaderId", uploaderId,
                "resourceTitle", resourceTitle);
    }
}
