package com.my_app.schoolboard.service.suggestion;

import org.springframework.stereotype.Component;

@Component
public class SameRoleSuggestionStrategy implements SuggestionStrategy {

    public static final int WEIGHT = 30;

    @Override
    public int score(SuggestionUserContext currentUser, SuggestionUserContext candidateUser) {
        if (currentUser.getRole() == null || candidateUser.getRole() == null) {
            return 0;
        }
        return currentUser.getRole() == candidateUser.getRole() ? WEIGHT : 0;
    }

    @Override
    public String componentName() {
        return "role";
    }
}
