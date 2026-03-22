package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.FollowPageDTO;
import com.my_app.schoolboard.dto.FollowRelationshipDTO;
import com.my_app.schoolboard.dto.FollowStatsDTO;
import com.my_app.schoolboard.dto.FollowUserSummaryDTO;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.model.Follow;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.FollowRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FollowServiceImpl implements FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void followUser(Long currentUserId, Long targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }

        User follower = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        User following = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        if (followRepository.existsByFollower_IdAndFollowing_Id(currentUserId, targetUserId)) {
            throw new IllegalStateException("Already following this user");
        }

        Follow follow = Follow.builder()
                .id(new Follow.FollowId(currentUserId, targetUserId))
                .follower(follower)
                .following(following)
                .build();

        followRepository.save(follow);
    }

    @Override
    @Transactional
    public void unfollowUser(Long currentUserId, Long targetUserId) {
        userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        if (!followRepository.existsByFollower_IdAndFollowing_Id(currentUserId, targetUserId)) {
            return;
        }

        followRepository.deleteByFollower_IdAndFollowing_Id(currentUserId, targetUserId);
    }

    @Override
    public FollowPageDTO getFollowers(Long userId, int page, int size) {
        Page<User> followersPage = followRepository.findFollowersByUserId(userId, PageRequest.of(page, size));
        return FollowPageDTO.builder()
                .users(followersPage.getContent().stream().map(this::toSummaryDTO).toList())
                .page(followersPage.getNumber())
                .size(followersPage.getSize())
                .totalElements(followersPage.getTotalElements())
                .totalPages(followersPage.getTotalPages())
                .hasNext(followersPage.hasNext())
                .build();
    }

    @Override
    public FollowPageDTO getFollowing(Long userId, int page, int size) {
        Page<User> followingPage = followRepository.findFollowingByUserId(userId, PageRequest.of(page, size));
        return FollowPageDTO.builder()
                .users(followingPage.getContent().stream().map(this::toSummaryDTO).toList())
                .page(followingPage.getNumber())
                .size(followingPage.getSize())
                .totalElements(followingPage.getTotalElements())
                .totalPages(followingPage.getTotalPages())
                .hasNext(followingPage.hasNext())
                .build();
    }

    @Override
    public FollowRelationshipDTO getRelationship(Long currentUserId, Long targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            return new FollowRelationshipDTO(false, false, false);
        }

        boolean isFollowing = followRepository.existsByFollower_IdAndFollowing_Id(currentUserId, targetUserId);
        boolean isFollowedBy = followRepository.existsByFollower_IdAndFollowing_Id(targetUserId, currentUserId);

        return FollowRelationshipDTO.builder()
                .isFollowing(isFollowing)
                .isFollowedBy(isFollowedBy)
                .isMutual(isFollowing && isFollowedBy)
                .build();
    }

    @Override
    public FollowStatsDTO getStats(Long userId) {
        long followersCount = followRepository.countByFollowing_Id(userId);
        long followingCount = followRepository.countByFollower_Id(userId);

        return FollowStatsDTO.builder()
                .followersCount(followersCount)
                .followingCount(followingCount)
                .build();
    }

    private FollowUserSummaryDTO toSummaryDTO(User user) {
        String displayName = Optional.ofNullable(user.getUsername()).orElse("Unknown User");
        return FollowUserSummaryDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(displayName)
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}
