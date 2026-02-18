package com.my_app.schoolboard.config;

import com.my_app.schoolboard.service.JwtService;
import com.my_app.schoolboard.service.impl.CustomOAuth2User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * OAuth2 Authentication Success Handler
 * Generates JWT token and redirects user to frontend with token
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final CookieOAuth2AuthorizationRequestRepository cookieOAuth2AuthorizationRequestRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                       HttpServletResponse response, 
                                       Authentication authentication) throws IOException {
        
        log.info("=== OAuth2 Authentication Success Handler Called ===");
        log.info("Frontend URL configured: {}", frontendUrl);
        
        if (response.isCommitted()) {
            log.warn("Response has already been committed. Unable to redirect.");
            return;
        }

        // Clear OAuth2 authorization cookies
        cookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
        log.info("OAuth2 authorization cookies cleared");

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        log.info("Authenticated user: {} ({})", oAuth2User.getUsername(), oAuth2User.getEmail());
        
        // Generate JWT token for the OAuth2 user
        String token = jwtService.generateToken(oAuth2User.getUser());
        log.info("JWT token generated (length: {})", token.length());
        
        // Redirect to frontend with JWT token (stateless)
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/success")
                .queryParam("token", token)
                .build()
                .toUriString();

        log.info("Full redirect URL: {}", targetUrl);
        log.info("=== Redirecting to Frontend ===");
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
