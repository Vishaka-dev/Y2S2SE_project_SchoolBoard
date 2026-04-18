package com.my_app.schoolboard.service.suggestion;

import org.springframework.stereotype.Component;

@Component
public class SameInstitutionSuggestionStrategy implements SuggestionStrategy {

    public static final int WEIGHT = 50;

    @Override
    public int score(SuggestionUserContext currentUser, SuggestionUserContext candidateUser) {
        if (isBlank(currentUser.getInstitutionName()) || isBlank(candidateUser.getInstitutionName())) {
            return 0;
        }

        return normalize(currentUser.getInstitutionName()).equals(normalize(candidateUser.getInstitutionName()))
                ? WEIGHT
                : 0;
    }

    @Override
    public String componentName() {
        return "institution";
    }

    private String normalize(String value) {
        return value.trim().toLowerCase();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
