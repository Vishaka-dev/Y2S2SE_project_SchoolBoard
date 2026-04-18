package com.my_app.schoolboard.event;

import lombok.Builder;
import lombok.Value;

import java.util.Map;

@Value
@Builder
public class GroupCreatedEvent implements DomainEvent {
    Long recipientId;
    Long groupId;
    String groupName;
    Long creatorId;
    String creatorUsername;

    @Override
    public Map<String, Object> getMetadata() {
        return Map.of(
                "groupId", groupId,
                "groupName", groupName,
                "creatorId", creatorId,
                "creatorUsername", creatorUsername);
    }
}
