package com.my_app.schoolboard.config;

import com.my_app.schoolboard.service.impl.CustomOAuth2UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security Configuration for JWT + OAuth2 Authentication
 * Supports both traditional JWT login and Google OAuth2 login
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final UserDetailsService userDetailsService;
        private final CustomOAuth2UserService customOAuth2UserService;
        private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
        private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
        private final org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource;
        private final CookieOAuth2AuthorizationRequestRepository cookieOAuth2AuthorizationRequestRepository;

        @Value("${app.frontend-url}")
        private String frontendUrl;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                                .csrf(csrf -> csrf.disable())
                                // Stateless session - JWT only, no server-side sessions
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                // Public endpoints
                                                .requestMatchers("/api/auth/**", "/api/health/**", "/oauth2/**",
                                                                "/login/oauth2/**")
                                                .permitAll()
                                                // Protected endpoints - require authentication
                                                .requestMatchers("/api/users/**", "/api/account/**").authenticated()
                                                // All other endpoints require authentication
                                                .anyRequest().authenticated())
                                // OAuth2 login configuration (stateless with JWT)
                                .oauth2Login(oauth2 -> oauth2
                                                .authorizationEndpoint(authorization -> authorization
                                                                .authorizationRequestRepository(
                                                                                cookieOAuth2AuthorizationRequestRepository))
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(customOAuth2UserService))
                                                .successHandler(oAuth2AuthenticationSuccessHandler)
                                                .failureHandler(oAuth2AuthenticationFailureHandler))
                                // Exception handling - return 401 for API requests instead of redirecting
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(authenticationEntryPoint()))
                                // JWT authentication filter
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        /**
         * Custom AuthenticationEntryPoint that returns 401 for API requests
         * instead of redirecting to OAuth2 login page.
         * This prevents CORS errors when AJAX requests are made without authentication.
         */
        @Bean
        public AuthenticationEntryPoint authenticationEntryPoint() {
                return (request, response, authException) -> {
                        String requestUri = request.getRequestURI();

                        // For API requests, return 401 JSON response
                        if (requestUri.startsWith("/api/")) {
                                response.setContentType("application/json");
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                response.getWriter().write(
                                                "{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                        } else {
                                // For non-API requests, redirect to OAuth2 login
                                response.sendRedirect("/oauth2/authorization/google");
                        }
                };
        }

        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
                authProvider.setPasswordEncoder(passwordEncoder());
                return authProvider;
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
