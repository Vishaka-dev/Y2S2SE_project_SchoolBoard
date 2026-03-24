package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.FollowPageDTO;
import com.my_app.schoolboard.dto.FollowRelationshipDTO;
import com.my_app.schoolboard.dto.FollowStatsDTO;

public interface FollowService {
    void followUser(Long currentUserId, Long targetUserId);

    void unfollowUser(Long currentUserId, Long targetUserId);

    FollowPageDTO getFollowers(Long userId, int page, int size);

    FollowPageDTO getFollowing(Long userId, int page, int size);

    FollowRelationshipDTO getRelationship(Long currentUserId, Long targetUserId);

    FollowStatsDTO getStats(Long userId);
}
