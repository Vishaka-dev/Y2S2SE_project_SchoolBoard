package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

/**
 * Extracts user information from OAuth2 provider attributes
 */
@Getter
@AllArgsConstructor
public class OAuth2UserInfo {
    private final Map<String, Object> attributes;
    private final String id;
    private final String name;
    private final String email;
    private final String imageUrl;

    public static OAuth2UserInfo fromGoogle(Map<String, Object> attributes) {
        return new OAuth2UserInfo(
                attributes,
                (String) attributes.get("sub"),
                (String) attributes.get("name"),
                (String) attributes.get("email"),
                (String) attributes.get("picture")
        );
    }
}
