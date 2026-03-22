package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.UserSearchResultDTO;
import org.springframework.data.domain.Page;

public interface UserSearchService {
    Page<UserSearchResultDTO> searchUsers(String query, int page, int size);
}
