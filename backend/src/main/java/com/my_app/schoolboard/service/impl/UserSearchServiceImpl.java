package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.UserSearchResultDTO;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.UserSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserSearchServiceImpl implements UserSearchService {

    private final UserRepository userRepository;

    @Override
    public Page<UserSearchResultDTO> searchUsers(String query, int page, int size) {
        String normalizedQuery = query == null ? "" : query.trim();
        if (normalizedQuery.isBlank() || normalizedQuery.length() < 1) {
            return new PageImpl<>(List.of(), PageRequest.of(page, size), 0);
        }

        return userRepository.searchByUsername(normalizedQuery, PageRequest.of(page, size))
                .map(this::toSearchResultDTO);
    }

    private UserSearchResultDTO toSearchResultDTO(User user) {
        return UserSearchResultDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getUsername())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}
