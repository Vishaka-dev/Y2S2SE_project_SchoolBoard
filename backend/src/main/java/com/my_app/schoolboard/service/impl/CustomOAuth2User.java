package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.model.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

/**
 * Custom OAuth2User implementation that wraps our User entity
 */
@Getter
public class CustomOAuth2User implements OAuth2User {

    private final Map<String, Object> attributes;
    private final User user;

    public CustomOAuth2User(Map<String, Object> attributes, User user) {
        this.attributes = attributes;
        this.user = user;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
    }

    @Override
    public String getName() {
        return user.getEmail();
    }

    public Long getId() {
        return user.getId();
    }

    public String getEmail() {
        return user.getEmail();
    }

    public String getUsername() {
        return user.getUsername();
    }
}
