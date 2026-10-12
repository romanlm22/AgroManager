package com.agromanager.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Única clase del proyecto que conoce la URL y el formato de Google Gemini
 * (API generateContent). Implementa {@link AiClient}.
 *
 * La API key se lee de la propiedad app.ai.gemini.api-key, que a su vez sale de
 * la variable de entorno GEMINI_API_KEY. Nunca se escribe en el código ni se
 * commitea.
 */
@Component
public class GeminiClient implements AiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public GeminiClient(
            RestClient.Builder restClientBuilder,
            @Value("${app.ai.gemini.base-url:https://generativelanguage.googleapis.com}") String baseUrl,
            @Value("${app.ai.gemini.api-key:}") String apiKey,
            @Value("${app.ai.gemini.model:gemini-3.5-flash-lite}") String model) {

        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(45));

        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public String chat(String systemPrompt, List<ChatMessage> messages) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiNotConfiguredException(
                    "The AI assistant is not configured: GEMINI_API_KEY is missing");
        }

        List<Map<String, Object>> contents = new ArrayList<>();
        for (ChatMessage message : messages) {
            contents.add(Map.of(
                    "role", message.role() == ChatRole.USER ? "user" : "model",
                    "parts", List.of(Map.of("text", message.content()))));
        }

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", contents,
                "generationConfig", Map.of(
                        "temperature", 0.3,
                        "maxOutputTokens", 2048));

        GeminiResponse response;

        try {
            response = restClient.post()
                    .uri("/v1beta/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .body(body)
                    .retrieve()
                    .body(GeminiResponse.class);
        } catch (RestClientResponseException e) {
            int status = e.getStatusCode().value();
            log.warn("Gemini responded with HTTP {}: {}", status, e.getResponseBodyAsString());

            if (status == 429) {
                throw new AiProviderException(
                        "The AI provider is temporarily out of quota. Try again in a few minutes.", e);
            }
            throw new AiProviderException("The AI provider returned an error (HTTP " + status + ")", e);
        } catch (RestClientException e) {
            log.warn("Unable to reach Gemini", e);
            throw new AiProviderException("Unable to reach the AI provider", e);
        }

        String text = extractText(response);

        if (text.isBlank()) {
            throw new AiProviderException("The AI provider returned an empty answer. Try rephrasing.");
        }

        return text.trim();
    }

    private String extractText(GeminiResponse response) {
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            return "";
        }

        Content content = response.candidates().get(0).content();
        if (content == null || content.parts() == null) {
            return "";
        }

        StringBuilder text = new StringBuilder();
        for (Part part : content.parts()) {
            if (part.text() != null) {
                text.append(part.text());
            }
        }
        return text.toString();
    }

    // --- DTOs internos, solo para deserializar la respuesta de Gemini.

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GeminiResponse(List<Candidate> candidates) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Candidate(Content content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Content(List<Part> parts) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Part(String text) {}
}
