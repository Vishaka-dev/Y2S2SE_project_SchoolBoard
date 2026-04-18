package com.my_app.schoolboard.service.suggestion;

import com.my_app.schoolboard.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestionUserContext {
    private Long userId;
    private Role role;
    private String province;
    private String institutionName;
    private Set<String> interests;
}
