package com.my_app.schoolboard.event;

import com.my_app.schoolboard.model.ReactionType;
import lombok.Builder;
import lombok.Value;

import java.util.HashMap;
import java.util.Map;

@Value
@Builder
public class PostReactedEvent implements DomainEvent {
    Long recipientId;
    Long postId;
    Long postAuthorId;
    String postAuthorUsername;
    Long reactorId;
    String reactorUsername;
    ReactionType reactionType;

    @Override
    public Map<String, Object> getMetadata() {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("postId", postId);
        metadata.put("postAuthorId", postAuthorId);
        metadata.put("reactorId", reactorId);
        metadata.put("reactorUsername", reactorUsername);

        if (postAuthorUsername != null) {
            metadata.put("postAuthorUsername", postAuthorUsername);
        }
        if (reactionType != null) {
            metadata.put("reactionType", reactionType.name());
        }

        return metadata;
    }
}
