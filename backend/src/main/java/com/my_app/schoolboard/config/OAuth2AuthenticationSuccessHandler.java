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

        // Check for delete intent
        String intendedEmail = null;
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("oauth2_delete_intent".equals(cookie.getName())) {
                    intendedEmail = cookie.getValue();
                    jakarta.servlet.http.Cookie deleteCookie = new jakarta.servlet.http.Cookie("oauth2_delete_intent", null);
                    deleteCookie.setMaxAge(0);
                    deleteCookie.setPath("/");
                    response.addCookie(deleteCookie);
                    break;
                }
            }
        }

        if (intendedEmail != null) {
            log.info("Processing OAuth2 callback for DELETE_ACCOUNT intent for email: {}", intendedEmail);
            if (!intendedEmail.equals(oAuth2User.getEmail())) {
                log.warn("Email mismatch during delete intent! Expected {}, got {}", intendedEmail, oAuth2User.getEmail());
                String errorUrl = frontendUrl + "/login?error=delete_account_mismatch";
                getRedirectStrategy().sendRedirect(request, response, errorUrl);
                return;
            }
            
            String deleteToken = jwtService.generateDeleteAccountToken(oAuth2User.getUser());
            String targetUrl = frontendUrl + "/confirm-delete?token=" + deleteToken;
            log.info("Redirecting to confirmation page: {}", targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
            return;
        }

        // Generate JWT token for the standard OAuth2 login
        String token = jwtService.generateToken(oAuth2User.getUser());
        log.info("JWT token generated (length: {})", token.length());

        // Redirect to frontend with JWT token (stateless)
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/success")
                .queryParam("token", token)
                .queryParam("profileCompleted", oAuth2User.getUser().getProfileCompleted())
                .build()
                .toUriString();

        log.info("Constructed redirect URL: {}", targetUrl);
        log.info("Redirecting to: {}", targetUrl);

        // Safety check for empty frontendUrl
        if (frontendUrl == null || frontendUrl.trim().isEmpty() || frontendUrl.contains("3000")) {
            log.warn(
                    "WARNING: frontendUrl seems incorrect or empty: '{}'. If this is 3000, please check your .env and restart the backend.",
                    frontendUrl);
        }

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
