package com.my_app.schoolboard.service;

import com.my_app.schoolboard.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret-key:my-ultra-secret-and-very-long-key-for-jwt-signing-which-is-at-least-256-bits-long}")
    private String secretKey;

    @Value("${jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    /**
     * Generate JWT token for user
     */
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole().name());
        claims.put("profileCompleted", user.getProfileCompleted());

        return createToken(claims, user.getUsername());
    }

    /**
     * Create JWT token with claims
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        String token = Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();

        log.debug("Generated JWT token for user: {}", subject);
        return token;
    }

    /**
     * Generate a short-lived token specifically for confirming account deletion
     */
    public String generateDeleteAccountToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("purpose", "DELETE_ACCOUNT");
        
        Date now = new Date();
        // 10 minutes validity for delete token
        Date expiryDate = new Date(now.getTime() + 600000);

        String token = Jwts.builder()
                .claims(claims)
                .subject(user.getUsername())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();

        log.debug("Generated Delete Account token for user: {}", user.getUsername());
        return token;
    }

    /**
     * Check if token is specifically a delete account token
     */
    public boolean isDeleteAccountToken(String token) {
        try {
            String purpose = extractClaim(token, claims -> claims.get("purpose", String.class));
            return "DELETE_ACCOUNT".equals(purpose) && !isTokenExpired(token);
        } catch (Exception e) {
            log.warn("Failed to validate delete account token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extract username from token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract email from token
     */
    public String extractEmail(String token) {
        return extractClaim(token, claims -> claims.get("email", String.class));
    }

    /**
     * Extract role from token
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /**
     * Extract expiration date from token
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extract a specific claim from token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract all claims from token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Check if token is expired
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Validate token
     */
    public Boolean validateToken(String token, String username) {
        final String tokenUsername = extractUsername(token);
        return (tokenUsername.equals(username) && !isTokenExpired(token));
    }

    /**
     * Get signing key from secret
     */
    private SecretKey getSigningKey() {
        try {
            // Try URL-safe Base64 decoding first (handles '_' and '-')
            byte[] keyBytes = java.util.Base64.getUrlDecoder().decode(secretKey);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException e) {
            try {
                // Try standard Base64 decoding
                byte[] keyBytes = java.util.Base64.getDecoder().decode(secretKey);
                return Keys.hmacShaKeyFor(keyBytes);
            } catch (IllegalArgumentException e2) {
                // If not Base64, treat as raw string bytes
                byte[] keyBytes = secretKey.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                return Keys.hmacShaKeyFor(keyBytes);
            }
        }
    }
}
