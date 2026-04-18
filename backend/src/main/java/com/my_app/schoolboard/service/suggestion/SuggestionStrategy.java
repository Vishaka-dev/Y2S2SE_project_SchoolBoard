package com.my_app.schoolboard.service.suggestion;

public interface SuggestionStrategy {
    int score(SuggestionUserContext currentUser, SuggestionUserContext candidateUser);

    String componentName();
}
