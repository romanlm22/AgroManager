package com.agromanager.ai;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * La conversación completa la mantiene el cliente: en cada pedido manda el
 * historial y el servidor no guarda nada. El último mensaje debe ser del usuario.
 */
public record ChatRequest(

        @NotEmpty(message = "At least one message is required")
        @Size(max = 20, message = "At most 20 messages are allowed")
        List<@Valid ChatMessage> messages
) {}
