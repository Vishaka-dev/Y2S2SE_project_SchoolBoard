package com.my_app.schoolboard.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import com.my_app.schoolboard.service.JwtService;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Autowired(required = false)
    private JwtService jwtService;

    /**
     * Configure the message broker for handling subscriptions and broadcasts
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable in-memory message broker for /topic and /queue destinations
        config.enableSimpleBroker("/topic", "/queue");
        
        // Set the prefix for application destination endpoints
        config.setApplicationDestinationPrefixes("/app");
        
        // Set user destination prefix for private messages
        config.setUserDestinationPrefix("/user");
    }

    /**
     * Register WebSocket endpoints for STOMP connections
     * Allow public access to /ws endpoint, authentication handled via JWT in STOMP headers
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register /ws endpoint for WebSocket connections
        // Allow all origins for WebSocket (SockJS handles the actual protocol)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();  // Enable SockJS fallback for browsers without WebSocket support
    }
}
