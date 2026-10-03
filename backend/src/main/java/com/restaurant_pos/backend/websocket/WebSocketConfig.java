package com.restaurant_pos.backend.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final WebSocketBroadcaster broadcaster;

    public WebSocketConfig(WebSocketBroadcaster broadcaster) {
        this.broadcaster = broadcaster;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(handler(), "/ws")
                .setAllowedOriginPatterns("*");
    }

    private WebSocketHandler handler() {
        return new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(
                    org.springframework.web.socket.WebSocketSession session) {
                broadcaster.addSession(session);
            }

            @Override
            public void afterConnectionClosed(
                    org.springframework.web.socket.WebSocketSession session,
                    org.springframework.web.socket.CloseStatus status) {
                broadcaster.removeSession(session);
            }
        };
    }
}
