package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestionUserDTO {
    private Long id;
    private String username;
    private String displayName;
    private String profileImageUrl;
    private Role role;
    private int score;
    private int institutionScore;
    private int sharedInterestScore;
    private int roleScore;
    private int provinceScore;
}
