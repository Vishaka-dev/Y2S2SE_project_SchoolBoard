package com.my_app.schoolboard.event;

import java.util.Map;

public interface DomainEvent {

    Long getRecipientId();

    default Map<String, Object> getMetadata() {
        return Map.of();
    }
}
