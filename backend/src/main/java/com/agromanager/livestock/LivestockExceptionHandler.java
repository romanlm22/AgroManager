package com.agromanager.livestock;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Manejo de errores propio del módulo de ganadería. Se limita a los controllers de
 * este paquete para no tener que tocar el GlobalExceptionHandler. Mismo formato de
 * respuesta; el 409 agrega la lista de caravanas repetidas.
 */
@RestControllerAdvice(basePackages = "com.agromanager.livestock")
public class LivestockExceptionHandler {

    @ExceptionHandler(DuplicateTagNumberException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateTag(DuplicateTagNumberException ex) {
        Map<String, Object> body = baseBody(HttpStatus.CONFLICT, ex.getMessage());
        body.put("duplicates", ex.getTagNumbers());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(InvalidLivestockRequestException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidRequest(InvalidLivestockRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(baseBody(HttpStatus.BAD_REQUEST, ex.getMessage()));
    }

    private Map<String, Object> baseBody(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", status.value());
        body.put("error", message);

        return body;
    }
}
