package com.my_app.schoolboard.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.util.SerializationUtils;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

/**
 * Cookie utility class for serializing/deserializing objects to/from cookies
 */
public class CookieUtils {

    public static Optional<Cookie> getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();

        if (cookies != null && cookies.length > 0) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    return Optional.of(cookie);
                }
            }
        }

        return Optional.empty();
    }

    public static void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        // Use response header to set cookie with SameSite attribute
        // SameSite=Lax is required for OAuth2 redirect flow
        String cookieHeader = String.format(
            "%s=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax",
            name, value, maxAge
        );
        response.addHeader("Set-Cookie", cookieHeader);
    }

    public static void deleteCookie(HttpServletRequest request, HttpServletResponse response, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null && cookies.length > 0) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    cookie.setValue("");
                    cookie.setPath("/");
                    cookie.setMaxAge(0);
                    response.addCookie(cookie);
                }
            }
        }
    }

    public static String serialize(Object object) {
        return Base64.getUrlEncoder()
                .encodeToString(SerializationUtils.serialize(object));
    }

    public static <T> T deserialize(Cookie cookie, Class<T> cls) {
        String value = cookie.getValue();
        try {
            // URL decode just in case the cookie value is double-encoded
            value = URLDecoder.decode(value, StandardCharsets.UTF_8);
            byte[] bytes = Base64.getUrlDecoder().decode(value);
            return cls.cast(SerializationUtils.deserialize(bytes));
        } catch (Exception e) {
            System.err.println("URL Decoder failed for cookie value: " + value + ". Error: " + e.getMessage());
            try {
                byte[] bytes = Base64.getDecoder().decode(value);
                return cls.cast(SerializationUtils.deserialize(bytes));
            } catch (IllegalArgumentException e2) {
                System.err.println("Standard Decoder also failed for cookie value: " + value + ". Error: " + e2.getMessage());
                throw e2;
            }
        }
    }
}
