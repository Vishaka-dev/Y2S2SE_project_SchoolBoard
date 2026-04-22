package com.my_app.schoolboard.service.suggestion;

import org.springframework.stereotype.Component;

@Component
public class SharedInterestSuggestionStrategy implements SuggestionStrategy {

    public static final int WEIGHT = 40;

    @Override
    public int score(SuggestionUserContext currentUser, SuggestionUserContext candidateUser) {
        if (currentUser.getInterests() == null || currentUser.getInterests().isEmpty()) {
            return 0;
        }
        if (candidateUser.getInterests() == null || candidateUser.getInterests().isEmpty()) {
            return 0;
        }

        boolean hasOverlap = currentUser.getInterests().stream().anyMatch(candidateUser.getInterests()::contains);
        return hasOverlap ? WEIGHT : 0;
    }

    @Override
    public String componentName() {
        return "interest";
    }
}
