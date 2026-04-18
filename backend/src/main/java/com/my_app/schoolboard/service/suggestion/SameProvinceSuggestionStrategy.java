package com.my_app.schoolboard.service.suggestion;

import org.springframework.stereotype.Component;

@Component
public class SameProvinceSuggestionStrategy implements SuggestionStrategy {

    public static final int WEIGHT = 10;

    @Override
    public int score(SuggestionUserContext currentUser, SuggestionUserContext candidateUser) {
        if (isBlank(currentUser.getProvince()) || isBlank(candidateUser.getProvince())) {
            return 0;
        }

        return normalize(currentUser.getProvince()).equals(normalize(candidateUser.getProvince()))
                ? WEIGHT
                : 0;
    }

    @Override
    public String componentName() {
        return "province";
    }

    private String normalize(String value) {
        return value.trim().toLowerCase();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
