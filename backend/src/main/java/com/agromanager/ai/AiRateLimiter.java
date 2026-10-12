package com.agromanager.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limita cuántas consultas por hora puede hacer cada usuario, para proteger la
 * cuota de la API key. Es en memoria: se reinicia con la aplicación y no
 * funciona entre varias instancias (alcanza para este proyecto).
 */
@Component
public class AiRateLimiter {

    private static final Duration WINDOW = Duration.ofHours(1);

    private final int maxRequestsPerHour;
    private final Map<UUID, Deque<Instant>> requestsByUser = new ConcurrentHashMap<>();

    public AiRateLimiter(@Value("${app.ai.rate-limit-per-hour:30}") int maxRequestsPerHour) {
        this.maxRequestsPerHour = maxRequestsPerHour;
    }

    public void checkAndRegister(UUID userId) {
        Instant now = Instant.now();
        Instant windowStart = now.minus(WINDOW);
        Deque<Instant> timestamps = requestsByUser.computeIfAbsent(userId, id -> new ArrayDeque<>());

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(windowStart)) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxRequestsPerHour) {
                throw new AiRateLimitException(
                        "You reached the limit of " + maxRequestsPerHour
                                + " assistant requests per hour. Try again later.");
            }

            timestamps.addLast(now);
        }
    }
}
