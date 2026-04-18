package com.my_app.schoolboard.event;

import lombok.Builder;
import lombok.Value;

import java.util.Map;

@Value
@Builder
public class UserFollowedEvent implements DomainEvent {
    Long recipientId;
    Long followerId;
    String followerUsername;
    Long followedUserId;
    String followedUsername;

    @Override
    public Map<String, Object> getMetadata() {
        return Map.of(
                "followerId", followerId,
                "followerUsername", followerUsername,
                "followedUserId", followedUserId,
                "followedUsername", followedUsername);
    }
}
