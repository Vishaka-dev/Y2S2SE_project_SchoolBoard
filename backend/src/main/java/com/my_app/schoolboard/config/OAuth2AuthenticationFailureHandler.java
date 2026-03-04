package com.my_app.schoolboard.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * OAuth2 Authentication Failure Handler
 * Redirects user to frontend with error message
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final CookieOAuth2AuthorizationRequestRepository cookieOAuth2AuthorizationRequestRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException {

        // Sanitize exception message to avoid CR/LF header errors
        String errorMessage = exception.getLocalizedMessage();
        if (errorMessage != null) {
            errorMessage = errorMessage.replaceAll("[\\r\\n]", " ");
        }

        // Clear OAuth2 authorization cookies
        cookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
        log.info("OAuth2 authorization cookies cleared after failure");

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                .queryParam("error", errorMessage)
                .build()
                .toUriString();

        log.info("Redirecting to failure URL: {}", targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
