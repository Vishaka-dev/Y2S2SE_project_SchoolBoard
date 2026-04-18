package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.SuggestionPageDTO;

public interface SuggestionService {
    SuggestionPageDTO getSuggestions(String username, int page, int size);
}
