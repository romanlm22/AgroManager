package com.agromanager.ai;

import java.util.List;

/**
 * Contrato para conversar con un modelo de lenguaje.
 *
 * Ninguna otra clase del proyecto debe conocer qué proveedor lo implementa
 * (hoy Google Gemini). Para cambiar de proveedor alcanza con una
 * implementación nueva de esta interfaz.
 */
public interface AiClient {

    String chat(String systemPrompt, List<ChatMessage> messages);
}
