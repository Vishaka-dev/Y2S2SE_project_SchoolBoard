package com.my_app.schoolboard.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Health check and OAuth2 configuration endpoint
 */
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Slf4j
public class HealthController {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String googleRedirectUri;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        response.put("message", "School Board API is running");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/oauth2-config")
    public ResponseEntity<Map<String, String>> oauth2Config() {
        Map<String, String> config = new HashMap<>();
        config.put("frontendUrl", frontendUrl);
        config.put("googleClientId", googleClientId.substring(0, 20) + "...");
        config.put("googleRedirectUri", googleRedirectUri);
        config.put("oauth2AuthUrl", "/oauth2/authorization/google");
        config.put("expectedSuccessRedirect", frontendUrl + "/oauth2/success?token=<JWT>");
        
        log.info("OAuth2 Configuration Requested: {}", config);
        return ResponseEntity.ok(config);
    }
}
