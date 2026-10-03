package com.restaurant_pos.backend.websocket;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Service
public class WebSocketBroadcaster {

    private final ObjectMapper objectMapper;
    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    public WebSocketBroadcaster(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void addSession(WebSocketSession session) {
        sessions.add(session);
    }

    public void removeSession(WebSocketSession session) {
        sessions.remove(session);
    }

    public void broadcast(WebSocketEvent event) {
        final TextMessage message;
        try {
            message = new TextMessage(objectMapper.writeValueAsString(event));
        } catch (JacksonException exception) {
            return;
        }

        for (WebSocketSession session : sessions) {
            if (!session.isOpen()) {
                sessions.remove(session);
                continue;
            }

            try {
                session.sendMessage(message);
            } catch (IOException exception) {
                sessions.remove(session);
                try {
                    session.close();
                } catch (IOException ignored) {
                    // The disconnected session is already removed.
                }
            }
        }
    }
}
