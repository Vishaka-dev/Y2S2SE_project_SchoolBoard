package com.my_app.schoolboard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

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
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register /ws endpoint for WebSocket connections
        registry.addEndpoint("/ws")
                .setAllowedOrigins(frontendUrl)
                .withSockJS();  // Enable SockJS fallback for browsers without WebSocket support
    }
}
